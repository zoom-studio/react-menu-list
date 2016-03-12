/* @flow */

import React, {PropTypes} from 'react';
import Kefir from 'kefir';
import kefirStopper from 'kefir-stopper';
import findIndex from 'array-find-index';

export default class MenuList extends React.Component {
  _stopper: Object = kefirStopper();
  _listItems: Array<{
    props: Object;
    control: {setHighlighted(selected: boolean): void};
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
            unregister: () => {
              const i = this._listItems.indexOf(item);
              if (i < 0) return;
              if (i === this._highlightedIndex) {
                this._select(i === 0 ? null : i-1);
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
    Kefir.fromEvents(window, 'keydown')
      .takeUntilBy(this._stopper)
      .onValue(event => this._keydown(event));
  }

  _select(index: ?number) {
    if (this._highlightedIndex != null) {
      this._listItems[this._highlightedIndex].control.setHighlighted(false);
    }
    this._highlightedIndex = index;
    if (index != null) {
      this._listItems[index].control.setHighlighted(true);
    }
  }

  _keydown(event: Object) {
    const {onLeftPushed, onRightPushed, onUpPushed, onDownPushed} = this.props;

    switch(event.which) {
      case 13: //enter
        if (this._highlightedIndex != null) {
          const {props} = this._listItems[this._highlightedIndex];
          if (props.onSelect) {
            props.onSelect(event);
          }
        }
        break;
      // case 37: //left
      //   console.log('left');
      //   break;
      case 38: //up
        if (this._highlightedIndex == null || this._highlightedIndex == 0) {
          this._select(this._listItems.length-1);
        } else {
          this._select(this._highlightedIndex-1);
        }
        event.preventDefault();
        event.stopPropagation();
        break;
      // case 39: //right
      //   console.log('right');
      //   break;
      case 40: //down
        if (this._highlightedIndex == null || this._highlightedIndex == this._listItems.length-1) {
          this._select(0);
        } else {
          this._select(this._highlightedIndex+1);
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
