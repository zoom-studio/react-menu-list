/* @flow */

import React from 'react';
import type {Ref as ReactRef, Node as ReactNode} from 'react';
import PropTypes from 'prop-types';

import type MenuEvent from './events/MenuEvent';
import ChosenEvent from './events/ChosenEvent';
import {MenuListContext} from './MenuList';
import type {MenuListContextValue, MenuListHandle} from './MenuList';
import setRef from './lib/setRef';
import type {Direction, Rect} from './types';

type State = {
  highlighted: boolean;
};

export type Props = {
  onItemChosen?: (event: ChosenEvent) => void;
  onLeftPushed?: (event: MenuEvent) => void;
  onRightPushed?: (event: MenuEvent) => void;
  onHighlightChange?: (highlighted: boolean, details: {byKeyboard?: boolean, prevCursorLocation?: Rect, direction?: Direction}) => void;

  className?: string;
  style?: Object;
  highlightedClassName?: string;
  highlightedStyle?: Object;

  index?: number;
  onMouseLeave?: (event: MouseEvent) => void;

  children?: ReactNode;

  domRef?: ReactRef<'div'>;

  'aria-haspopup'?: boolean;
  'aria-expanded'?: boolean;
};

export default class MenuItem extends React.Component<Props, State> {
  _menuListHandle: MenuListHandle;
  state = {
    highlighted: false
  };
  static propTypes = {
    onItemChosen: PropTypes.func,
    onHighlightChange: PropTypes.func,
    onLeftPushed: PropTypes.func,
    onRightPushed: PropTypes.func,

    className: PropTypes.string,
    style: PropTypes.object,
    highlightedClassName: PropTypes.string,
    highlightedStyle: PropTypes.object,

    index: PropTypes.number,
    onMouseLeave: PropTypes.func,

    children: PropTypes.node,

    domRef: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.func
    ]),

    'aria-haspopup': PropTypes.bool,
    'aria-expanded': PropTypes.bool
  };

  static contextType = MenuListContext;

  _el: ?HTMLDivElement;
  _elSetter = (el: ?HTMLDivElement) => {
    this._el = el;

    if (this.props.domRef) {
      setRef(this.props.domRef, el);
    }
  };

  hasHighlight(): boolean {
    return this.state.highlighted;
  }

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
    const el = this._el;
    /*:: if (!el) throw new Error(); */

    this._menuListHandle = (this.context: MenuListContextValue).registerItem(this.props, {
      notifyHighlighted: (highlighted: boolean, byKeyboard: ?boolean, direction: ?Direction, prevCursorLocation: ?Rect) => {
        this.setState({highlighted}, () => {
          if (highlighted && byKeyboard) {
            const el = this._el;
            /*:: if (!el) throw new Error(); */
            if (typeof (el: any).scrollIntoViewIfNeeded === 'function') {
              (el: any).scrollIntoViewIfNeeded();
            } else if (el.scrollIntoView) {
              el.scrollIntoView();
            }
          }
        });
        if (this.props.onHighlightChange) {
          this.props.onHighlightChange(highlighted, {
            byKeyboard: byKeyboard == null ? undefined : byKeyboard,
            prevCursorLocation: prevCursorLocation == null ? undefined : prevCursorLocation,
            direction: direction == null ? undefined : direction
          });
        }
      },
      notifyEvent: (event: MenuEvent) => {
        switch (event.type) {
        case 'chosen':
          /*:: if (!(event instanceof ChosenEvent)) throw new Error(); */
          if (this.props.onItemChosen) this.props.onItemChosen(event);
          break;
        case 'left':
          if (this.props.onLeftPushed) this.props.onLeftPushed(event);
          break;
        case 'right':
          if (this.props.onRightPushed) this.props.onRightPushed(event);
          break;
        }
      }
    }, el);
  }

  componentWillUnmount() {
    this._menuListHandle.unregister();
  }

  componentDidUpdate() {
    this._menuListHandle.updateProps(this.props);
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
        ref={this._elSetter}
        style={style}
        className={className}
        onClick={()=>this._menuListHandle.itemChosen()}
        onMouseEnter={() => this.highlight(false)}
        onMouseLeave={onMouseLeave || (() => this.unhighlight())}
        role="menuitem"
        aria-haspopup={this.props['aria-haspopup']}
        aria-expanded={this.props['aria-expanded']}
      >
        {children}
      </div>
    );
  }
}
