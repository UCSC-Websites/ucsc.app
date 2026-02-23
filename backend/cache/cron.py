import sys
from pathlib import Path

# add the backend directory to Python path
backendDir: Path = Path(__file__).parent.parent
sys.path.insert(0, str(backendDir))

import endpoints.menu as menu
import endpoints.news as news
from datetime import datetime
import asyncio

if __name__ == "__main__":
	print("--------------------------------------")
	print(f"Caching started at {datetime.now().isoformat()}")
	asyncio.run(menu.CacheMenus())
	asyncio.run(news.UpdateFeed())
	print(f"Caching finished at {datetime.now().isoformat()}")
	print("--------------------------------------")