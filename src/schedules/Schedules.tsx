import { useContext, useEffect, useState } from "react"
import { Context } from "../Context";
import { TopBar as MobileTopBar } from "../components/navbar/mobile/TopBar";
import { TopBar as DesktopTopBar } from "../components/navbar/desktop/TopBar";
import { BASE_API_URL } from "../constants";

/* Keeping this hidden for now, so I won't add a link in the topbar to here */
/* It'll still be accessible from /schedules */

/* I'll figure out maps later, for now I'll just have some text dropdowns */

function Autocomplete({ label, options, onSelect, disabled }: { label: string, options: any[], onSelect: (a: any) => void, disabled: boolean }) {
	return (
		<>
			<p>{label}</p>
			<input
				list={label}
				onChange={(e) => onSelect(e.target.value)}
				disabled={disabled}
			/>

			<datalist id={label}>
				{options.map((b, i) => (<option value={b} key={i} />))}
			</datalist>
		</>
	)
}
function Selector({ label, options, onSelect, disabled }: { label: string, options: any[], onSelect: (a: any) => void, disabled: boolean }) {
	return (
		<>
			<p>{label}</p>
			<select
				// type="dropdown"
				// size={options.length}
				onChange={(e) => onSelect(e.target.value)}
				disabled={disabled}
			>
				<option value="">--Please choose an option--</option>
				{options.map((b, i) => (<option value={b} key={i}>{b}</option>))}
			</select>
		</>
	)
}

const days: { [key: string]: number } = {
	"Monday": 0,
	"Tuesday": 1,
	"Wednesday": 2,
	"Thursday": 3,
	"Friday": 4,
	"Saturday": 5,
	"Sunday": 6
};

export default function Schedules() {
	// const [terms, setTerms] = useState<string[]>([]);
	const [buildings, setBuildings] = useState<string[]>([]);
	const [rooms, setRooms] = useState<string[]>([]);

	const [selectedBuilding, setSelectedBuilding] = useState<string>("");
	const [selectedTerm, setSelectedTerm] = useState<number>(-1);
	const [selectedRoom, setSelectedRoom] = useState<string>("");
	const [selectedDay, setSelectedDay] = useState<string>("");


	const ctx = useContext(Context);
	const terms = [];
	for (let i = 2048; i <= 2260; i += 2)
		terms.push(i);

	useEffect(() => {
		fetch(`${BASE_API_URL}/schedule`)
			.then(res => res.json())
			.then(b => setBuildings(b));
	}, []);

	useEffect(() => {
		if (selectedBuilding.length == 0) return;
		if (!buildings.includes(selectedBuilding)) return;

		fetch(`${BASE_API_URL}/schedule/${selectedBuilding}`)
			.then(res => res.json())
			.then(b => setRooms(b));
	}, [selectedBuilding]);

	const onGo = () => {
		const r = (selectedRoom.length == 0) ? "-1" : selectedRoom;
		const dayNum = days[selectedDay];
		fetch(`${BASE_API_URL}/schedule/${selectedTerm}/${selectedBuilding}/${r}/${dayNum}`)
			.then(res => res.json())
			.then(res => console.log(res));
	}

	return (
		<>
			{ctx!.mobile ? <MobileTopBar /> : <DesktopTopBar />}
			<div style={{ position: "absolute", top: "200px" }}>

				<Autocomplete
					label={"select term"}
					options={terms}
					onSelect={setSelectedTerm}
					disabled={false}
				/>

				<Autocomplete
					label={"select building"}
					options={buildings}
					onSelect={setSelectedBuilding}
					disabled={false}
				/>

				<Selector
					label={"select rooms"}
					options={rooms}
					onSelect={setSelectedRoom}
					disabled={selectedBuilding.length == 0}
				/>

				<Selector
					label={"select day"}
					options={Object.keys(days)}
					onSelect={setSelectedDay}
					disabled={selectedBuilding.length == 0}
				/>

				<button onClick={() => onGo()}>
					Go
				</button>
			</div>
		</>
	)
}