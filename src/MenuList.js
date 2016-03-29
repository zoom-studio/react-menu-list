/* @flow */

import React, {PropTypes} from 'react';
import {findDOMNode} from 'react-dom';
import Kefir from 'kefir';
import kefirStopper from 'kefir-stopper';
import findIndex from 'array-find-index';
import fromEventsCapture from './lib/fromEventsCapture';

import type {Props as MenuListItemProps} from './MenuListItem';
import type {MenuListInspectorContext} from './MenuListInspector';

// This type of object is given to a MenuListItem to talk to the MenuList.
export type MenuListItemHandle = {
  highlight(byKeyboard: boolean): void;
  unhighlight(): void;
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
  notifyChosen(event: Object): void;
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

        {
          const i = props.index == null ? -1 : findIndex(
            this._listItems,
            item => item.props.index != null && props.index < item.props.index
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
        }

        return {
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
            this._itemChosen(control);
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
          updateProps: (newProps: MenuListItemProps) => { // eslint-disable-line no-unused-vars
            // TODO handle index change
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

  _itemChosen(control: MenuListItemControl) {
    const event = {
      preventDefault() {
        this.defaultPrevented = true;
      },
      defaultPrevented: false
    };
    control.notifyChosen(event);
    if (this.props.onItemChosen) {
      this.props.onItemChosen(event);
    }
    const parentCtx = this._parentCtx();
    if (parentCtx) {
      parentCtx.dispatchEvent('itemChosen', event);
    }
  }

  _key(event: Object) {
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

    switch (event.which) {
    case 13: //enter
      if (visibleHighlightedIndex != null) {
        const {control} = this._listItems[visibleHighlightedIndex];
        this._itemChosen(control);
        event.preventDefault();
        event.stopPropagation();
      }
      break;
    // case 37: //left
    //   console.log('left');
    //   break;
    // case 39: //right
    //   console.log('right');
    //   break;
    case 38: //up
      if (this._naturalHighlightedIndex == null || this._naturalHighlightedIndex == 0) {
        this._naturalHighlight(this._listItems.length-1, true);
      } else {
        this._naturalHighlight(this._naturalHighlightedIndex-1, true);
      }
      event.preventDefault();
      event.stopPropagation();
      break;
    case 40: //down
      if (this._naturalHighlightedIndex == null || this._naturalHighlightedIndex == this._listItems.length-1) {
        this._naturalHighlight(0, true);
      } else {
        this._naturalHighlight(this._naturalHighlightedIndex+1, true);
      }
      event.preventDefault();
      event.stopPropagation();
      break;
    }
  }

  componentWillUnmount() {
    this._stopper.destroy();
  }

  render() {
    // TODO use a MenuListInspector here so we can watch child menu events?
    return (
      <div>
        MenuList:
        <div>{this.props.children}</div>
      </div>
    );
  }
}
