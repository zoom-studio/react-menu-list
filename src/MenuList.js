/* @flow */

import React, {PropTypes} from 'react';
import {findDOMNode} from 'react-dom';
import Kefir from 'kefir';
import kefirStopper from 'kefir-stopper';
import findIndex from 'array-find-index';
import fromEventsCapture from './lib/fromEventsCapture';

export default class MenuList extends React.Component {
  _stopper: Object = kefirStopper();
  _listItems: Array<{
    props: Object;
    control: {setHighlighted(highlighted: boolean): void};
  }> = [];
  _highlightedIndex: ?number;

  static propTypes = {
    onLeftPushed: PropTypes.func,
    onRightPushed: PropTypes.func,
    onUpPushed: PropTypes.func,
    onDownPushed: PropTypes.func
  };

  static childContextTypes = {
    menulist: React.PropTypes.object
  };

  getChildContext(): Object {
    return {
      menulist: {
        registerItem: (props, control) => {
          const item = {props, control};

          const i = props.index == null ? -1 : findIndex(
            this._listItems,
            item => item.props.index != null && props.index < item.props.index
          );
          if (i < 0) {
            this._listItems.push(item);
          } else {
            this._listItems.splice(i, 0, item);
            if (this._highlightedIndex != null && i <= this._highlightedIndex) {
              this._highlightedIndex++;
            }
          }
          return {
            setHighlighted: (highlighted: boolean, scrollIntoView: boolean) => {
              const i = this._listItems.indexOf(item);
              if (i < 0) throw new Error("Already unregistered MenuListItem");
              this._highlight(i, scrollIntoView);
            },
            unregister: () => {
              const i = this._listItems.indexOf(item);
              if (i < 0) throw new Error("Already unregistered MenuListItem");
              if (i === this._highlightedIndex) {
                this._highlight(i === 0 ? null : i-1, true);
              } else if (this._highlightedIndex != null && i <= this._highlightedIndex) {
                this._highlightedIndex--;
              }
              this._listItems.splice(i, 1);
            }
          };
        },
        // TODO for nested lists
        onRightPushed() {},
        onLeftPushed() {},
        onUpPushed() {},
        onDownPushed() {}
      }
    };
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

  _highlight(index: ?number, scrollIntoView: boolean) {
    if (index == this._highlightedIndex) return;
    if (this._highlightedIndex != null) {
      this._listItems[this._highlightedIndex].control.setHighlighted(false);
    }
    this._highlightedIndex = index;
    if (index != null) {
      this._listItems[index].control.setHighlighted(true, scrollIntoView);
    }
  }

  _key(event: Object) {
    const {onLeftPushed, onRightPushed, onUpPushed, onDownPushed} = this.props;

    // TODO When an arrow is pressed and something is highlighted, first check
    // the MenuListItem for the appropriate callback, check whether we can move
    // the selection in that direction, and if those fail, try to hand the
    // event off to a parent MenuList if present.

    switch(event.which) {
      case 13: //enter
        if (this._highlightedIndex != null) {
          const {props} = this._listItems[this._highlightedIndex];
          if (props.onClick) {
            props.onClick(event);
          }
        }
        event.preventDefault();
        event.stopPropagation();
        break;
      // case 37: //left
      //   console.log('left');
      //   break;
      case 38: //up
        if (this._highlightedIndex == null || this._highlightedIndex == 0) {
          this._highlight(this._listItems.length-1, true);
        } else {
          this._highlight(this._highlightedIndex-1, true);
        }
        event.preventDefault();
        event.stopPropagation();
        break;
      // case 39: //right
      //   console.log('right');
      //   break;
      case 40: //down
        if (this._highlightedIndex == null || this._highlightedIndex == this._listItems.length-1) {
          this._highlight(0, true);
        } else {
          this._highlight(this._highlightedIndex+1, true);
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
    return (
      <div>
        MenuList:
        <div>{this.props.children}</div>
      </div>
    );
  }
}
