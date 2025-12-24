# src/backend/news.py
import feedparser
from fastapi import APIRouter

from fastapi import FastAPI, Request, HTTPException
import urllib.parse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import requests, bs4


router = APIRouter()

"""
new
Campus News                             https://news.ucsc.edu/rss  or https://news.ucsc.edu/wp-json/wp/v2/posts/
Arts & Culture                          https://news.ucsc.edu/topics/arts-culture/rss              https://news.ucsc.edu/?_topics=arts-culture
Climate & Sustainability                https://news.ucsc.edu/topics/climate-sustainability/rss    https://news.ucsc.edu/?_topics=climate-sustainability
Earth & Space                           https://news.ucsc.edu/topics/earth-space/rss               https://news.ucsc.edu/?_topics=earth-space
Health                                  https://news.ucsc.edu/topics/health/rss                    https://news.ucsc.edu/?_topics=health
Social Justice & Community              https://news.ucsc.edu/topics/social-justice-community/rss  https://news.ucsc.edu/?_topics=social-justice-community
Student Experience                      https://news.ucsc.edu/topics/student-experience/rss        https://news.ucsc.edu/?_topics=student-experience
Technology                              https://news.ucsc.edu/topics/technology/rss                https://news.ucsc.edu/?_topics=technology
Baskin Engineering Undergrad Newsletter https://undergrad.engineering.ucsc.edu/rss                 
BE Community News                       https://engineering.ucsc.edu/topics/news/rss         

the news.ucsc.edu rss feeds have the title, link, summary but not the date
the date is only accessible in the ?_topic= api response. For those sites, use both to get the api.
"""

async def getRSSFeedWithScraping(topic: str) -> list[dict]:
    # make a request to the topic page, and extract the title and dates
    response: requests.Response = requests.post(
        'https://news.ucsc.edu/wp-json/facetwp/v1/refresh',
        headers={
            'Referer': f'https://news.ucsc.edu/?_topics={topic}',
            'content-type': 'application/json',
        },
        json={
            "action": "facetwp_refresh",
            "data": {
                "facets": {"topics": [topic]},
                "frozen_facets": {},
                "http_params": {"get": {"_topics": topic}, "uri": "", "url_vars": []},
                "template": "explore_stories",
                "extras": {"sort": "default", "per_page": 100},
                "soft_refresh": 0,
                "is_bfcache": 1,
                "first_load": 0,
                "paged": 1
            }
        }
    )
    
    api_data = response.json()
    soup: bs4.BeautifulSoup = bs4.BeautifulSoup(api_data["template"], 'lxml')

    resultArticles = soup.find_all(class_='fwpl-result')
    articleToDate: dict[str, str] = {}
    for article in resultArticles:
        title: str = article.find(class_='ucsc-explore-stories__title').get_text(strip=True)
        date: str = article.find(class_='ucsc-explore-stories__date').get_text(strip=True)
        
        articleToDate[title] = date

   
    # extract stuff out of the rss feed
    feed = feedparser.parse(f'https://news.ucsc.edu/topics/{topic}/rss')
    return [
        {
            "title": entry.title,
            "link": entry.link,
            "summary": entry.summary,
            "published": articleToDate[entry.title]
        }
        for entry in feed.entries if entry.title in articleToDate
    ]

async def getRSSFeed(url: str):
    feed = feedparser.parse(url)
    return [
        {
            "title": entry.title,
            "link": entry.link,
            "summary": bs4.BeautifulSoup(entry.summary, 'lxml').get_text(strip=True).replace(' ...Read more', '...'),
            "published": entry.published
        }
        for entry in feed.entries
    ]


    
@router.get("/rss/artsculture")
async def getRSSArtsCulture():
    return await getRSSFeedWithScraping('arts-culture')

@router.get("/rss/climate-sustainability")
async def getRSSClimateSustainability():
    return await getRSSFeedWithScraping('climate-sustainability')

@router.get("/rss/earth-space")
async def getRSSEarthSpace():
    return await getRSSFeedWithScraping('earth-space')

@router.get("/rss/health")
async def getRSSHealth():
    return await getRSSFeedWithScraping('health')

@router.get("/rss/social-justice-community")
async def getRSSSocialJusticeCommunity():
    return await getRSSFeedWithScraping('social-justice-community')

@router.get("/rss/student-experience")
async def getRSSStudentExperience():
    return await getRSSFeedWithScraping('student-experience')

@router.get("/rss/technology")
async def getRSSTechnology():
    return await getRSSFeedWithScraping('technology')

@router.get("/rss/newsletter")
async def getNewsLetter():
    return await getRSSFeed('https://undergrad.engineering.ucsc.edu/rss')

@router.get("/rss/be-news")
async def getBENews():
    return await getRSSFeed('https://engineering.ucsc.edu/topics/news/rss')

@router.get("/rss/campus-news")
async def getCampusNews():
    # this endpoint returns a list of the latest posts on the webpage
    # category 1 is "campus news" (see https://news.ucsc.edu/wp-json/wp/v2/categories)
    # filter out all news that isnt in that category
    response: requests.Response = requests.get('https://news.ucsc.edu/wp-json/wp/v2/posts/')
    apiData = response.json()
    campusNews = list(filter(lambda x: 1 in x["categories"], apiData))
    return [
        {
            "title": entry["title"]["rendered"],
            "link": entry["link"],
            "summary": bs4.BeautifulSoup(entry["excerpt"]["rendered"], 'lxml').get_text(strip=True),
            "published": entry["date"]
        }
        for entry in campusNews
    ]
