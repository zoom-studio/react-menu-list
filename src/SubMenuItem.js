/* @flow */

import Kefir from 'kefir';
import kefirBus from 'kefir-bus';
import React, {PropTypes} from 'react';
import pointRectDistance from './lib/pointRectDistance';

import MenuListInspector from './MenuListInspector';
import FloatAnchor from 'react-float-anchor';
import MenuItem from './MenuItem';

import type MenuEvent from './events/MenuEvent';
import type ChosenEvent from './events/ChosenEvent';

type State = {
  opened: boolean;
};

export default class SubMenuItem extends React.Component {
  static propTypes = {
    menu: PropTypes.node,
    positionOptions: PropTypes.object,
    menuZIndex: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

    onWillOpen: PropTypes.func,
    onDidOpen: PropTypes.func,
    onWillClose: PropTypes.func,

    className: PropTypes.string,
    style: PropTypes.object,
    highlightedClassName: PropTypes.string,
    highlightedStyle: PropTypes.object,
    index: PropTypes.number,

    openedClassName: PropTypes.string,
    openedStyle: PropTypes.object,

    onItemChosen: PropTypes.func,
    onHighlightChange: PropTypes.func,

    children: PropTypes.node
  };

  static defaultProps = {
    positionOptions: {position:'right', vAlign:'top', hAlign: 'left'}
  };

  state: State = {
    opened: false
  };

  _resetMouseLeaveWatcher: Object = kefirBus();
  _stopper: Object = kefirBus();

  componentWillUnmount() {
    this._stopper.emit(null);
  }

  open() {
    this.refs.menuItem.lockHighlight();
    if (this.state.opened) return;
    if (this.props.onWillOpen) this.props.onWillOpen();
    this.setState({opened: true}, this.props.onDidOpen);
    this.refs.menuItem.takeKeyboard();
  }

  close() {
    if (!this.state.opened) return;
    if (this.props.onWillClose) this.props.onWillClose();
    this.setState({opened: false});
    this.refs.menuItem.releaseKeyboard();
    this.refs.menuItem.unlockHighlight();
  }

  toggle() {
    if (this.state.opened) {
      this.close();
    } else {
      this.open();
    }
  }

  reposition() {
    this.refs.floatAnchor.reposition();
  }

  _onHighlightChange(highlighted: boolean, event: Object) {
    this._resetMouseLeaveWatcher.emit(null);

    if (highlighted && !event.byKeyboard) {
      const OPEN_DELAY = 200;

      Kefir.later(OPEN_DELAY)
        .takeUntilBy(this._resetMouseLeaveWatcher)
        .takeUntilBy(this._stopper)
        .onValue(() => {
          this.open();
        });
    } else if (!highlighted) {
      this.close();
    }
  }

  _onMouseLeaveItem(event: Object) {
    if (!this.state.opened) {
      this.refs.menuItem.unhighlight();
      return;
    }

    // If the mouse isn't going toward the menu, then unhighlight ourself.

    const menuRect = this.refs.menuContainer.getBoundingClientRect();

    const startTime = Date.now();
    const startX = event.pageX, startY = event.pageY;

    function getDistance(x, y) {
      return pointRectDistance(x, y, menuRect.left, menuRect.top, menuRect.right-menuRect.width, menuRect.bottom-menuRect.top);
    }

    const startDistance = getDistance(startX, startY);
    let lastCoords = {pageX: startX, pageY: startY};

    // pixels per second the user must be moving the mouse toward the menu for
    // the menu to stay open.
    const MIN_SPEED = 60;

    // ms before the menu will close if the user hasn't reached it yet, no
    // matter how they're moving the cursor toward it.
    const MAX_TIME = 750;

    // ms to offset start time, to set maxDistance back a little so it's not so
    // unforgiving at the very start.
    const LEAD_TIME = 50;

    // Listen to mouse moves, find the first event not going towards the menu,
    // and end it there. Or end after a timer.
    Kefir.fromEvents(window, 'mousemove')
      .bufferBy(Kefir.interval(60, null))
      .map(events => {
        if (events.length) {
          const last = events[events.length-1];
          lastCoords = {pageX: last.pageX, pageY: last.pageY};
        }
        return lastCoords;
      })
      .filter(({pageX, pageY}) => {
        const distance = getDistance(pageX, pageY);
        const maxDistance = startDistance - (Date.now()-startTime-LEAD_TIME)/1000 * MIN_SPEED;
        return distance > maxDistance;
      })
      .merge(Kefir.later(MAX_TIME*1000))
      .take(1)
      .takeUntilBy(this._resetMouseLeaveWatcher)
      .takeUntilBy(this._stopper)
      .onValue(() => {
        this.close();
        this.refs.menuItem.unhighlight();
      });
  }

  _mouseEnterMenu() {
    this._resetMouseLeaveWatcher.emit(null);
    this.refs.menuItem.unlockHighlight();
  }

  render() {
    const {
      index, highlightedStyle, highlightedClassName,
      positionOptions, menuZIndex, children, menu
    } = this.props;
    const {opened} = this.state;

    let style = this.props.style;
    let className = this.props.className;
    if (opened) {
      if (this.props.openedStyle) {
        style = {...style, ...this.props.openedStyle};
      }
      if (this.props.openedClassName) {
        className = `${className||''} ${this.props.openedClassName}`;
      }
    }

    return (
      <MenuItem
        ref="menuItem"
        index={index}
        style={style}
        className={className}
        highlightedStyle={highlightedStyle}
        highlightedClassName={highlightedClassName}
        onHighlightChange={(h,e) => this._onHighlightChange(h,e)}
        onMouseLeave={e => this._onMouseLeaveItem(e)}
        onRightPushed={(e: MenuEvent) => {
          if (!this.state.opened) {
            e.stopPropagation();
            e.preventDefault();
            this.open();
            this.refs.menuInspector.moveCursor('down');
          }
        }}
        onItemChosen={(e: ChosenEvent) => {
          e.stopPropagation();
          e.preventDefault();
          this.open();
          if (e.byKeyboard) {
            this.refs.menuInspector.moveCursor('down');
          }
        }}
        aria-haspopup={true}
        aria-expanded={opened}
      >
        <FloatAnchor
          ref="floatAnchor"
          options={positionOptions}
          zIndex={menuZIndex}
          anchor={
            <div>
              {children}
            </div>
          }
          float={
            !opened ? null :
              <MenuListInspector
                ref="menuInspector"
                onLeftPushed={e => {
                  e.stopPropagation();
                  e.preventDefault();
                  this.close();
                }}
              >
                <div
                  ref="menuContainer"
                  onMouseEnter={()=>this._mouseEnterMenu()}
                  >
                  {menu}
                </div>
              </MenuListInspector>
          }
          />
      </MenuItem>
    );
  }
}
