import { Instructor, Meeting } from "../../types";

export default function MeetingInfo({ meeting }: { meeting: Meeting }) {
	return (
		<div style={{marginTop: "0px", marginBottom: "8px", fontSize: 15}}>
			<p style={{margin: "2px 0"}}>
				<strong>Instructor:</strong>{" "}{meeting.instructors.map((i: Instructor) => i.name).join(', ')}
			</p>
			<p style={{margin: "2px 0"}} >
				<strong>Day and Times:</strong>{" "}
				{meeting.days}{" "}{meeting.start_time} - {meeting.end_time}
			</p>
			<p style={{margin: "2px 0"}}>
				<strong>Location:</strong>{" "}{meeting.location}
			</p>
		</div>
	);
}