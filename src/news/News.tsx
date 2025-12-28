import { useEffect, useState, useContext } from "react";
import { TopBar as MobileTopBar } from "../components/navbar/mobile/TopBar";
import { TopBar as DesktopTopBar } from "../components/navbar/desktop/TopBar";
import "./News.css";
import { Error } from "../Loading";
import { BASE_API_URL } from "../constants";
import NewsCard from "./NewsCard";
import { Context } from "../Context";
import NewsSidebar from "./NewsSidebar";
import NewsFilter from "./NewsFilter";

type FeedItem = {
	title: string;
	link: string;
	published: string;
	summary: string;
	categories: string[];
};

const FEEDS = [
	"Campus News",
	"Arts & Culture",
	"Climate & Sustainability",
	"Earth & Space",
	"Health",
	"Social Justice & Community",
	"Student Experience",
	"Technology",
	"Baskin Undergrad Newsletter",
	"Baskin Community News",
];

export default function RssFeed() {
	const ctx = useContext(Context);

	const [selectedFeeds, setSelectedFeeds] = useState<string[]>(() => {
		const storedFeeds = localStorage.getItem("selectedFeeds");
		if (storedFeeds) {
			return JSON.parse(storedFeeds);
		}
		return FEEDS; // Default to all feeds selected'
	});

	const [selectedItems, setSelectedItems] = useState<FeedItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);
	const toggleFeed = (key: string) => {
		const selected = selectedFeeds.includes(key) ? selectedFeeds.filter((k) => k !== key) : [...selectedFeeds, key]
		setSelectedFeeds(selected);
		localStorage.setItem("selectedFeeds", JSON.stringify(selected));
	};

	useEffect(() => {
		setLoading(true);
		setError(false);

		const fetchFeeds = async () => {
			if (selectedFeeds.length === 0) {
				setSelectedItems([]);
				setLoading(false);
				return;
			}

			try {
				// instead of shoving everything into query parameters, encode the filters into 
				// a bitmask on a 16-bit int. 
				let encoded = 0x00;
				for (let i = 0; i < FEEDS.length; i++) {
					if (selectedFeeds.includes(FEEDS[i]))
						encoded |= 0x01 << i;
				}

				const results = await fetch(`${BASE_API_URL}/rss?categories=${encoded}`).then(res => res.json())
				const allItems: FeedItem[] = [].concat(...results);
				allItems.sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime());

				// setAllItems(allItems);
				setSelectedItems(allItems);
			} catch (error) {
				setError(true);
				console.error("Failed to fetch feeds:", error);
			} finally {
				setLoading(false);
			}
		};
		fetchFeeds();
	}, [selectedFeeds]);

	return (
		<>
			{ctx!.mobile ? <MobileTopBar /> : <DesktopTopBar />}

			<div className="RssFeedMain">
				{!ctx!.mobile ? <NewsSidebar {...{ FEEDS, selectedFeeds, toggleFeed }} /> : <></>}

				{error ? <Error>Error Loading News</Error> :
					<div className="RSS_Feed">
						<div style={{ textAlign: 'left' }}>
							<h1 style={{marginBottom: '-33px'}}>UCSC News</h1>
							{ctx!.mobile ? <NewsFilter {...{ FEEDS, selectedFeeds, toggleFeed }} /> : <></>}
						</div>

						{loading && <div style={{ fontSize: 20, margin: 0, padding: 0 }}>Loading...</div>}
						{selectedItems.map((item, i) => (
							<NewsCard key={i} {...item} />
						))}
					</div>}
			</div>
		</>
	);
};