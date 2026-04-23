// stuff for the map
export interface RoomsInBuilding {
	name: string;
	data: string[];
}

export type TimeBlock = [string, string, string, string, string];


// pisa (note that all the shit below this has names that match one to one with how they appear in pisa's api. hence the snake case.)
export type Course = {
	status: string;
	link: string;
	name: string;
	class_number: string;
	enrolled: string;
	instructor: string;
	location: string;
	modality: string;
	summerSession: string | null;
	time: string;
}

// all the bullshit below is for the detailed class API response
export type DetailedClassInfo = {
	primary_section: PrimarySection
	meetings: Meeting[]
	secondary_sections: SecondarySection[]
	notes: string[]
	combined_sections: SecondarySection[] // some classes have "combined sections", eg ANTH-196G Spring 2026
}

export type PrimarySection = {
	strm: string
	session_code: string
	class_nbr: string
	component: string
	acad_career: string
	subject: string
	class_section: string
	start_date: string
	end_date: string
	capacity: string
	enrl_total: string
	waitlist_capacity: string
	waitlist_total: string
	enrl_status: string
	credits: string
	grading: string
	title: string
	title_long: string
	description: string
	gened: string
	requirements: string
	catalog_nbr: string
}

export type Meeting = {
	days: string
	start_time: string
	end_time: string
	location: string
	instructors: Instructor[]
}

export type Instructor = {
	cruzid: string
	name: string
}

export type SecondarySection = {
	meetings: Meeting[]
	class_section: string
	component: string
	class_nbr: string
	enrl_total: string
	capacity: string
	waitlist_total: string
	waitlist_capacity: string
	enrl_status: string
}