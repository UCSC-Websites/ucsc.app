# making new network requests to the API/pisa is slow. instead, im just gonna download all responses and store
# it into a folder locally to speed up the process.
from tqdm import tqdm
from tqdm.asyncio import tqdm
import asyncio, httpx, json, base64, zlib, pickle

ALL_CLASSES_URL: str = "https://my.ucsc.edu/PSIGW/RESTListeningConnector/PSFT_CSPRD/SCX_CLASS_LIST.v1/"

async def fetchClassCompressed(client: httpx.AsyncClient, classNum: str, term: int, semaphore: asyncio.Semaphore):
	async with semaphore:
		await asyncio.sleep(0.05)
		URL: str = f"https://my.ucsc.edu/PSIGW/RESTListeningConnector/PSFT_CSPRD/SCX_CLASS_DETAIL.v1/{term}/{classNum}"
		response = await client.get(URL, timeout=30)
		if response.status_code != 200: return {}
		
		return response.json()


async def fetchAllClassesCompressed(classNumbers: list[str], term: int) -> bytes:
	semaphore: asyncio.Semaphore = asyncio.Semaphore(10)
	async with httpx.AsyncClient() as client:
		tasks = [fetchClassCompressed(client, c, term, semaphore) for c in classNumbers]
		results: list[dict] = await tqdm.gather(*tasks, desc="Gathering sections")
	
	merged: list[dict] = [r for r in results if r]
	jsonBytes: bytes = json.dumps(merged).encode('utf-8')
	return zlib.compress(jsonBytes)



async def fetchAllTerms(startTerm: int, endTerm: int, maxConcurrent: int = 5):
	semaphore: asyncio.Semaphore = asyncio.Semaphore(maxConcurrent)
	
	async def fetchTerm(client: httpx.AsyncClient, term: int):
		async with semaphore:
			await asyncio.sleep(0.05)  # rate limiting
			response = await client.get(ALL_CLASSES_URL + f"{term}?dept=")
			if response.status_code != 200: return {}

			allClasses = response.json()
			
			# apparently some classes dont have ids. they all dont have locations either, so skip em
			classNumbers: list[str] = [c["class_nbr"] for c in allClasses["classes"] if len(c["class_nbr"]) > 0]
			
			return {term: list(set(classNumbers))}  # deduplicate, because it can return duplicates (eg DANM-219 fall 2004)
	
	async with httpx.AsyncClient() as client:
		tasks = [fetchTerm(client, term) for term in range(startTerm, endTerm, 2)]
		results = await tqdm.gather(*tasks, desc="Fetching all terms")
	
	merged = {}
	for r in results:
		if not r: continue
		merged.update(r)

	return merged


if __name__ == "__main__":
	START_TERM: int = 2048
	CURRENT_TERM: int = 2268

	client: httpx.Client = httpx.Client()

	#asynchronously get every term's class IDs 
	allTerms: dict[int, list[str]] = asyncio.run(fetchAllTerms(START_TERM, CURRENT_TERM + 2, 10))

	#then fetch data for all classes in each term and write it to a file
	for term in tqdm(allTerms, desc="Fetching class data"):
		data = asyncio.run(fetchAllClassesCompressed(allTerms[term], term))
		with open(f"locations/compressed/{term}.bin", "wb") as file:
			pickle.dump(data, file)

		