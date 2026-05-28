import re, sqlite3, json, pickle, zlib, base64, os
from tqdm import tqdm
from typing import NamedTuple, TypedDict, cast, Literal

dayToID: dict[str, int] = {
	'M': 0,
	'Tu': 1,
	'W': 2,
	'Th': 3,
	'F': 4,
	'Sa': 5,
	'Su': 6
}

roomPattern: re.Pattern = re.compile(r' ([A-Z]?[0-9]+[A-Z]?)$')
timePattern: re.Pattern = re.compile(r'((?:[A-Z][a-z]?)+) (\d\d:\d\d[A-Z][A-Z]-\d\d:\d\d[A-Z][A-Z])') #group1 is days, group2 is time
isLabPattern: re.Pattern = re.compile(r'([A-Z]{2,4} [0-9]{1,3})L( - .+)')
DayOfWeek = Literal["M", "Tu", "W", "Th", "F", "Sa", "Su"]

# the raw location/time strings from pisa
class MeetingRaw(TypedDict):
	location: str
	start_time: str
	end_time: str
	days: str

class Section(TypedDict):
	class_number: str
	component: str
	class_section: str
	meetings: list[MeetingRaw]

class ClassDict(TypedDict):
	class_number: str
	name: str
	link: str
	instructor: str
	meetings: list[MeetingRaw]
	sections: list[Section]

# the processed locations/times
class Location(NamedTuple):
	building: str
	room: str

class TimeBlock(NamedTuple):
	day: DayOfWeek
	startTime: str
	endTime: str

class Meeting(NamedTuple):
	location: Location
	time: TimeBlock

# Converts from 02:40PM format to 14:40:00 (sql time format)
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

def isValidLocation(location: str) -> bool:
	if (
		# Fall 2004: some classes dont have a time, some locations might just be "STU"/"FLD"/etc, and some locations might be empty
		len(location) == 0 or 
		len(location) == 3 or
		# various online classes, tbd locations, off campus locations
		location in [
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
			"UCSC Boating Center",
			"IAS Gallery",
			"Lower Quarry", # no class has been offered here since winter 2011
			"Steven Music" # idk where this is, only 3 classes have ever been offered here
		] or
		# coastal campus locations
		location.startswith("Ocean Health") or
		location.startswith("CoastBio") or
		location.startswith("WestResearchPark") or
		location.startswith("Lg Discovery") or
		# only a handful of classes have been taught at the Arboretum (years ago), and the building doesn't seem to exist anymore
		location.startswith("Arboretum") or
		# these buildings dont exist anymore
		location.startswith("Ch Merr Rm") or
		location.startswith("Kresge Rec") or
		location.startswith("Krsg Town Hall") or
		# only two classes have ever been offered here (CLNI 70 spring23 and spring24)
		location.startswith("Coll9/JRLC Garden")
	): return False

	return True

def isValidTime(time: str) -> bool:
	return len(time) > 0 and time != "TBA" # some classes dont have a time, pisa displays it as an empty string

def fixLocations(location: str) -> Location:
	global roomPattern

	# some kresge classrooms and ming ong 108 are marked as "Inactive", remove that
	location = location.replace(" Inactive", "").replace(" - inactive", "")

	roomMatches: re.Match | None = roomPattern.search(location)
	room: str = roomMatches[0].strip() if roomMatches else None #type: ignore
	building: str = location.replace(room or "", "").strip()
	
	# fix some miscellaneous locations

	if building == "R Carson  Acad":
		building = "R Carson Acad"

	if building == "Soc Sci 1 135 PC Lab":
		building = "Soc Sci 1"
		room = "135 PC Lab"

	if building == "Soc Sci 1 135 Mac Lab":
		building = "Soc Sci 1"
		room = "135 Mac Lab"
	
	if building == "BiomedSci":
		building = "BioMedSci"

	if building == "Bay Tree Conf A":
		building = "Bay Tree"
		room = "Conf A"
	if building == "Bay Tree Conf D":
		building = "Bay Tree"
		room = "Conf D"

	if building == "Kr Lounge":
		building = "Kresge Lounge"
	
	if building == "Elena Baskin Arts" and room:
		building = f"Elena Baskin Arts {room[0]}"
		room = room[1:]
	
	return Location(building, room)

def parseMeeting(m: MeetingRaw) -> list[Meeting]:
	l: Location = fixLocations(m["location"])
	meetings: list[Meeting] = []

	for day in ["M", "Tu", "W", "Th", "F", "Sa", "Su"]:
		if day not in m["days"]: continue

		tb: TimeBlock = TimeBlock(
			cast(DayOfWeek, day),
			convertTo24hr(m["start_time"].replace(' ', '')),
			convertTo24hr(m["end_time"].replace(' ', ''))
		)

		meetings.append(Meeting(l, tb))

	return meetings

def processMeetings(meetings: list[MeetingRaw]) -> list[Meeting]:
	xs: list[Meeting] = []
	for m in meetings:
		xs.extend(parseMeeting(m))
	
	return xs

def insertMeetingIntoTable(m: Meeting, term: int, classID: str, cursor: sqlite3.Cursor) -> None:
	# insert location
	# "The DO UPDATE SET locationString = locationString is a no-op that triggers the RETURNING clause even when there's a conflict."
	cursor.execute('''
		INSERT INTO location(building, room) VALUES (?, ?)
		ON CONFLICT(building, room) DO UPDATE SET building = building
		RETURNING locationID
	''', (m.location.building, m.location.room))
	locationID: str = cursor.fetchone()[0]

	#insert time
	cursor.execute('''
		INSERT INTO timeBlock(day, startTime, endTime) VALUES (?, ?, ?)
		ON CONFLICT(day, startTime, endTime) DO UPDATE SET day = day
		RETURNING blockID
	''', (dayToID[m.time.day], m.time.startTime, m.time.endTime))
	timeBlockID: str = cursor.fetchone()[0]

	#insert everything into join table
	cursor.execute('''
		INSERT INTO classLocationTimeBlock(term, classID, locationID, blockID)
		VALUES (?, ?, ?, ?)
		ON CONFLICT DO NOTHING
	''', (term, classID, locationID, timeBlockID))

def readBin(filePath: str) -> list[dict]:
    with open(filePath, 'rb') as file:
        compressedData: bytes = pickle.load(file)
    
    decompressed: bytes = zlib.decompress(compressedData)
    return json.loads(decompressed.decode('utf-8'))    

def generatePisaLink(term: int, classID: str) -> str:
	b: bytes = base64.b64encode(f'a:2:{{s:5:":STRM";s:4:"{term}";s:10:":CLASS_NBR";s:5:"{classID}";}}'.encode('ascii'))
	return f"https://pisa.ucsc.edu/class_search/index.php?action=detail&class_data={b.decode('ascii')}"

def processAPIResponse(term: int, data: dict) -> ClassDict:
	ps: dict = data["primary_section"]
	classData: dict = {
		"class_number": ps["class_nbr"],
		"name": f"{ps['subject']} {ps['catalog_nbr']} - {ps['class_section']} {ps['title']}",
		"link": generatePisaLink(term, ps["class_nbr"]),
		"meetings": []
	}

	instructors: set[str] = set()
	if "meetings" in data:
		for meeting in data["meetings"]:
			classData["meetings"].append({
				"days": meeting["days"],
				"start_time": meeting["start_time"],
				"end_time": meeting["end_time"],
				"location": meeting["location"]
			})

			for instructor in meeting["instructors"]:
				instructors.add(instructor["name"])
		
	classData["instructor"] = ', '.join(list(instructors))

	#if no discussion sections, do nothing
	# if "secondary_sections" not in data or len(data["secondary_sections"]) == 0:
	# 	return classData
	
	sections: list = []
	if "secondary_sections" in data:
		for section in data["secondary_sections"]:
			s = {
				"class_number": section["class_nbr"],
				"component": section["component"],
				"class_section": section["class_section"],
				"meetings": [] # fuck discussion sections for having multiple possible meeting times.
			}

			#if a discussion section is cancelled, it wont have a meetings array 
			#see ASTR-3 Fall 2004 section 1D
			if "meetings" not in section: continue

			for meeting in section["meetings"]:
				#during COVID, discussion sections had "TBA" as their location for some reason 
				#see class ID 24825 in term 2208 for an example
				if meeting["days"] == "TBA" or meeting["start_time"] == "TBA" or meeting["end_time"] == "TBA" or meeting["location"] == "TBA":
					continue

				s["meetings"].append({
					"days": meeting["days"],
					"start_time": meeting["start_time"],
					"end_time": meeting["end_time"],
					"location": meeting["location"],
				})
			
			sections.append(s)

	classData["sections"] = sections

	# print(classNum, sections)
	return cast(ClassDict, classData)

def getClassLocationsForTerm(term: int) -> None:
	# with open(f"locations/classes/{term}.json", "r", encoding="utf-8") as file:
	# 	allClasses: list[ClassDict] = json.load(file)
	allAPIResponsesRaw: list[dict] = readBin(f"locations/compressed/{term}.bin")
	allClasses: list[ClassDict] = [processAPIResponse(term, a) for a in allAPIResponsesRaw if a]

	# a class has its parent field set to null
	# a discussion section has its pisaLink field set to null, and the parent field set to another class
	
	# i would carve out an exception for labs, but:
	# a lab does not have to be attached to a real class, it doesnt need to have an L in its name (phys 6M spring 2026), 
	# some have meetings but no sections, others have sections but no meetings

	# for each class
	# 	filter out any TBA meetings
	# 	if it has no meetings, and no sections, skip it
	# 	insert the class into the table 
	# 	insert that class's meetings and locations into the table, if they exist
	# 	if it has sections, insert those into the table 

	conn: sqlite3.Connection = sqlite3.connect('locations/locations.db')
	cursor: sqlite3.Cursor = conn.cursor()

	for classData in allClasses:
		classData["meetings"] = [m for m in classData["meetings"] if isValidTime(m["start_time"]) and isValidLocation(m["location"])] #some classes dont have a time
		
		if len(classData["meetings"]) == 0 and len(classData["sections"]) == 0: continue
	
		# start inserting shit into the db
		#insert class
		cursor.execute('''
			INSERT INTO class(term, classID, pisaLink, name, instructor) 
			VALUES(?, ?, ?, ?, ?)
		''', (
			term,
			classData["class_number"], 
			classData["link"],
			classData["name"],
			classData["instructor"], 
		))

		processedMeetings: list[Meeting] = processMeetings(classData["meetings"])
		for m in processedMeetings:
			insertMeetingIntoTable(m, term, classData["class_number"], cursor)
			
		
		# now look up discussion sections for this class and append those 
		for section in classData["sections"]:
			name: str = ("LBS" if section["component"] == "Secondary Lab" else "DISC") + "-" + section["class_section"]

			# as it turns out, its possible for discussion sections to be shared between classes
			# eg, phys 6A 01 and phys 6A 02 in fall 2004 both share their discussion sections
			# since im 99% certain that the class ID is unique, if there is a conflict on entry, we can ignore it.
			cursor.execute('''
				INSERT INTO class(term, classID, name, parent, instructor) 
				VALUES(?, ?, ?, ?, ?)
				ON CONFLICT DO NOTHING
			''', (
				term,
				section["class_number"], 
				name,
				classData["class_number"],
				"Staff"
			))

			processedMeetings: list[Meeting] = processMeetings(section["meetings"])
			for m in processedMeetings:
				insertMeetingIntoTable(m, term, section["class_number"], cursor)


	conn.commit()
	conn.close()


if __name__ == "__main__":
	# parser = argparse.ArgumentParser()
	# parser.add_argument('-l', '--local', action='store_true', help='Scrape from local HTML files instead of making HTTP requests')
	# args = parser.parse_args()
	terms: list[int] = [int(f[0:-4]) for f in os.listdir('./locations/compressed/') if f.endswith('.bin')]

	CURRENT_TERM: int = 2268
	for term in tqdm(terms):
		getClassLocationsForTerm(term)
