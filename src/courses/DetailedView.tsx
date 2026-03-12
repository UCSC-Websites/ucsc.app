import React from "react";
import "./styles/DetailedView.css";
import { statusEmoji } from "./StatusEmoji";
import ExternalLinkIcon from "/icons/external-link.svg";
import GoogleCalendarIcon from "/icons/Google_Calendar_icon.png";
import DownloadIcon from "/icons/downlaod2.png";
import BackIcon from "/icons/back-arrow.svg";
import { generateIcs, generateIcsForSection } from "./generateIcs";
import { generateGoogleCalendarLink } from "./generateIcs";

interface Instructor {
	name: string;
}

interface Meeting {
	days: string;
	start_time: string;
	end_time: string;
	location: string;
	instructors: Instructor[];
}

interface Section {
	subject: string;
	catalog_nbr: string;
	title_long: string;
	enrl_status: string;
	enrl_total: number;
	capacity: number;
	waitlist_total: number;
	waitlist_capacity: number;
	credits: string;
	gened?: string;
	class_nbr: string;
	acad_career: string;
	description?: string;
	requirements?: string;
	meetings?: Meeting[];
}

interface DetailedViewProps {
	details: string;
	modality: string;
	link: string;
	term: string;
	isMobile?: boolean;
	handleBack: () => void;
}

function classDetailsGridEntry(title: string, content: string) {
	return (
		<div style={{ display: "flex", flexDirection: "column" }}>
			<span
				style={{
					fontWeight: "500",
					// border: '5px solid green',
					color: "#6c757d",
					fontSize: "0.9rem",
				}}
			>
				{title}
			</span>
			<span style={{ fontSize: "1.1rem" }}>{content}</span>
		</div>
	);
}

const DetailedView: React.FC<DetailedViewProps> = ({
	details,
	modality,
	link,
	term,
	isMobile,
	handleBack,
}) => {
	const detailsObj = JSON.parse(details);
	const spacer = <div style={{ height: "0px", margin: "20px 0" }}></div>;

	const containerStyle = isMobile
		? {
				maxHeight: "100vh",
				overflowY: "auto" as const,
				width: "100%",
				padding: "0 0px",
				margin: "0px 0px",
				// border: "5px solid green",
			}
		: {};

	const classDetailsGridStyle = isMobile
		? {
				gridTemplateColumns: "repeat(2, 1fr)",
			}
		: {};

	return (
		<div className="detailsParent" style={containerStyle}>
			{spacer}

			<div className="titleAndButtonParent">
				{isMobile && (
					<button
						onClick={handleBack}
						className="pisaButton"
						style={{ backgroundColor: "#007bff" }}
					>
						<img
							src={BackIcon}
							alt="Back"
							width="20px"
							height="20px"
							style={{ verticalAlign: "middle" }}
						/>
					</button>
				)}
				<div>
					<h3
						style={
							isMobile
								? {
										fontSize: "1.2rem",
										paddingLeft: "8px",
										paddingRight: "8px",
									}
								: {}
						}
					>
						{detailsObj.primary_section.subject}-
						{detailsObj.primary_section.catalog_nbr}:{" "}
						{detailsObj.primary_section.title_long}
					</h3>
				</div>

				<div className="ClassTools">
					{!isMobile && (
						<>
							<button
								onClick={() => {
									const ics = generateIcs(details, term);
									const blob = new Blob([ics], {
										type: "text/calendar",
									});
									const url = URL.createObjectURL(blob);
									const a = document.createElement("a");
									a.href = url;
									a.download = `${detailsObj.primary_section.subject}-${detailsObj.primary_section.catalog_nbr}.ics`;
									a.click();
									URL.revokeObjectURL(url);
								}}
								className="pisaButton"
								title="Download calendar file"
							>
								<img
									src={DownloadIcon}
									alt="View in Pisa"
									width="30"
									height="30"
									style={{ verticalAlign: "middle" }}
								/>
								Download Calendar .ics
							</button>

							<button
								onClick={() => {
									const meeting = detailsObj.meetings?.[0];
									if (!meeting) return;

									const link = generateGoogleCalendarLink(
										detailsObj.primary_section.subject,
										detailsObj.primary_section.catalog_nbr,
										detailsObj.primary_section.title_long,
										detailsObj.primary_section.class_nbr,
										meeting,
										term,
										"Lecture",
									);

									window.open(link, "_blank");
								}}
								className="pisaButton"
							>
								<img
									src={GoogleCalendarIcon}
									width="30"
									height="30"
								/>
								Add to Google Calendar
							</button>

							<button
								onClick={() => window.open(link, "_blank")}
								className="pisaButton"
							>
								<img
									src={ExternalLinkIcon}
									alt="View in Pisa"
									width="30"
									height="30"
									style={{ verticalAlign: "middle" }}
								/>
								View Source
							</button>
						</>
					)}
				</div>
			</div>

			<div className="ClassToolsMobile">
				{isMobile && (
					<>
						<button
							onClick={() => {
								const ics = generateIcs(details, term);
								const blob = new Blob([ics], {
									type: "text/calendar",
								});
								const url = URL.createObjectURL(blob);
								const a = document.createElement("a");
								a.href = url;
								a.download = `${detailsObj.primary_section.subject}-${detailsObj.primary_section.catalog_nbr}.ics`;
								a.click();
								URL.revokeObjectURL(url);
							}}
							className="pisaButton"
							title="Download calendar file"
						>
							<img
								src={DownloadIcon}
								alt="View in Pisa"
								width="25"
								height="25"
								style={{ verticalAlign: "middle" }}
							/>
							Download Calendar .ics
						</button>

						<button
							onClick={() => {
								const meeting = detailsObj.meetings?.[0];
								if (!meeting) return;

								const link = generateGoogleCalendarLink(
									detailsObj.primary_section.subject,
									detailsObj.primary_section.catalog_nbr,
									detailsObj.primary_section.title_long,
									detailsObj.primary_section.class_nbr,
									meeting,
									term,
									"Lecture",
								);

								window.open(link, "_blank");
							}}
							className="pisaButton"
						>
							<img
								src={GoogleCalendarIcon}
								width="25"
								height="25"
							/>
							Add to Google Calendar
						</button>

						<button
							onClick={() => window.open(link, "_blank")}
							className="pisaButton"
						>
							<img
								src={ExternalLinkIcon}
								alt="View in Pisa"
								width="25"
								height="25"
								style={{ verticalAlign: "middle" }}
							/>
							View Source
						</button>
					</>
				)}
			</div>

			{detailsObj.primary_section && (
				<div className="classDetails">
					<h3 className="heading">Class Details</h3>
					<div
						className="classDetailsGrid"
						style={classDetailsGridStyle}
					>
						{classDetailsGridEntry(
							"Status",
							detailsObj.primary_section.enrl_status,
						)}
						{classDetailsGridEntry(
							"Enrolled",
							detailsObj.primary_section.enrl_total +
								" / " +
								detailsObj.primary_section.capacity,
						)}
						{classDetailsGridEntry(
							"Waitlist",
							detailsObj.primary_section.waitlist_total +
								" / " +
								detailsObj.primary_section.waitlist_capacity,
						)}
						{classDetailsGridEntry(
							"Credits",
							detailsObj.primary_section.credits,
						)}
						{classDetailsGridEntry(
							"GenEd",
							detailsObj.primary_section.gened || "None",
						)}
						{classDetailsGridEntry("Modality", modality)}
						{classDetailsGridEntry(
							"Class ID",
							detailsObj.primary_section.class_nbr,
						)}
						{classDetailsGridEntry(
							"Career",
							detailsObj.primary_section.acad_career,
						)}
					</div>
				</div>
			)}

			{detailsObj.primary_section.description && (
				<div className="description classDetails">
					<h3 className="heading">Description</h3>
					<p>{detailsObj.primary_section.description || "None"}</p>
				</div>
			)}
			<div className="enrollmentReq classDetails">
				<h3 className="heading">Requirements</h3>
				<p>{detailsObj.primary_section.requirements || "None"}</p>
			</div>
			{detailsObj.notes && (
				<div className="notes classDetails">
					<h3 className="heading">Notes</h3>
					<p>{detailsObj.notes}</p>
				</div>
			)}
			{detailsObj.meetings && (
				<div className="meetings classDetails">
					<h3 className="heading">Meeting Times</h3>
					{detailsObj.meetings.map(
						(meeting: Meeting, index: number) => {
							return (
								<div
									key={index}
									style={{ marginBottom: "15px" }}
								>
									<p>
										<strong>Day and Times:</strong>{" "}
										{meeting.days} {meeting.start_time}-
										{meeting.end_time}
									</p>
									<p>
										<strong>Location:</strong>{" "}
										{meeting.location}
									</p>
									<p>
										<strong>Instructor(s):</strong>{" "}
										{meeting.instructors.map(
											(
												instructor: Instructor,
												i: number,
											) => (
												<span key={i}>
													{instructor.name}
													{i <
													meeting.instructors.length -
														1
														? ", "
														: ""}
												</span>
											),
										)}
									</p>
								</div>
							);
						},
					)}
				</div>
			)}
			{detailsObj.secondary_sections && (
				<div className="sections classDetails">
					<h3 className="heading">Sections</h3>
					{detailsObj.secondary_sections.map(
						(section: Section, index: number) => {
							if (!section.meetings) return null;

							return (
								<div key={index} className="section-card">
									{index > 0 && (
										<hr
											style={{
												margin: "0 0 15px 0",
												borderTop: "1px solid #dee2e6",
											}}
										/>
									)}

									<div className="section-card2">
										<div className="SectionInformation">
											<div
												style={{ marginBottom: "10px" }}
											>
												<p style={{ margin: "-8px 0" }}>
													{statusEmoji(
														section.enrl_status,
													)}
													Enrolled:{" "}
													{section.enrl_total}/
													{section.capacity}
												</p>
											</div>

											<div>
												{section.meetings.map(
													(
														meeting: Meeting,
														i: number,
													) => (
														<div
															key={i}
															style={{
																margin: "8px 0",
															}}
														>
															<p
																style={{
																	margin: "2px 0",
																}}
															>
																<strong>
																	Day and
																	Times:
																</strong>{" "}
																{meeting.days}{" "}
																{
																	meeting.start_time
																}
																-
																{
																	meeting.end_time
																}
															</p>
															<p
																style={{
																	margin: "2px 0",
																}}
															>
																<strong>
																	Location:
																</strong>{" "}
																{
																	meeting.location
																}
															</p>
														</div>
													),
												)}
											</div>
										</div>

										<div className="SectionCalendarButtons">
											<button
												onClick={() => {
													const ics =
														generateIcsForSection(
															detailsObj
																.primary_section
																.subject,
															detailsObj
																.primary_section
																.catalog_nbr,
															detailsObj
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
													a.download = `${detailsObj.primary_section.subject}-${detailsObj.primary_section.catalog_nbr}-${section.class_nbr}.ics`;
													a.click();
													URL.revokeObjectURL(url);
												}}
												className="pisaButton"
												style={{
													marginBottom: "8px",
													padding: "6px 12px",
													fontSize: "15px",
													// marginTop: "4px",
													// backgroundColor: "#007bff",
													// color: "white",
													// border: "none",
													// borderRadius: "4px",
													// cursor: "pointer",
													// fontSize: "0.9rem",
												}}
											>
												<img
													src={DownloadIcon}
													alt="View in Pisa"
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
															detailsObj
																.primary_section
																.subject,
															detailsObj
																.primary_section
																.catalog_nbr,
															detailsObj
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
													// 	marginTop: "8px",
													// 	marginBottom: "8px",
													// 	backgroundColor: "#007bff",
													// 	color: "white",
													// 	border: "none",
													// borderRadius: "4px",
													// 	cursor: "pointer",
													// 	fontSize: "0.9rem",
												}}
											>
												<img
													src={GoogleCalendarIcon}
													width="28"
													height="28"
												/>
												Add to Google Calendar
											</button>
										</div>
									</div>
								</div>
							);
						},
					)}
				</div>
			)}

			{spacer}
		</div>
	);
};

export default DetailedView;
