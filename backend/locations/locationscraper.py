import requests, bs4, re, sqlite3
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
dayToID: dict[str, int] = {
	'M': 0,
	'Tu': 1,
	'W': 2,
	'Th': 3,
	'F': 4,
	'Sa': 5,
	'Su': 6
}

"""Convert time from '02:40PM' format to '14:40:00' format"""
def convertTo24hr(timeStr: str) -> str:
    timePart: str = timeStr[:-2]
    period: str = timeStr[-2:]
    
    hour, minute = timePart.split(':')
    hour = int(hour)
    
    if period == 'PM' and hour != 12:
        hour += 12
    elif period == 'AM' and hour == 12:
        hour = 0
    
    return f"{hour:02d}:{minute}:00"

def scrapePanel(panel) -> dict[str, str]:
	classData: dict[str, str] = {}
	p = panel.find(class_="panel-body").find(class_="row").find_all("div")
	header = panel.find(class_="panel-heading panel-heading-custom").find("h2")
	aTag = header.find("a")

	classData["class_number"] = p[0].find('a').text.strip()
	classData["name"] = aTag.text.replace('\xa0\xa0\xa0', ' ').strip()
	classData["link"] = aTag.get("href")
	classData["instructor"] = p[1].text.replace("Instructor: ", "").strip()
	classData["location"] = p[3].text.replace("Location: ", "").strip()[5:]
	classData["time"] = p[4].text.replace("Day and Time: ", "").strip()

	return classData



def getClassLocationsForTerm(term: int) -> None:
	body["binds[:term]"] = str(term)
	
	response: requests.Response = requests.post(URL, headers=HEADERS, data=body)
	soup = bs4.BeautifulSoup(response.text, 'lxml')
	panels = soup.find_all(class_="panel panel-default row")

	roomPattern: re.Pattern = re.compile(r' ([A-Z]?[0-9]+[A-Z]?)$')
	timePattern: re.Pattern = re.compile(r'((?:[A-Z][a-z]?)+) (\d\d:\d\d[A-Z][A-Z]-\d\d:\d\d[A-Z][A-Z])') #group1 is days, group2 is time
	
	# capital letter followed by optional lowercase letter, repeated 7 times, to capture each individual day
	# repeating captures (+) only store the last match, not all of them, so i need to do this bullshit
	dayPattern: re.Pattern = re.compile(r'^([A-Z][a-z]?)([A-Z][a-z]?)?([A-Z][a-z]?)?([A-Z][a-z]?)?([A-Z][a-z]?)?([A-Z][a-z]?)?([A-Z][a-z]?)?') 

	conn: sqlite3.Connection = sqlite3.connect('locations/locations.db')
	cursor: sqlite3.Cursor = conn.cursor()

	data: list[dict] = []
	for panel in panels:
		classData: dict = scrapePanel(panel)

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


		# get location
		roomMatches: re.Match | None = roomPattern.search(classData["location"])
		classData["room"] = roomMatches[0].strip() if roomMatches else ""
		classData["building"] = classData["location"].replace(classData["room"], "").strip()
		
		# remove random space in some listings
		if classData["building"] == "R Carson  Acad":
			classData["building"] = "R Carson Acad"

		# "The DO UPDATE SET locationString = locationString is a no-op that triggers the RETURNING clause even when there's a conflict."
		cursor.execute('''
			INSERT INTO location(locationString, building, room) VALUES (?, ?, ?)
			ON CONFLICT(building, room) DO UPDATE SET locationString = locationString
			RETURNING locationID
		''', (
			classData["location"],
			classData["building"],
			classData["room"],
		))
		classData["locationID"] = cursor.fetchone()[0]


		# insert class
		query: str = '''
			INSERT INTO class(term, id, pisaLink, name, instructor, time, locationID) 
			VALUES(?, ?, ?, ?, ?, ?, ?)
		'''
		cursor.execute(query, (
			term,
			classData["class_number"], 
			classData["link"],
			classData["name"],
			classData["instructor"], 
			classData["time"],
			classData["locationID"], 
		))
	


		matches: list[str] = timePattern.findall(classData["time"])
		blockIDs: list = []
		# some classes can have different meeting times on different days. 
		# eg "MTuWTh 06:00PM-10:00PM    F 04:00PM-07:00PM"
		for time in matches:
			meetingDays: str = time[0]
			startTime: str = time[1].split('-')[0]
			endTime: str = time[1].split('-')[1]

			for day in ["M", "Tu", "W", "Th", "F", "Sa", "Su"]:
				if day not in meetingDays: 
					classData[day] = None
					continue

				cursor.execute('''
					INSERT INTO timeBlock(day, startTime, endTime) VALUES (?, ?, ?)
					ON CONFLICT(day, startTime, endTime) DO UPDATE SET day = day
					RETURNING blockID
				''', (dayToID[day], convertTo24hr(startTime), convertTo24hr(endTime)))
				blockIDs.append(cursor.fetchone()[0])
		

		# insert into junction table
		for blockID in blockIDs:
			cursor.execute('INSERT INTO classTimeBlock(term, classID, blockID) VALUES(?, ?, ?)', (
				term, classData["class_number"], blockID
			))	


		
	conn.commit()
	conn.close()


if __name__ == "__main__":
	# CURRENT_TERM: int = 2260
	# for term in tqdm(range(2048, CURRENT_TERM + 2, 2)):
	# 	getClassLocationsForTerm(term)
	
	getClassLocationsForTerm(2260)


'''
CREATE TABLE class (
	term INTEGER,
	id INTEGER,

	pisaLink VARCHAR(300),
	name VARCHAR(200),
	instructor VARCHAR(100),
	time VARCHAR(30),                  -- the original time string, remove later
	locationID INTEGER NOT NULL,

	PRIMARY KEY (term, id),
	FOREIGN KEY (locationID) REFERENCES location(locationID)
);

CREATE TABLE classTimeBlock (
	term INTEGER,
	classID INTEGER,
	blockID INTEGER,

	FOREIGN KEY (term, classID) REFERENCES class(term, id),
	FOREIGN KEY (blockID) REFERENCES timeBlock(blockID)
);

CREATE TABLE location (
	locationID INTEGER PRIMARY KEY,
	locationString VARCHAR(30),        -- the original location string, remove later
	building VARCHAR(30),
	room VARCHAR(10),

	UNIQUE (building, room)
);

CREATE TABLE timeBlock (
	blockID   INTEGER PRIMARY KEY,
	day       TINYINT NOT NULL,      -- 0 mon, 1 tues, etc
	startTime TIME NOT NULL,
	endTime   TIME NOT NULL,

	UNIQUE (day, startTime, endTime)
);
'''