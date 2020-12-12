import * as rx from 'rxjs';

const keystrokesStream = rx.fromEvent(document, 'keydown');

export default keystrokesStream;
