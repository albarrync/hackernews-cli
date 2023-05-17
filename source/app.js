import React from 'react';
import { Text, Box, Newline, useApp, useInput } from 'ink';
import Spinner from 'ink-spinner';
import open from 'open';

export default function App() {
	// State
	const [isLoaded, setIsLoaded] = React.useState(false);
	const [stories, setStories] = React.useState([]);
	const [focusedStory, setFocusedStory] = React.useState(0);
	const [focusedStoryIndex, setFocusedStoryIndex] = React.useState(0);
	const [page, setPage] = React.useState(1);

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
				setFocusedStory(returned_stories[0])
				setFocusedStoryIndex(0)
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
				setIsLoaded(false);
				loadStories(page_size);
			}

			if (input === 'n') {
				// Get next page
			}

			if (input === 'p') {
				// Get previous page
			}

			if (input === 'j') {
				if (focusedStoryIndex <  stories.length - 1) {
					const newIndex = focusedStoryIndex + 1;
					setFocusedStoryIndex(newIndex)
					setFocusedStory(stories[newIndex])
				}
			}

			if (input === 'k') {
				if (focusedStoryIndex >= 0) {
					const newIndex = focusedStoryIndex - 1;
					setFocusedStoryIndex(newIndex)
					setFocusedStory(stories[newIndex])
				}
			}

			if (input === 'o') {
				open(focusedStory.url);
			}

			if (input === 'c') {
				open(`https://news.ycombinator.com/item?id=${focusedStory.id}`);
			}

			if (input === 'u') {
				const jumpDistance = Math.ceil(page_size / 3);
				let newIndex = 0
				if (focusedStoryIndex - jumpDistance >= 0)
					newIndex = focusedStoryIndex - jumpDistance;
				setFocusedStoryIndex(newIndex)
				setFocusedStory(stories[newIndex])
			}

			if (input === 'd') {
				const jumpDistance = Math.ceil(page_size / 3);
				let newIndex = stories.length - 1
				if (focusedStoryIndex + jumpDistance < stories.length)
					newIndex = focusedStoryIndex + jumpDistance;
				setFocusedStoryIndex(newIndex)
				setFocusedStory(stories[newIndex])
			}

			if (input === '{') {
				setFocusedStory(stories[0])
				setFocusedStoryIndex(0)
			}

			if (input === '}') {
				setFocusedStory(stories[stories.length - 1])
				setFocusedStoryIndex(stories.length - 1)
			}
		});
		return true
	};

	// Components
	function HnLink(props) {
		return (
			<>
				<Text>
					<Text color={focusedStoryIndex + 1 === props.ordinal ? orange_color : null}>{ordinalFormat(props.ordinal)}. </Text>
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
																							url={story.url.substring(0,100)} /> )) }
			<Box>
				<AppButton text="Next"/>
				<AppButton text="Last"/>
				<AppButton text="Refresh"/>
			</Box>
			{ UserInput() }
		</>
	);
}
