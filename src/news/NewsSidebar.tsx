interface NewsSidebarProps {
	FEEDS: string[];
	selectedFeeds: string[];
	toggleFeed: (feed: string) => void;
}

export default function NewsSidebar({ FEEDS, selectedFeeds, toggleFeed }: NewsSidebarProps) {
	return (
		<div className="SideBar">
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
	)
}