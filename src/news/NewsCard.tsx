import Tag from "./Tag";

interface NewsCardProps {
	title: string;
	link: string;
	summary: string;
	published: string;
	categories: string[],
	index: number
}

function formatDate(date: string) {
	return new Date(date).toLocaleString("en-US", {
		weekday: "short",
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit",
		hour12: true,
	})
}

export default function NewsCard(props: NewsCardProps) {
	return (
		<article
			className="RSS_FeedItem"
			style={{ "--delay": `${props.index * 115}ms` } as React.CSSProperties}
		>
			<h2 style={{ margin: 0, fontSize: 'inherit', fontWeight: 'inherit' }}>
				<a href={props.link} target="_blank" rel="noopener noreferrer">
					{props.title}
				</a>
			</h2>
			<br />
			<div style={{display: 'flex', flexWrap: 'wrap', columnGap: '5px', rowGap: '2px'}}>
				{props.categories.map(c => (<Tag name={c} />))}
			</div>
			<time className="date" dateTime={props.published}>{formatDate(props.published)}</time>
			<p style={{fontSize: '15px'}}>{props.summary}</p>
		</article>
	)
}