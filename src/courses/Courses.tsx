import { useState, useEffect } from "react";
import { TopBar as MobileTopBar } from "../components/navbar/mobile/TopBar.tsx";
import { TopBar as DesktopTopBar } from "../components/navbar/desktop/TopBar.tsx";
import Card from "./Card";
import DetailedView from "./DetailedView";
import Search from './Search.tsx';
import './Courses.css';
import Filters from "./Filters.tsx";
import { BASE_API_URL } from "../constants.ts";
import {Loading} from "../components/loading/Loading.tsx";

interface Course {
	status: string;
	link: string;
	name: string;
	class_number: string;
	enrolled: string;
	instructor: string;
	location: string;
	modality: string;
	summer_session: string | null;
	time: string;
}

const useMediaQuery = (query: string) => {
	const [matches, setMatches] = useState(window.matchMedia(query).matches);

	useEffect(() => {
		const media = window.matchMedia(query);
		const listener = () => setMatches(media.matches);
		media.addEventListener("change", listener);
		return () => media.removeEventListener("change", listener);
	}, [query]);

	return matches;
};

function parseInput(query: string) {
	let results = {
		dept: "",
		catalogNum: ""
	};

	if (query.length == 0) return results;

	const deptExtractor = new RegExp('^([a-zA-Z]{3,4})');
	const deptResults = deptExtractor.exec(query);
	if (deptResults) results["dept"] = deptResults[0].toUpperCase();

	const catalogNumExtractor = new RegExp('([0-9]{1,3}[a-zA-Z]?)');
	const cnumResults = catalogNumExtractor.exec(query);
	if (cnumResults) results["catalogNum"] = cnumResults[0].toUpperCase();

	return results;
}

export default function Courses() {
	const [courses, setCourses] = useState<Course[]>([]);
	const [loading, setLoading] = useState(false);
	const isMobile = useMediaQuery("(max-width: 768px)");
	const [detailedData, setDetailedData] = useState<any>(null);
	const [selectedClassModality, setSelectedClassModality] = useState<string>("");
	const [selectedClassLink, setSelectedClassLink] = useState<string>("");
	// const [inputData, setInputData] = useState<{ dept: string; catalogNum: string }>({ dept: "", catalogNum: "" });
	const [showDetails, setShowDetails] = useState(false);
	const [isFirstLoad, setFirstLoad] = useState<boolean>(true)

	//filter states
	const [term, setTerm] = useState<string>("2252");
	const [ge, setGE] = useState<string>("");
	const [status, setStatus] = useState<string>("all");
	const [time, setTimes] = useState<string>("");

	async function fetchCourses(inputData: any) {
		try {
			setLoading(true);

			const response = await fetch(`${BASE_API_URL}/courses?term=${term}&regStatus=all&department=${inputData.dept}&catalogNum=${inputData.catalogNum}&ge=${ge}&regStatus=${status}&meetingTimes=${time}`);
			const data = await response.json();
			setCourses(data);
		} catch (error) {
			console.error("Failed to fetch courses:", error);
		} finally {
			setLoading(false);
		}
	}

	const getDetailedView = async (courseTerm: string, courseID: string) => {
		const response = await fetch(`https://my.ucsc.edu/PSIGW/RESTListeningConnector/PSFT_CSPRD/SCX_CLASS_DETAIL.v1/${courseTerm}/${courseID}`);
		const data = await response.text();

		setDetailedData(data);
		if (isMobile) setShowDetails(true);
	}

	const onSearch = (query: string) => {
		if (isFirstLoad) setFirstLoad(false);
		
		const inputData = parseInput(query);

		fetchCourses(inputData);
	}

	const spacer = (<div style={{ height: '0px', margin: '30px 0' }}></div>)

	return (
		<div className="courses-page">
			<div className="topbar-container">
				{isMobile ? <MobileTopBar /> : <DesktopTopBar />}
			</div>
			<div className="parent" style={{ flexDirection: isMobile ? 'column' : 'row', justifyContent: 'center' }}>
				<div 
					className="contentLeft" 
					style={{ 
						width: isMobile ? '100%' : '30%', 
						display: isMobile && showDetails ? 'none' : 'flex',
						padding: isMobile ? '10px 0' : '10px'
					}}
				>
					<div className="search-wrapper" style={{ 
						width: isMobile ? '90%' : '100%',
						boxSizing: 'border-box',
						paddingRight: isMobile ? '0' : '0px',
						maxWidth: '100%',
						marginTop: 60
					}}>
						<Search onSearch={onSearch}/>
						<Filters isMobile={isMobile} setTerm={setTerm} setGE={setGE} setTimes={setTimes} setStatus={setStatus} />
					</div>
					{loading && <Loading />}
					<div className="courseList" style={{ marginTop: isMobile ? '20px' : '30px' }}>
						{isFirstLoad ? <h3>Search for a course to get started!</h3> :
						!courses || courses.length === 0 ? <h3>No results found</h3> :
						courses.map((course: Course, index: number) => (
								<Card
									key={index}
									classStatus={course.status}
									className={course.name}
									instructor={course.instructor}
									location={course.location}
									time={course.time}
									enrollment={course.enrolled}
									summerSession={course.summer_session}
									term={term}
									classID={course.class_number}
									onCardClick={(classTerm: string, classID: string) => {
										setSelectedClassLink("https://pisa.ucsc.edu/class_search/" + course.link);
										setSelectedClassModality(course.modality);
										getDetailedView(classTerm, classID);
									}}
								/>
							))
						}
					</div>
				</div>
				<div 
					className="contentRight" 
					style={{ 
						display: (isMobile && !showDetails) ? 'none' : 'block',
						height: isMobile ? 'auto' : 'calc(100vh - 60px)',
						minHeight: isMobile ? 'calc(100vh - 60px)' : 'auto',
					}}
				>
					{spacer}
					{detailedData ? <DetailedView details={detailedData} modality={selectedClassModality} link={selectedClassLink} isMobile={isMobile} handleBack={() => {setShowDetails(false)}} /> :
						<div style={{ width: '100%', height: 'calc(100% - 30px)', backgroundColor: 'var(--detailed-class-info-color)' }}></div>
					}
				</div>
			</div>
		</div>
	);
}
