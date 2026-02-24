from fastapi import APIRouter
from enum import Enum
import httpx
from bs4 import BeautifulSoup, Tag, ResultSet
from bs4.element import PageElement
from typing import Iterator
from datetime import datetime, timedelta
import asyncio
import httpx, requests
import json

router = APIRouter()

BASE_URL: str = 'https://nutrition.sa.ucsc.edu/'
MEAL_URL: str = '&mealName='

LONGMENU_URL: str = 'longmenu.aspx?naFlag=1&locationNum=' 
SHORTMENU_URL: str = 'shortmenu.aspx?naFlag=1&locationNum='

EMOJIS: dict[str, str] = { 
	'veggie': '🥦', 
	'vegan': '🌱', 
	'halal': '🍖', 
	'eggs': '🥚', 
	'beef': '🐮', 
	'milk': '🥛', 
	'fish': '🐟', 
	'alcohol': '🍷', 
	'gluten': '🍞', 
	'soy': '🫘', 
	'treenut': '🥥', 
	'sesame': '𓇢', 
	'pork': '🐷', 
	'shellfish': '🦐', 
	'nuts': '🥜', 
	'wheat': '🌾'
}

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


@router.get('/menu')
async def GetAllMenus(dayOffset: int = 0):
	menuData: dict[str, dict] = {}
	with open('cache/menus.json', 'r', encoding='utf-8') as f:
		menuData = json.load(f)

	return menuData[str(dayOffset)] if str(dayOffset) in menuData else {"error": "No menu available for this day"}

# this endpoint isnt even called, getting rid of it for now
# @router.get("/menu/{location}")
# async def get_menu(location: str):
# 	if location not in LOCATION_MAP: return {"error": "Invalid Location"}

# 	# start_time = datetime.now()
# 	shortmenu = await get_short_menu(LOCATION_MAP[location].value, 0)
# 	# print("Time taken to get shor?t menu:", datetime.now() - start_time)
# 	return shortmenu


def calculate_date(day_offset: int) -> str:
	date: datetime = datetime.now() + timedelta(days=day_offset)
	return date.strftime('%m/%d/%Y')


async def get_all_menus(client: httpx.AsyncClient, day_offset: int = 0):
	tasks = [get_short_menu(client, LOCATION_MAP[location].value, day_offset) for location in LOCATION_MAP.keys()]
	results = await asyncio.gather(*tasks)
	return dict(zip(LOCATION_MAP.keys(), results))


async def get_short_menu(client: httpx.AsyncClient, locationNum: str, day_offset: int = 0) -> dict:
	fullURL: str = BASE_URL + SHORTMENU_URL + locationNum + f'&dtdate={calculate_date(day_offset)}'
	response = await client.get(fullURL, cookies={
		'WebInaCartLocation': locationNum,
		'WebInaCartDates': '',
		'WebInaCartMeals': '',
		'WebInaCartQtys': '',
		'WebInaCartRecipes': ''
	},
	headers={
		"Connection": "close"
	})

	soup: BeautifulSoup = BeautifulSoup(response.text, 'lxml')
	meals: ResultSet[Tag] = soup.select('body > table > table:nth-of-type(1) > tr > td > table')
	menu: dict = {}

	for meal in meals:
		foodItems = {}
		mealName = meal.find('div', {'class': 'shortmenumeals'})

		if mealName is None: continue
		mealName = mealName.text.strip()

		currentGroup: str = ''
		foods: Iterator[PageElement] = meal.select('td > table > tr:nth-child(2) > td > table:nth-child(1)')[0].children
		for food in foods:
			if not isinstance(food, Tag): continue
			
			divider = food.find('div', class_='shortmenucats')
			if divider is not None:
				currentGroup = divider.text.replace('--', '').strip()
				foodItems[currentGroup] = {}
				continue

			foodName = food.find('div', class_='shortmenurecipes')
			if not foodName: continue

			foodName = foodName.text.strip()

			restrictions: list[str] = []
			for restriction in food.select('img'):
				restriction_name = str(restriction['src']).split('/')[-1].split('.')[0]
				restrictions.append(EMOJIS[restriction_name] if restriction_name in EMOJIS else restriction_name)

			foodItems[currentGroup][foodName] = {
				'name': foodName,
				'restrictions': restrictions,
			}

		menu[mealName] = foodItems

	return menu

# dedicated function to cache menus. intended to be run via cron job.
async def CacheMenus() -> None:
	print("Caching menus...")
	startTime: datetime = datetime.now()

	async with httpx.AsyncClient() as client:
		tasks: list = [get_all_menus(client, i) for i in range(8)]
		results: list = await asyncio.gather(*tasks)
		data: dict[int, dict] = dict(enumerate(results))
	
	with open('cache/menus.json', 'w', encoding='utf-8') as f:
		json.dump(data, f)
	
	print("Finished caching menus. Time taken:", datetime.now() - startTime)

if __name__ == "__main__":
	asyncio.run(CacheMenus())