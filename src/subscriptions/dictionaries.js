import * as rx from 'rxjs';
import * as _ from 'lodash';
import * as dictionary from '../../static/english_1k.json';
import { map, tap } from 'rxjs/operators';

const dictionariesStream = rx.of(dictionary.words).pipe(
	map((words) =>  _.shuffle(words)),
	map((words) => words.slice(0, 30)),
	// tap(words => console.log(words.length))
);

export default dictionariesStream;
