/* @flow */

import MenuEvent from './MenuEvent';
import type {Rect} from '../types';

export default class ChosenEvent extends MenuEvent {
  byKeyboard: boolean;
  prevCursorLocation: ?Rect;

  constructor(type: string, byKeyboard: boolean, prevCursorLocation: ?Rect) {
    super(type);
    this.byKeyboard = byKeyboard;
    this.prevCursorLocation = prevCursorLocation;
  }
}
