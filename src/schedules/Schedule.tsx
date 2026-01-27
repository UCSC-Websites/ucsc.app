import { useContext } from "react";
import { MapContext } from "./MapContext";
import { Context } from "../Context";
import { TimeBlock } from "../types";
import ScheduleTimeBlock from "./components/ScheduleTimeBlock";
import "./styles/Map.css";
import "./styles/Schedule.css";
import DaySelector from "./components/DaySelector";


function NoClassesHere() {
	return (
		<div style={{
			padding: '5px',
			textAlign: 'center',
			color: 'var(--gold)',
			fontStyle: 'italic'
		}}>
			<p style={{ margin: 0 }}>No classes scheduled here on this day.</p>
		</div>
	)
}


export default function Schedule({ locationName }: { locationName: string }) {
	const ctx = useContext(MapContext);
	const globalCtx = useContext(Context);

	const maxHeight = globalCtx!.mobile ? '200px' : '400px';


	// if the building isnt normal (eg East Field, East Field House, etc), display the selectedBuilding (eg "Martial Arts", "Dance Studio")
	// otherwise, if its normal and has a building + room (eg Physical Sciences 114), display locationName and room number
	const title = ctx!.selectedRoom == "-1" ? ctx!.selectedBuilding : `${locationName} ${ctx!.selectedRoom}`;

	return (
		<div className="scheduleParent" style={{maxHeight: maxHeight }}>
			<div style={{ marginBottom: '10px' }}>
				<strong style={{ marginTop: '0', color: "var(--gold)" }}>
					{title}
				</strong>
			</div>

			<DaySelector />

			<div style={{ gap: '5px' }}>
				{ctx!.selectedSchedule.length == 0 ? (
					<NoClassesHere />
				) : (
					ctx!.selectedSchedule.map((s: TimeBlock, index: number) => (
						<ScheduleTimeBlock
							key={index}
							timeBlock={s}
						/>
					))
				)}
			</div>
			<div style={{ display: 'flex', justifyContent: 'center', marginTop: '5px' }}>
				<button
					className="mapGoldButton"
					onClick={(e) => {
						e.stopPropagation();
						ctx!.onScheduleBackButtonPress();
					}}>
					Back
				</button>
			</div>
		</div>
	)
}