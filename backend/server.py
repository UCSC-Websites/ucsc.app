from fastapi import FastAPI, Request, HTTPException
import scraper
import urllib.parse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import news, AI
from typing import Optional
import menu
# from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import uvicorn

api: FastAPI = FastAPI()
api.add_middleware(
    CORSMiddleware, 
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



@api.get("/courses")
async def getAllCourses(
    term: str, 
    regStatus: str = "O",
    department: str = "", 
    catalogOp: str = "contains", 
    catalogNum: str = "", 
    titleKeyword: str = "",
    instructorNameOp: str = "=",
    instructorName: str = "",
    ge: str = "",
    crseUnitsOp: str = "=",
    crseUnitsFrom: str = "",
    crseUnitsTo: str = "",
    crseUnitsExact: str = "",
    meetingDays: str = "",
    meetingTimes: str = "",
    acadCareer: str = "",
    asynch: str = "A",
    hybrid: str = "H",
    synch: str = "S",
    person: str = "P"
):
    return scraper.queryPisa(term, regStatus, department, catalogOp, catalogNum, titleKeyword, instructorNameOp, instructorName, ge, crseUnitsOp, crseUnitsFrom, crseUnitsTo, crseUnitsExact, meetingDays, meetingTimes, acadCareer, asynch, hybrid, synch, person)

@api.get("/test")
async def getPath():
    return {"hello": "world"}

@api.get("/menu")
async def get_menu(location: menu.LocationRequest, day_offset: int = 0):
    start_time = datetime.now()
    shortmenu = menu.get_short_menu(menu.LOCATION_MAP[location.value].value, day_offset)
    print("Time taken to get short menu:", datetime.now() - start_time)
    return shortmenu

api.include_router(news.router)
api.include_router(AI.router)

@api.get('/all_menus')
async def get_all_menus(day_offset: int = 0):
    start_time = datetime.now()
    menus = menu.get_all_menus(day_offset)
    print("Time taken to get all menus:", datetime.now() - start_time)
    return menus

if __name__ == '__main__':
    uvicorn.run('server:api', host='0.0.0.0', port=8200, reload=True)



