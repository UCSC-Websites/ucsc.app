from fastapi import APIRouter, Path
import sqlite3
from fastapi import HTTPException

router = APIRouter()
conn: sqlite3.Connection 
cursor: sqlite3.Cursor
knownBuildings: set[str]

def startup():
	global conn, cursor, knownBuildings
	conn = sqlite3.connect('locations/locations.db')
	cursor = conn.cursor()

	cursor.execute('SELECT DISTINCT building FROM location ORDER BY building;')
	knownBuildings = set(map(lambda x: x[0], cursor.fetchall()))

	print(f'{len(knownBuildings)} buildings were found in the database.')

@router.get('/schedule')
async def getBuildings():
	return list(knownBuildings)

@router.get('/schedule/{building}')
async def getRoomsForBuilding(building: str):
	if building not in knownBuildings:
		raise HTTPException(status_code=400, detail="Building not found")

	cursor.execute('SELECT room FROM location WHERE building = ?', (building,))
	return list(map(lambda x: x[0], cursor.fetchall()))
	

@router.get('/schedule/{term}/{building}/{room}/{day}')
async def getSchedule(term: str, building: str, room: str|None, day: int = Path(..., ge=0, le=6)):
	if building not in knownBuildings:
		raise HTTPException(status_code=400, detail="Building not found")
	
	# because some buildings (like oakes acad in term 2092) have rooms in some terms, but not others
	roomQuery: str = 'AND l.room = ?'
	params: tuple = (building, room, day, term)
	if room != '-1':
		cursor.execute('SELECT room FROM location WHERE building = ?', (building,))
		roomsInBuilding = set(map(lambda x: x[0], cursor.fetchall()))
		if room not in roomsInBuilding:
			raise HTTPException(status_code=400, detail="Building does not have specified room")
	else:
		room = None
		roomQuery = 'AND l.room IS NULL'
		params = (building, day, term)
	
	cursor.execute(f'''
		SELECT 
			c.name,
			c.pisaLink,
			c.instructor,
			t.startTime,
			t.endTime
		FROM classTimeBlock ctb
		JOIN class c ON (c.term, c.id) = (ctb.term, ctb.classID)
		JOIN timeBlock t ON t.blockID = ctb.blockID
		JOIN location l ON l.locationID = c.locationID
		WHERE 
			l.building = ?
			{roomQuery}
			AND t.day = ?
			AND c.term = ?
		ORDER BY t.startTime;
	''', params)
	return cursor.fetchall()

