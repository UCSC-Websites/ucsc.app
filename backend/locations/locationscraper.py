import requests, bs4, json, sqlite3
from tqdm import tqdm

URL: str = "https://pisa.ucsc.edu/class_search/index.php"
HEADERS: dict[str, str] = {
	"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:146.0) Gecko/20100101 Firefox/146.0",
	"Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
	"Accept-Language": "en-US,en;q=0.5",
	"Sec-GPC": "1",
	"Upgrade-Insecure-Requests": "1",
	"Sec-Fetch-Dest": "document",
	"Sec-Fetch-Mode": "navigate",
	"Sec-Fetch-Site": "same-origin",
	"Sec-Fetch-User": "?1",
	"Content-Type": "application/x-www-form-urlencoded",
	"Priority": "u=0, i",
	"Pragma": "no-cache",
	"Cache-Control": "no-cache",
	"Referer": "https://pisa.ucsc.edu/class_search/index.php"
}
body: dict[str, str] = {
	'action': 'update_segment', 
	'binds[:term]': '2048', 
	'binds[:reg_status]': 'all', 
	'binds[:catalog_nbr_op]': '=', 
	'binds[:instr_name_op]': '=', 
	'binds[:crse_units_op]': '=', 
	'binds[:asynch]': 'A',
	'binds[:hybrid]': 'H', 
	'binds[:synch]': 'S',
	'binds[:person]': 'P',
	'rec_start': '0', 
	'rec_dur': '10000'
}

def getClassLocationsForTerm(term: int) -> None:
	body["binds[:term]"] = str(term)
	
	response: requests.Response = requests.post(URL, headers=HEADERS, data=body)
	soup = bs4.BeautifulSoup(response.text, 'lxml')
	panels = soup.find_all(class_="panel panel-default row")
	data: list[dict] = []
	for panel in panels:
		classData: dict = {}

		# scrape body 
		p = panel.find(class_="panel-body").find(class_="row").find_all("div")
		# 0: class number
		# 1: instructor
		# 2: parent div of location and time
		# 3: location
		# 4: time
		# 5: summer session
		# 6: enrolled
		# 7: textbooks
		# 8: course readers
		# 9: modality
		classData["location"] = p[3].text.replace("Location: ", "").strip()[5:]
		classData["time"] = p[4].text.replace("Day and Time: ", "").strip()

		if (
			# Fall 2004: some classes dont have a time, some locations might just be "STU"/"FLD"/etc, and some locations might be empty
			len(classData["time"]) == 0 or 
			len(classData["location"]) == 0 or 
			len(classData["location"]) == 3 or
			# various online classes, tbd locations, off campus locations
			classData["location"] in [
				"Remote Instruction", 
				"Online", 
				"TBD In Person", 
				"SiliconValleyCtr", 
				"Silicon Valley",
				"Off Campus",
				"Cupertino",
				"Harbor",
				"Lockheed",
				"Remote Meeting",
				"UCSC Boating Center"
			] or
			classData["location"].startswith("Ocean Health") or
			classData["location"].startswith("CoastBio") or
			classData["location"].startswith("WestResearchPark") or
			classData["location"].startswith("Lg Discovery")
		): continue	
		
		classData["class_number"] = p[0].find('a').text.strip()
		classData["instructor"] = p[1].text.replace("Instructor: ", "").strip()

		# scrape header (open/closed/waitlisted, class name, link)
		header = panel.find(class_="panel-heading panel-heading-custom").find("h2")
		aTag = header.find("a")
		classData["link"] = aTag.get("href")
		classData["name"] = aTag.text.replace('\xa0\xa0\xa0', ' ').strip()

		data.append(classData)
	
	# with open('locations/test.json', 'w') as file:
	# 	json.dump(data, file, indent=4)

	conn: sqlite3.Connection = sqlite3.connect('locations/locations.db')
	cursor: sqlite3.Cursor = conn.cursor()
	query: str = "INSERT INTO class(id, link, name, instructor, location, time, term) VALUES(?, ?, ?, ?, ?, ?, ?)"
	for d in data:
		cursor.execute(query, (d["class_number"], d["link"], d["name"], d["instructor"], d["location"], d["time"], term))
	conn.commit()
	conn.close()


if __name__ == "__main__":
	CURRENT_TERM: int = 2260
	for term in tqdm(range(2048, CURRENT_TERM + 2, 2)):
		getClassLocationsForTerm(term)


'''
CREATE TABLE class (
	id INTEGER,
	link VARCHAR(300),
	name VARCHAR(200),
	instructor VARCHAR(100),
	location VARCHAR(100),
	time VARCHAR(100),
	term INTEGER
);
'''