from fastapi import FastAPI, Request, HTTPException
from enum import Enum
import requests
from bs4 import BeautifulSoup, Tag
from datetime import datetime, timedelta

api: FastAPI = FastAPI()

BASE_URL = 'https://nutrition.sa.ucsc.edu/'
MEAL_URL = '&mealName='

LONGMENU_URL = 'longmenu.aspx?naFlag=1&locationNum=' 
SHORTMENU_URL = 'shortmenu.aspx?naFlag=1&locationNum='

EMOJIS = { 'veggie': '🥦', 'vegan': '🌱', 'halal': '🍖', 'eggs': '🥚', 'beef': '🐮', 'milk': '🥛', 'fish': '🐟', 'alcohol': '🍷', 'gluten': '🍞', 'soy': '🫘', 'treenut': '🥥', 'sesame': '𓇢', 'pork': '🐷', 'shellfish': '🦐', 'nuts': '🥜', 'wheat': '🌾'}

class Location(Enum):
    CowellStevenson = '05'
    CrownMerrill = '20'
    NineTen = '40'
    PorterKresge = '25'
    RachelCarsonOakes = '30'

LOCATION_MAP = {
    'Cowell/Stevenson': Location.CowellStevenson,
    'Crown/Merrill': Location.CrownMerrill,
    'Nine/Ten': Location.NineTen,
    'Porter/Kresge': Location.PorterKresge,
    'Carson/Oakes': Location.RachelCarsonOakes
}

class LocationRequest(Enum):
    CowellStevenson = 'Cowell/Stevenson'
    CrownMerrill = 'Crown/Merrill'
    NineTen = 'Nine/Ten'
    PorterKresge = 'Porter/Kresge'
    RachelCarsonOakes = 'Carson/Oakes'


# Store menu cache in dictionary, with locationNum and date as a key, menu, timestamp as value

# CACHE_AGE_SECONDS = 60 * 60 * 24 / 2 # Refresh 2 times a day
# menu_cache = {}

# def get_menu_cache(locationNum: str, date: str) -> dict:
#     if locationNum not in menu_cache:
#         return None
#     if date not in menu_cache[locationNum]:
#         return None
#     if 'timestamp' not in menu_cache[locationNum][date]:
#         return None
#     print((datetime.now() - (menu_cache[locationNum][date]['timestamp'])).total_seconds())
#     if (datetime.now() - menu_cache[locationNum][date]['timestamp']).total_seconds() > CACHE_AGE_SECONDS:
#         return None
#     if 'menu' not in menu_cache[locationNum][date]:
#         return None
#     if menu_cache[locationNum][date]['menu'] is None:
#         return None
#     if menu_cache[locationNum][date]['menu'] == {}:
#         return None
#     return menu_cache[locationNum][date]['menu']

# def set_menu_cache(locationNum: str, date: str, menu: dict) -> None:
#     if locationNum not in menu_cache:
#         menu_cache[locationNum] = {}
    
#     if date not in menu_cache[locationNum]:
#         menu_cache[locationNum][date] = {}
#     menu_cache[locationNum][date]['menu'] = menu
#     menu_cache[locationNum][date]['timestamp'] = datetime.now()


def fetch_website_html(url: str, locationNum: str, meal: str = '', date: str = '') -> str:
    full_url = url + locationNum + ((MEAL_URL + meal) if meal != '' else '')
    if date != '':
        date_str = date.replace('/', '%2F')
        full_url += f'&dtdate={date_str}'

    cookies = {
        'WebInaCartLocation': locationNum,
        'WebInaCartDates': '',
        'WebInaCartMeals': '',
        'WebInaCartQtys': '',
        'WebInaCartRecipes': ''
    }

    response = requests.get(full_url, cookies=cookies)
    return response.text

def calculate_date(day_offset: int) -> str:
    date = datetime.now() + timedelta(days=day_offset)
    date_str = date.strftime('%m/%d/%Y')
    return date_str

def get_all_menus(day_offset: int = 0) -> str:
    menus = {}
    for location in LOCATION_MAP:
        locationNum = LOCATION_MAP[location].value
        menu = get_short_menu(locationNum, day_offset)
        menus[location] = menu
    return menus

def get_short_menu(locationNum: str, day_offset: int = 0) -> str:
    url = BASE_URL + SHORTMENU_URL

    date_str = calculate_date(day_offset)
    
    # cached_menu = get_menu_cache(locationNum, date_str)
    # print(f'Cached menu: {cached_menu}')
    # if cached_menu is not None:
        # return cached_menu

    html = fetch_website_html(url, locationNum, '', date_str)
    soup = BeautifulSoup(html, 'lxml')

    menu = {}

    meals = soup.select('body > table > table:nth-of-type(1) > tr > td > table')

    for meal in meals:
        food_items = {}
        meal_name = meal.find('div', {'class': 'shortmenumeals'})

        if meal_name is None:
            continue
        meal_name = meal_name.text.strip()

        current_group = ''

        for food in meal.select('td > table > tr:nth-child(2) > td > table:nth-child(1)')[0].children:
            if not isinstance(food, Tag):
                continue
            divider = food.find('div', class_='shortmenucats')
            if divider is not None:
                current_group = divider.text.replace('--', '').strip()
                food_items[current_group] = {}
                continue

            food_name = food.find('div', class_='shortmenurecipes')
            food_name = food_name.text.strip()

            restrictions = []
            for restriction in food.select('img'):
                restriction_name = restriction['src'].split('/')[-1].split('.')[0]
                restrictions.append(EMOJIS[restriction_name] if restriction_name in EMOJIS else restriction_name)
                print(restriction_name)

            food_items[current_group][food_name] = {
                'name': food_name,
                'restrictions': restrictions,
            }

        menu[meal_name] = food_items

    # set_menu_cache(locationNum, date_str, menu)
    # print(f'Set menu of {locationNum}, {date_str}: {menu['Breakfast']['Breakfast'][1]}')
    return menu