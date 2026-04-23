import { useContext } from "react";
import { CourseContext } from "../Courses";
import { Meeting, SecondarySection } from "../../types";
import MeetingInfo from "./MeetingInfo";
import { statusEmoji } from "../StatusEmoji";

/* a class has multiple discussion sections. Each discussion section can have multiple meeting times */
/* 
update 4/23/26: if a discussion section has no meeting times, pisa displays its time as "Canceled Canceled" (see 
arden cse114a spring 2026). If there's no meeting info, the only information that can be displayed about the section is the emoji
and the number enroleld (most likely gonna be 0/0)
*/
function Cancelled() {
	return (
		<p style={{marginTop: 2, marginBottom: 5}}>
			Cancelled
		</p>
	)
}

export default function Section({ section }: { section: SecondarySection }) {
	const courseCtx = useContext(CourseContext);
	if (!courseCtx!.details.secondary_sections) return (<></>);
	const sectionType = section.component == 'Seminar' ? 'SEM' : 'DISC';

	//! makes it a boolean with opposite truth
	//!! makes it a boolean with the same truth (!!meetings = meetings exist)
	//!!! makes it a boolean with the opposite truth (!!!section.meetings does not exist)
	const isSectionCancelled = !!!section.meetings; 
	
	const emoji = isSectionCancelled ? '❌' : statusEmoji(section.enrl_status);
	const title = `${emoji} ${sectionType}-${section.class_section}`;

	return (
		<div className="section-card">
			<div className="section-card2">
				<div className="SectionInformation">
					<div style={{ marginBottom: "0px" }}>
						<b style={{ margin: "-8px 0", marginLeft: "-2px" }}>
							{title}
						</b>
						<br />
						<p style={{margin: 0, fontSize: 15}}>
							<b>Enrolled:</b> {`${section.enrl_total}/${section.capacity}`}
						</p>
					</div>

					<div>
						{section.meetings ? section.meetings.map((m: Meeting, _: number) => (<MeetingInfo meeting={m}/>)) : (<Cancelled />)}
					</div>
				</div>

				{/* <div className="SectionCalendarButtons">
										<button
											onClick={() => {
												const ics =
													generateIcsForSection(
														details
															.primary_section
															.subject,
														details
															.primary_section
															.catalog_nbr,
														details
															.primary_section
															.title_long,
														section.class_nbr,
														section.meetings ||
														[],
														term,
													);
												const blob = new Blob(
													[ics],
													{
														type: "text/calendar",
													},
												);
												const url =
													URL.createObjectURL(
														blob,
													);
												const a =
													document.createElement(
														"a",
													);
												a.href = url;
												a.download = `${details.primary_section.subject}-${details.primary_section.catalog_nbr}-${section.class_nbr}.ics`;
												a.click();
												URL.revokeObjectURL(url);
											}}
											className="pisaButton"
											style={{
												marginBottom: "8px",
												padding: "6px 12px",
												fontSize: "15px",
											}}
										>
											<img
												src={DownloadIcon}
												alt="Download calendar icon"
												width="28"
												height="28"
												style={{
													verticalAlign: "middle",
												}}
											/>
											Download Calendar .ics
										</button>

										<button
											onClick={() => {
												const meeting =
													section.meetings?.[0];
												if (!meeting) return;

												const link =
													generateGoogleCalendarLink(
														details
															.primary_section
															.subject,
														details
															.primary_section
															.catalog_nbr,
														details
															.primary_section
															.title_long,
														section.class_nbr,
														meeting,
														term,
														"Section",
													);

												window.open(link, "_blank");
											}}
											className="pisaButton"
											style={{
												marginBottom: "8px",
												padding: "6px 12px",
												fontSize: "15px",
											}}
										>
											<img
												src={GoogleCalendarIcon}
												alt="Add to Google Calendar icon"
												width="28"
												height="28"
											/>
											Add to Google Calendar
										</button>
									</div> */}
			</div>
		</div>
	);
}