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
	const [page, setPage] = React.useState(0);

	// Constants
	const page_size = 25;
	const hn_url = 'https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty';
	const orange_color = '#ff9900';

	// Init
	React.useEffect(() => {
		fetchStories();
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

	async function fetchStories() {
		getHnStoryIds().then((ids) => {
			getHnStories(ids).then((returned_stories) => {
				setStories(returned_stories);
				setIsLoaded(true);
				setFocusedStory(returned_stories[0]);
				setFocusedStoryIndex(0);
				setPage(0);
			});
		});
	}

	function loadStories(page) {
		let startingIndex = page * page_size;
		return stories.slice(startingIndex, startingIndex + page_size)
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
				fetchStories();
			}

			if (input === 'n') {
				let newPage = page + 1;
				if (newPage * page_size < stories.length) {
					setPage(newPage);
					setFocusedStory(stories[newPage * page_size])
					setFocusedStoryIndex(newPage * page_size)
				}
			}

			if (input === 'p') {
				let newPage = page - 1;
				if (newPage >= 0) {
					setPage(newPage);
					setFocusedStory(stories[newPage * page_size])
					setFocusedStoryIndex(newPage * page_size)
				}
			}

			if (input === 'j') {
				if (focusedStoryIndex <  stories.length - 1) {
					const newIndex = focusedStoryIndex + 1;
					setFocusedStoryIndex(newIndex)
					setFocusedStory(stories[newIndex])
					if (newIndex >= (page + 1) * page_size) {
						setPage(page + 1)
					}
				}
			}

			if (input === 'k') {
				if (focusedStoryIndex >= 0) {
					const newIndex = focusedStoryIndex - 1;
					setFocusedStoryIndex(newIndex)
					setFocusedStory(stories[newIndex])
					if (newIndex < page * page_size) {
						setPage(page - 1)
					}
				}
			}

			if (input === 'o') {
				focusedStory.url
				? open(focusedStory.url)
				: open(`https://news.ycombinator.com/item?id=${focusedStory.id}`);
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
				setFocusedStory(stories[page_size * page])
				setFocusedStoryIndex(page_size * page)
			}

			if (input === '}') {
				setFocusedStory(stories[(page_size * page) + page_size - 1])
				setFocusedStoryIndex((page_size * page) + page_size - 1)
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
			{ loadStories(page).map((story, num) => ( <HnLink key={story.id}
																							ordinal={(page * page_size) + (num    + 1)}
																							title={story.title}
																							score={story.score}
																							url={(story.url || "Comments").substring(0,100)} /> )) }
			<Box>
				<AppButton text="Next"/>
				<AppButton text="Previous"/>
				<AppButton text="Refresh"/>
			</Box>
			{ UserInput() }
		</>
	);
}
