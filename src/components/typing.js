import yallist from 'yallist';
import keystrokesStream from '../subscriptions/keystrokes';
import dictionaryStream from '../subscriptions/dictionaries';
import * as _ from 'lodash';
import { fromEvent } from 'rxjs';
import { switchMap } from 'rxjs/operators';

window.wordsLL = null;
window.current = null;

// register an event listener for button object
const refreshWordsButton = document.getElementById('refreshWords');

/**
 * ------------------ Core functions ---------------
 */
const removeWords = () => {
	const elem = document.getElementById('words');
	while (elem.firstChild) {
		elem.removeChild(elem.firstChild);
	}
};

const addWords = () => {
	let fragment = document.createDocumentFragment();
	window.wordsLL.forEach((node) => {
		fragment.appendChild(node);
	});
	document.getElementById('words').appendChild(fragment);
	window.current = window.wordsLL.head;
};

const updateWordsOnScreen = (words) => {
	removeWords();
	//
	const domFragments = _(words)
		.map((word) => {
			let arr = [];
			for (let c of word) {
				let letterElem = document.createElement('letter');
				letterElem.innerText = c;
				arr.push(letterElem);
			}
			let letterElem = document.createElement('letter');
			letterElem.innerText = ' ';
			arr.push(letterElem);
			return arr;
		})
		.flatten()
		.value();
	// Reset and create linked list
	wordsLL = null;
	wordsLL = yallist.create(domFragments);

	addWords();
};

const handleKeystroke = (key, currentNode) => {
	if (key === currentNode.value.innerText) {
		currentNode.value.classList.add('text-green-700');
	} else {
		currentNode.value.classList.add('text-red-700');
	}
	if (currentNode.next) window.current = currentNode.next;
};

const handleBackspace = () => {
	if (window.current.prev) {
		window.current.prev.value.removeAttribute('class');
		window.current = window.current.prev;
	}
};

/**
 * ------------------ Subscription Handling ---------------
 */
//
const dictionaryStreamSub = dictionaryStream.subscribe((words) => {
	updateWordsOnScreen(words);
});

// Monitor Keystrokes and take action
const keystrokesStreamSub = keystrokesStream.subscribe((letter) => {
	// console.log(letter);
	switch (letter.keyCode) {
		// Backspace
		case 8:
			letter.preventDefault();
			handleBackspace();
			break;

		default:
			handleKeystroke(letter.key, window.current);
			break;
	}
});
// Refresh words on screen when user takes action
const refreshWordsSub = fromEvent(refreshWordsButton, 'click')
	.pipe(switchMap(() => dictionaryStream))
	.subscribe((words) => {
		updateWordsOnScreen(words);
	});

// Add event listener to unsubscribe when the window is closed to prevent memory leaks
window.addEventListener('unload', () => {
	keystrokesStreamSub.unsubscribe();
	dictionaryStreamSub.unsubscribe();
	refreshWordsSub.unsubscribe();
});
