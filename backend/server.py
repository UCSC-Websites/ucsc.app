from fastapi import FastAPI
import scraper
from fastapi.middleware.cors import CORSMiddleware
import news, AI, menu
from locations import locations
from contextlib import asynccontextmanager
from datetime import datetime
import uvicorn
import httpx

http_client: httpx.AsyncClient

# this function runs on startup
@asynccontextmanager
async def lifespan(app: FastAPI):
    global http_client
    http_client = httpx.AsyncClient()
    locations.startup()
    await news.UpdateFeed()
    yield
    await http_client.aclose()

api = FastAPI(lifespan=lifespan)
api.add_middleware(
    CORSMiddleware, 
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@api.get("/courses/terms")
async def getTerms():
    return scraper.getTerms()

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
    shortmenu = await menu.get_short_menu(http_client, menu.LOCATION_MAP[location.value].value, day_offset)
    print("Time taken to get short menu:", datetime.now() - start_time)
    return shortmenu

api.include_router(news.router)
api.include_router(AI.router)
api.include_router(locations.router)

@api.get('/all_menus')
async def get_all_menus(day_offset: int = 0):
    start_time = datetime.now()
    menus = await menu.get_all_menus(http_client, day_offset)
    print("Time taken to get all menus:", datetime.now() - start_time)
    return menus

if __name__ == '__main__':
    uvicorn.run('server:api', host='0.0.0.0', port=8000, reload=True)



