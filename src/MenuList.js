/* @flow */

import React, {PropTypes} from 'react';
import {findDOMNode} from 'react-dom';
import Kefir from 'kefir';
import kefirStopper from 'kefir-stopper';
import findIndex from 'array-find-index';
import fromEventsCapture from './lib/fromEventsCapture';

import MenuEvent from './events/MenuEvent';
import ChosenEvent from './events/ChosenEvent';
import type {Props as MenuListItemProps} from './MenuListItem';
import type {MenuListInspectorContext} from './MenuListInspector';
import type {Direction, Rect} from './types';

// This type of object is given to a MenuListItem to talk to the MenuList.
export type MenuListItemHandle = {
  highlight(byKeyboard: boolean): void;
  unhighlight(): void;
  moveCursor(direction: Direction, prevCursorLocation: ?Rect): void;
  itemChosen(): void;
  takeKeyboard(): void;
  releaseKeyboard(): void;
  lockHighlight(): void;
  unlockHighlight(): void;
  updateProps(props: MenuListItemProps): void;
  unregister(): void;
};

// This type of object is given to a MenuList to talk to a MenuListItem.
export type MenuListItemControl = {
  notifyHighlighted(highlighted: boolean, byKeyboard: ?boolean): void;
  notifyEvent(event: MenuEvent): void;
};

// This is the type of the object that MenuList gives as context to its
// descendants.
export type MenuListContext = {
  registerItem(
    props: MenuListItemProps,
    control: MenuListItemControl
  ): MenuListItemHandle;
};

export default class MenuList extends React.Component {
  static propTypes = {
    onItemChosen: PropTypes.func,
    onLeftPushed: PropTypes.func,
    onRightPushed: PropTypes.func,
    onUpPushed: PropTypes.func,
    onDownPushed: PropTypes.func,
    children: PropTypes.node
  };

  _stopper: Object = kefirStopper();
  _listItems: Array<{
    props: MenuListItemProps;
    control: MenuListItemControl;
  }> = [];

  _naturalHighlightedIndex: ?number;
  _lockedHighlightedIndex: ?number;
  _keyboardTakenByIndex: ?number;

  _getVisibleHighlightedIndex(): ?number {
    return this._lockedHighlightedIndex != null ?
      this._lockedHighlightedIndex : this._naturalHighlightedIndex;
  }

  static childContextTypes = {
    menuList: React.PropTypes.object
  };

  static contextTypes = {
    menuListInspector: React.PropTypes.object
  };

  getChildContext(): Object {
    const menuList: MenuListContext = {
      registerItem: (props, control) => {
        const item = {props, control};

        const register = () => {
          const i = item.props.index == null ? -1 : findIndex(
            this._listItems,
            _item => _item.props.index != null && item.props.index < _item.props.index
          );
          if (i < 0) {
            this._listItems.push(item);
          } else {
            this._listItems.splice(i, 0, item);
            if (this._naturalHighlightedIndex != null && i <= this._naturalHighlightedIndex) {
              this._naturalHighlightedIndex++;
            }
            if (this._lockedHighlightedIndex != null && i <= this._lockedHighlightedIndex) {
              this._lockedHighlightedIndex++;
            }
            if (this._keyboardTakenByIndex != null && i <= this._keyboardTakenByIndex) {
              this._keyboardTakenByIndex++;
            }
          }
        };

        register();

        const menuListItemHandle: MenuListItemHandle = {
          highlight: (byKeyboard: boolean) => {
            const i = this._listItems.indexOf(item);
            if (i < 0) throw new Error('Already unregistered MenuListItem');
            this._naturalHighlight(i, byKeyboard);
          },
          unhighlight: () => {
            const i = this._listItems.indexOf(item);
            if (i < 0) throw new Error('Already unregistered MenuListItem');
            if (this._naturalHighlightedIndex === i) {
              this._naturalHighlight(null, false);
            }
          },
          itemChosen: () => {
            this._dispatchEvent(control, new ChosenEvent('chosen', false));
          },
          takeKeyboard: () => {
            const i = this._listItems.indexOf(item);
            if (i < 0) throw new Error('Already unregistered MenuListItem');
            this._keyboardTakenByIndex = i;
          },
          releaseKeyboard: () => {
            const i = this._listItems.indexOf(item);
            if (i < 0) throw new Error('Already unregistered MenuListItem');
            if (this._keyboardTakenByIndex === i) {
              this._keyboardTakenByIndex = null;
            }
          },
          lockHighlight: () => {
            const i = this._listItems.indexOf(item);
            if (i < 0) throw new Error('Already unregistered MenuListItem');
            this._lockHighlight(i);
          },
          unlockHighlight: () => {
            const i = this._listItems.indexOf(item);
            if (i < 0) throw new Error('Already unregistered MenuListItem');
            if (this._lockedHighlightedIndex === i) {
              this._lockHighlight(null);
            }
          },
          moveCursor: (direction: Direction, prevCursorLocation: ?Rect) => {
            this.moveCursor(direction, prevCursorLocation);
          },
          updateProps: (newProps: MenuListItemProps) => {
            if (item.props.index !== newProps.index) {
              menuListItemHandle.unregister();
              props = newProps;
              item.props = newProps;
              register();
            } else {
              props = newProps;
              item.props = newProps;
            }
          },
          unregister: () => {
            const i = this._listItems.indexOf(item);
            if (i < 0) throw new Error('Already unregistered MenuListItem');
            if (i === this._naturalHighlightedIndex) {
              this._naturalHighlight(null, true);
            }
            if (i === this._lockedHighlightedIndex) {
              this._lockHighlight(null);
            }
            if (i === this._keyboardTakenByIndex) {
              this._keyboardTakenByIndex = null;
            } else if (this._keyboardTakenByIndex != null && i < this._keyboardTakenByIndex) {
              this._keyboardTakenByIndex--;
            }
            this._listItems.splice(i, 1);
          }
        };
        return menuListItemHandle;
      }
    };
    return {menuList};
  }

  _parentCtx(): ?MenuListInspectorContext {
    return this.context.menuListInspector;
  }

  componentDidMount() {
    const isEnterKey = e => e.which === 13;
    const isArrowKey = e => 37 <= e.which && e.which <= 40;
    const el = findDOMNode(this);

    // The only things that should receive keydown/keypress events before us
    // are our children. This allows a MenuListItem to contain a text input
    // which selectively stops propagation on key events for example.
    Kefir.merge([
      Kefir.merge([
        Kefir.fromEvents(window, 'keydown').filter(isArrowKey),
        Kefir.fromEvents(window, 'keypress').filter(isEnterKey)
      ])
        .filter(e => el.contains(e.target)),
      Kefir.merge([
        fromEventsCapture(window, 'keydown').filter(isArrowKey),
        fromEventsCapture(window, 'keypress').filter(isEnterKey)
      ])
        .filter(e => !el.contains(e.target))
    ])
      .takeUntilBy(this._stopper)
      .onValue(event => this._key(event));

    const parentCtx = this._parentCtx();
    if (parentCtx) {
      parentCtx.registerMenuList(this);
    }
  }

  componentWillUnmount() {
    this._stopper.destroy();

    const parentCtx = this._parentCtx();
    if (parentCtx) {
      parentCtx.unregisterMenuList(this);
    }
  }

  _naturalHighlight(index: ?number, byKeyboard: boolean) {
    const visibleHighlightedIndex = this._getVisibleHighlightedIndex();

    if (this._lockedHighlightedIndex != null && byKeyboard) {
      this._lockedHighlightedIndex = null;
    }
    this._naturalHighlightedIndex = index;
    if (this._lockedHighlightedIndex == null) {
      if (index != null) {
        this._listItems[index].control.notifyHighlighted(true, byKeyboard);
      }
      if (visibleHighlightedIndex != null && visibleHighlightedIndex != index) {
        this._listItems[visibleHighlightedIndex].control.notifyHighlighted(false);
      }
    }
  }

  _lockHighlight(index: ?number) {
    if (index === this._lockedHighlightedIndex) return;
    const visibleHighlightedIndex = this._getVisibleHighlightedIndex();
    this._lockedHighlightedIndex = index;
    const newVisibleHighlightedIndex = this._getVisibleHighlightedIndex();
    if (visibleHighlightedIndex != null && newVisibleHighlightedIndex == null) {
      // When unlocking, prefer to keep the current selection over de-selecting
      // everything.
      this._naturalHighlightedIndex = visibleHighlightedIndex;
    } else if (visibleHighlightedIndex != newVisibleHighlightedIndex) {
      if (visibleHighlightedIndex != null) {
        this._listItems[visibleHighlightedIndex].control.notifyHighlighted(false);
      }
      if (newVisibleHighlightedIndex != null) {
        this._listItems[newVisibleHighlightedIndex].control.notifyHighlighted(true, false);
      } else if (this._naturalHighlightedIndex != null) {
        this._listItems[this._naturalHighlightedIndex].control.notifyHighlighted(true, false);
      }
    }
  }

  _dispatchEvent(control: ?MenuListItemControl, event: MenuEvent) {
    if (control) {
      control.notifyEvent(event);
      if (event.cancelBubble) return;
    }
    switch (event.type) {
    case 'chosen':
      if (this.props.onItemChosen) this.props.onItemChosen(event);
      break;
    // case 'up':
    //   break;
    // case 'down':
    //   break;
    case 'left':
      if (this.props.onLeftPushed) this.props.onLeftPushed(event);
      break;
    case 'right':
      if (this.props.onRightPushed) this.props.onRightPushed(event);
      break;
    }
    if (event.cancelBubble) return;
    const parentCtx = this._parentCtx();
    if (parentCtx) {
      parentCtx.dispatchEvent(event);
    }
  }

  _key(event: KeyboardEvent) {
    if (this._keyboardTakenByIndex != null) {
      return;
    }

    const {onLeftPushed, onRightPushed, onUpPushed, onDownPushed} = this.props; // eslint-disable-line no-unused-vars

    // TODO When an arrow is pressed and something is highlighted, first check
    // the MenuListItem for the appropriate callback, check whether we can move
    // the selection in that direction, and if those fail, try to hand the
    // event off to a parent MenuList if present.

    const visibleHighlightedIndex = this._getVisibleHighlightedIndex();

    // Relation between keys and highlight locking:
    // enter, left, right activate for the current visibly selected item.
    // up and down de-activate any locks in place, so that they act from the last
    // naturally-selected item.

    let mEvent = null;

    switch (event.which) {
    case 13: //enter
      mEvent = new ChosenEvent('chosen', true);
      event.preventDefault();
      event.stopPropagation();
      break;
    case 37: //left
      mEvent = new MenuEvent('left');
      break;
    case 39: //right
      mEvent = new MenuEvent('right');
      break;
    case 38: //up
      event.preventDefault();
      event.stopPropagation();
      this.moveCursor('up');
      break;
    case 40: //down
      event.preventDefault();
      event.stopPropagation();
      this.moveCursor('down');
      break;
    }

    if (mEvent) {
      const control = visibleHighlightedIndex == null ? null :
        this._listItems[visibleHighlightedIndex].control;
      this._dispatchEvent(control, mEvent);
      if (mEvent.defaultPrevented) event.preventDefault();
      if (mEvent.defaultPrevented || mEvent.cancelBubble) event.stopPropagation();
    }
  }

  moveCursor(direction: Direction, prevCursorLocation: ?Rect) { //eslint-disable-line no-unused-vars
    // TODO pass prevCursorLocation to item's onHighlightChange callback's event
    switch (direction) {
    case 'up':
      if (this._naturalHighlightedIndex == null || this._naturalHighlightedIndex == 0) {
        this._naturalHighlight(this._listItems.length-1, true);
      } else {
        this._naturalHighlight(this._naturalHighlightedIndex-1, true);
      }
      break;
    case 'down':
      if (this._naturalHighlightedIndex == null || this._naturalHighlightedIndex == this._listItems.length-1) {
        this._naturalHighlight(0, true);
      } else {
        this._naturalHighlight(this._naturalHighlightedIndex+1, true);
      }
      break;
    }
  }

  render() {
    return (
      <div
        onMouseDown={e=>e.preventDefault()}
      >
        {this.props.children}
      </div>
    );
  }
}
