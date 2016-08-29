/* @flow */

import Kefir from 'kefir';

export default function fromEventsCapture(target: EventTarget, eventName: string): Kefir.Observable<Object> {
  return Kefir.stream(emitter => {
    target.addEventListener(eventName, emitter.emit, true);
    return () => {
      target.removeEventListener(eventName, emitter.emit, true);
    };
  });
}
