import React from 'react';
import { Text, Box, useApp, useInput } from 'ink';
import Spinner from 'ink-spinner';

export default function App() {
	// State
	const [isLoaded, setIsLoaded] = React.useState(false);
	const [stories, setStories] = React.useState([]);
	const [focusedStory, setFocusedStory] = React.useState(0);
	const [page, setPage] = React.useState(0);

	// Constants
	const page_size = 20;
	const hn_url = 'https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty';
	const orange_color = '#ff9900';

	// Init
	React.useEffect(() => {
		loadStories();
	}, []);

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

	function ordinalFormat(num) {
		switch (('' + num).length) {
			case 1:
				return `  ${num}`;
			case 2:
				return ` ${num}`;
			default:
				return `${num}`;
		}
	}

	// Input
	const UserInput = () => {
		const { exit } = useApp();

		useInput((input, key) => {
			if (input === 'q') {
				exit();
			}

			if (input === 'r') {
				loadStories(page_size);
			}

			if (input === 'n') {
				// Get next page
			}

			if (input === 'p') {
				// Get previous page
			}

			if (input === 'j') {
				// Focus next story
			}

			if (input === 'k') {
				// Focus previous story
			}
		});

		return true
	};



	// Components
	function HnLink(props) {
		return (
			<>
				<Text>
					<Text>{ordinalFormat(props.ordinal)}. </Text>
					<Text color={orange_color}>{props.title} - {props.score} {props.score > 1 ? "points" : "point"}</Text>
				</Text>
				<Text>
					<Text>     </Text>
					<Text dimColor underline color="#333">{props.url}</Text>
				</Text>
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

	function AppButton(props) {
		return (
			<Box borderStyle="round" borderColor={orange_color}>
				<Text>{props.text}</Text>
			</Box>
		)};

	// Render
	return (
		<>
			{ isLoaded ? undefined : <FetchSpinner type="growVertical" /> }
			{ stories.map((story, num) => ( <HnLink key={story.id}
																							ordinal={num    + 1}
																							title={story.title}
																							score={story.score}
																							url={story.url} /> )) }
			<Box>
				<AppButton text="Next"/>
				<AppButton text="Last"/>
				<AppButton text="Refresh"/>
			</Box>
			{ UserInput() }
		</>
	);
}
