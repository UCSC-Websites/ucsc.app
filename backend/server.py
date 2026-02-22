from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import endpoints.scraper as scraper
import endpoints.menu as menu
import endpoints.news as news
from locations import locations
from contextlib import asynccontextmanager
import uvicorn, httpx

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

@api.get("/test")
async def getPath():
    return {"hello": "world"}

api.include_router(news.router)
api.include_router(locations.router)
api.include_router(menu.router)
api.include_router(scraper.router)

if __name__ == '__main__':
    uvicorn.run('server:api', host='0.0.0.0', port=8000, reload=True)



