interface NewsSidebarProps {
	FEEDS: string[];

	setSelectedFeeds: (feeds: string[]) => void;
	selectedFeeds: string[];
	toggleFeed: (feed: string) => void;
}

export default function NewsSidebar({ FEEDS, setSelectedFeeds, selectedFeeds, toggleFeed }: NewsSidebarProps) {
	return (
		<div className="SideBar">
			<div>
				<h2>Categories</h2>

				{FEEDS.map((feed) => (
					<div key={feed} className="IndividualCheckBox">
						<label>
							<input
								type="checkbox"
								checked={selectedFeeds.includes(feed)}
								onChange={() => toggleFeed(feed)}
							/>
							{feed}
						</label>
					</div>
				))}
			</div>


			<button
				onClick={() => {
					if (selectedFeeds.length < FEEDS.length) { // some are unselected
						setSelectedFeeds(FEEDS);
						localStorage.setItem("selectedFeeds", JSON.stringify(FEEDS));
					}
					else {
						setSelectedFeeds([]);
						localStorage.setItem("selectedFeeds", JSON.stringify([]));
					}
				}}
				className="filterButton"
				style={{ marginBottom: '10px', width: '100%' }}>
				{selectedFeeds.length === FEEDS.length ? "Deselect All" : "Select All"}
			</button>
		</div>
	)
}