import feedparser, requests, bs4
from fastapi import APIRouter, BackgroundTasks
from datetime import datetime, timezone
from urllib.parse import unquote


router = APIRouter()
cacheControl: datetime = datetime.now()
tagToName: dict = {}
nameToTag: dict = {}
feed: list = []
authorCache: dict = {}

def GetTextFromRendered(rendered: str) -> str:
    return bs4.BeautifulSoup(rendered, 'lxml').get_text(strip=True)

async def GetTagMap() -> None:
    response: requests.Response = requests.get('https://news.ucsc.edu/wp-json/wp/v2/categories')
    apiData: dict = response.json()
    global tagToName
    tagToName.clear()
    for category in apiData:
        id, name = category["id"], category["name"].replace('&amp;', '&')
        
        tagToName[id] = name
        nameToTag[name] = id
    
    tagToName[-10] = "Baskin Undergrad Newsletter"
    nameToTag["Baskin Undergrad Newsletter"] = -10

    tagToName[-11] = "Baskin Community News"
    nameToTag["Baskin Community News"] = -11

"""
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


update: https://news.ucsc.edu/wp-json/wp/v2/posts?per_page=100
https://news.ucsc.edu/wp-json/wp/v2/categories
"""

async def UpdateFeed():
    print('updating cache')
    global feed, cacheControl
    await GetTagMap()
    await GetArticles()
    beNewsletterPosts: list[dict] = await getRSSFeed('https://undergrad.engineering.ucsc.edu/rss', -10)
    beCommunityNews: list[dict] = await getRSSFeed('https://engineering.ucsc.edu/topics/news/rss', -11)

    feed = feed + beNewsletterPosts + beCommunityNews
    feed = sorted(feed, key=lambda a: datetime.fromisoformat(a["published"]), reverse=True)
    cacheControl = datetime.now()



async def GetArticles() -> None:
    response: requests.Response = requests.get('https://news.ucsc.edu/wp-json/wp/v2/posts?per_page=100')
    apiData: dict = response.json()
    feed.clear()
    for articleInfo in apiData:
        dt = datetime.fromisoformat(articleInfo["date_gmt"])
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
            
        feed.append({
            "title": GetTextFromRendered(articleInfo["title"]["rendered"]),
            "link": articleInfo["link"],
            "summary": GetTextFromRendered(articleInfo["excerpt"]["rendered"]),
            "published": dt.isoformat(),
            "categories": list(map(lambda x: tagToName[x], articleInfo["categories"]))
        })



async def getRSSFeed(url: str, category: int) -> list[dict]:
    feed: feedparser.FeedParserDict = feedparser.parse(url)
    return [
        {
            "title": entry.title,
            "link": entry.link,
            "summary": GetTextFromRendered(entry.summary).replace(' ...Read more', '...'), #type: ignore
            "published": datetime.strptime(str(entry.published), '%a, %d %b %Y %H:%M:%S %z').isoformat(),
            "categories": [tagToName[category]]
        }
        for entry in feed.entries
    ]


c: list[str] = [
    "Campus News",
    "Arts & Culture",
    "Climate & Sustainability",
    "Earth & Space",
    "Health",
    "Social Justice & Community",
    "Student Experience",
    "Technology",
    "Baskin Undergrad Newsletter",
    "Baskin Community News"
]

@router.get("/rss")
async def getAll(bgTasks: BackgroundTasks, categories: int|None = None):
    if (datetime.now() - cacheControl).total_seconds() > 86400: 
        bgTasks.add_task(UpdateFeed)

    global feed
    if categories:
        cList: set[str] = set()
        for i in range(len(c)):
            if categories & (0x01 << i): 
                cList.add(c[i])
        
        print(categories, cList)
        return list(filter(lambda x: len(set(x["categories"]).intersection(cList)) > 0, feed))


    return feed