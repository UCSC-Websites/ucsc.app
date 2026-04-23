import { useContext } from "react";
import { CourseContext } from "../Courses";
import Section from "./Section";
import { SecondarySection } from "../../types";

function HorizontalBar() {
	return (
		<hr
			style={{
				margin: "0 0 15px 0",
				borderTop: "1px solid #dee2e6",
			}}
		/>
	)
}

export default function ClassSections() {
	const courseCtx = useContext(CourseContext);

	if (!courseCtx!.details.secondary_sections) return (<></>);

	return (
		<div className="sections classDetails">
			<h3 className="heading">Sections</h3>
			{courseCtx!.details.secondary_sections.map((s: SecondarySection, i: number) => {
				return (
					<>
						{i > 0 && (<HorizontalBar />)}
						<Section section={s} />
					</>
				)
			})}
			{/* {courseCtx!.details.combined_sections && courseCtx!.details.combined_sections.map((s: SecondarySection, i: number) => {
				return (
					<>
						{i > 0 && (
							<hr
								style={{
									margin: "0 0 15px 0",
									borderTop: "1px solid #dee2e6",
								}}
							/>
						)}
						<Section section={s} />
					</>
				)
			})} */}
		</div>
	)
}