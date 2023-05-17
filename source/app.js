import React from 'react';
import { Text } from 'ink';
import Spinner from 'ink-spinner';

export default function App() {
	// State
	const [isLoaded, setIsLoaded] = React.useState(false);
	const [stories, setStories] = React.useState([]);
	const page_size = 15;
	const hn_url = 'https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty';

	// Init
	React.useEffect(() => {
		loadStories();
	});

	// Functions
	async function getHnStoryIds() {
		const response = await fetch(hn_url);
		const data = await response.json();
		return data;
	}

	async function getHnStories(ids) {
		const stories = await ids.map(async (id) => {
			const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json?print=pretty`);
			const data = await response.json();
			return data;
		});
		return Promise.all(stories);
	}

	async function allStoryData(count) {
		getHnStoryIds().then((ids) => {
			getHnStories(ids).then((returned_stories) => {
				setStories(returned_stories.slice(0, count))
				setIsLoaded(true);
			});
		});
	}

	function loadStories() {
		allStoryData(page_size);
	}

	// Components
	function HnLink(props) {
		return (
			<>
				<Text color="#ff9900">{props.ordinal}. {props.title} - {props.score} {props.score > 1 ? "points" : "point"}</Text>
				<Text dimColor underline color="#333">{props.url}</Text>
			</>
		)}

	function FetchSpinner(props) {
		return (
			<Text>
				<Spinner type={props.type}/>
				<Text inverse color="yellow"> Fetching </Text>
			</Text>
		)
	}

	// Render
	return (
		<>
			{ isLoaded ? undefined : <FetchSpinner type="growVertical" /> }
			{ stories.map((story, num) => ( <HnLink key={story.id}
																							ordinal={num    + 1}
																							title={story.title}
																							score={story.score}
																							url={story.url} /> )) }
		</>
	);
}
