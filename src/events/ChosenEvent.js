/* @flow */

import MenuEvent from './MenuEvent';

export default class ChosenEvent extends MenuEvent {
  byKeyboard: boolean;

  constructor(type: string, byKeyboard: boolean) {
    super(type);
    this.byKeyboard = byKeyboard;
  }
}
