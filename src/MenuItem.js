/* @flow */

import React, {PropTypes} from 'react';
import {findDOMNode} from 'react-dom';

import type MenuEvent from './events/MenuEvent';
import type {MenuListContext, MenuListHandle} from './MenuList';
import type {Direction, Rect} from './types';

type State = {
  highlighted: boolean;
};

export type Props = {
  index?: ?number;

  className?: ?string;
  highlightedClassName?: ?string;
  style?: ?Object;
  highlightedStyle?: ?Object;

  onMouseLeave?: ?Function;

  onItemChosen?: ?Function;
  onHighlightChange?: ?Function;
  onLeftPushed?: ?Function;
  onRightPushed?: ?Function;
  onUpPushed?: ?Function;
  onDownPushed?: ?Function;

  children: any;
};

export default class MenuItem extends React.Component {
  _menuListHandle: MenuListHandle;
  state: State = {
    highlighted: false
  };
  static propTypes = {
    index: PropTypes.number,

    className: PropTypes.string,
    highlightedClassName: PropTypes.string,
    style: PropTypes.object,
    highlightedStyle: PropTypes.object,

    onMouseLeave: PropTypes.func,

    onItemChosen: PropTypes.func,
    onHighlightChange: PropTypes.func,
    onLeftPushed: PropTypes.func,
    onRightPushed: PropTypes.func,
    onUpPushed: PropTypes.func,
    onDownPushed: PropTypes.func,

    children: PropTypes.node
  };

  static contextTypes = {
    menuList: React.PropTypes.object
  };

  takeKeyboard() {
    this._menuListHandle.takeKeyboard();
  }

  releaseKeyboard() {
    this._menuListHandle.releaseKeyboard();
  }

  lockHighlight() {
    this._menuListHandle.lockHighlight();
  }

  unlockHighlight() {
    this._menuListHandle.unlockHighlight();
  }

  // byKeyboard forces focus immediately and scrolls the item into view.
  // With it false, the highlight might be delayed depending on mouse movement
  // and won't cause anything to scroll.
  highlight(byKeyboard: boolean=true) {
    this._menuListHandle.highlight(byKeyboard);
  }

  unhighlight() {
    this._menuListHandle.unhighlight();
  }

  moveCursor(direction: Direction, prevCursorLocation: ?Rect) {
    this._menuListHandle.moveCursor(direction, prevCursorLocation);
  }

  componentDidMount() {
    this._menuListHandle = (this.context.menuList:MenuListContext).registerItem(this.props, {
      notifyHighlighted: (highlighted: boolean, byKeyboard: ?boolean) => {
        this.setState({highlighted}, () => {
          if (highlighted && byKeyboard) {
            const el = findDOMNode(this);
            if (el.scrollIntoViewIfNeeded) {
              el.scrollIntoViewIfNeeded();
            } else if (el.scrollIntoView) {
              el.scrollIntoView();
            }
          }
        });
        if (this.props.onHighlightChange) {
          this.props.onHighlightChange(highlighted, {byKeyboard});
        }
      },
      notifyEvent: (event: MenuEvent) => {
        switch (event.type) {
        case 'chosen':
          if (this.props.onItemChosen) this.props.onItemChosen(event);
          break;
        case 'up':
          if (this.props.onUpPushed) this.props.onUpPushed(event);
          break;
        case 'down':
          if (this.props.onDownPushed) this.props.onDownPushed(event);
          break;
        case 'left':
          if (this.props.onLeftPushed) this.props.onLeftPushed(event);
          break;
        case 'right':
          if (this.props.onRightPushed) this.props.onRightPushed(event);
          break;
        }
      }
    }, findDOMNode(this));
  }

  componentWillUnmount() {
    this._menuListHandle.unregister();
  }

  componentWillReceiveProps(newProps: Props) {
    this._menuListHandle.updateProps(newProps);
  }

  render() {
    const {children, onMouseLeave} = this.props;
    const {highlighted} = this.state;

    let style = this.props.style;
    let className = this.props.className;
    if (highlighted) {
      if (this.props.highlightedStyle) {
        style = {...style, ...this.props.highlightedStyle};
      }
      if (this.props.highlightedClassName) {
        className = `${className||''} ${this.props.highlightedClassName}`;
      }
    }

    return (
      <div
        style={style}
        className={className}
        onClick={()=>this._menuListHandle.itemChosen()}
        onMouseEnter={() => this.highlight(false)}
        onMouseLeave={onMouseLeave || (() => this.unhighlight())}
        >
        {children}
      </div>
    );
  }
}
