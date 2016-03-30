/* @flow */

export default class MenuEvent {
  type: string;
  cancelBubble: boolean = false;
  defaultPrevented: boolean = false;

  constructor(type: string) {
    this.type = type;
  }

  stopPropagation() {
    this.cancelBubble = true;
  }

  preventDefault() {
    this.defaultPrevented = true;
  }
}
