/* @flow */

import Kefir from 'kefir';
import kefirBus from 'kefir-bus';
import React, {PropTypes} from 'react';

// import MenuListInspector from './MenuListInspector';
import FloatAnchor from './FloatAnchor';
import MenuListItem from './MenuListItem';

type State = {
  opened: boolean;
};

export default class SubMenuItem extends React.Component {
  static propTypes = {
    index: PropTypes.number,

    className: PropTypes.string,
    highlightedClassName: PropTypes.string,
    style: PropTypes.object,
    highlightedStyle: PropTypes.object,

    positionOptions: PropTypes.object,

    onItemChosen: PropTypes.func,
    onHighlightChange: PropTypes.func,

    onWillOpen: PropTypes.func,
    onDidOpen: PropTypes.func,
    onWillClose: PropTypes.func,

    children: PropTypes.node,
    menu: PropTypes.node
  };

  static defaultProps = {
    positionOptions: {position:'right', vAlign:'top', hAlign: 'left'}
  };

  state: State = {
    opened: false
  };

  _mouseEnterMenuEvents: Object = kefirBus();
  _stopper: Object = kefirBus();

  componentWillUnmount() {
    this._stopper.emit(null);
  }

  open() {
    if (this.state.opened) return;
    if (this.props.onWillOpen) this.props.onWillOpen();
    this.setState({opened: true}, this.props.onDidOpen);
    this.refs.menuListItem.takeKeyboard();
    this.refs.menuListItem.lockHighlight();
  }

  close() {
    if (!this.state.opened) return;
    if (this.props.onWillClose) this.props.onWillClose();
    this.setState({opened: false});
    this.refs.menuListItem.releaseKeyboard();
    this.refs.menuListItem.unlockHighlight();
  }

  toggle() {
    if (this.state.opened) {
      this.close();
    } else {
      this.open();
    }
  }

  _onHighlightChange(highlighted: boolean, event: Object) {
    if (highlighted && !event.byKeyboard) {
      this.open();
    } else if (!highlighted) {
      this.close();
    }
  }

  _onMouseLeaveItem(event: Object) {
    if (!this.state.opened) return;

    // If the mouse isn't going toward the menu, then unhighlight ourself.

    const menuRect = this.refs.menu.getBoundingClientRect();
    const menuX = (menuRect.left+menuRect.right)/2;
    const menuY = (menuRect.top+menuRect.bottom)/2;

    const startTime = Date.now();
    const startX = event.pageX, startY = event.pageY;
    const startDistance = Math.sqrt(Math.pow(startX-menuX, 2) + Math.pow(startY-menuY, 2));
    let lastCoords = {pageX: startX, pageY: startY};

    const MIN_SPEED = 30; //px per second
    const MAX_TIME = 0.75; //seconds

    // Listen to mouse moves, find the first event not going towards the menu,
    // and end it there. Or end after a timer.
    Kefir.fromEvents(window, 'mousemove')
      .bufferBy(Kefir.interval(100, null))
      .map(events => {
        if (events.length) {
          const last = events[events.length-1];
          lastCoords = {pageX: last.pageX, pageY: last.pageY};
        }
        return lastCoords;
      })
      .filter(({pageX, pageY}) => {
        const distance = Math.sqrt(Math.pow(pageX-menuX, 2) + Math.pow(pageY-menuY, 2));
        const maxDistance = startDistance - (Date.now()-startTime)/1000 * MIN_SPEED;
        return distance > maxDistance;
      })
      .merge(Kefir.later(MAX_TIME*1000))
      .take(1)
      .takeUntilBy(this._mouseEnterMenuEvents)
      .takeUntilBy(this._stopper)
      .onValue(() => {
        this.close();
        this.refs.menuListItem.unhighlight();
      });
  }

  _mouseEnterMenu() {
    this._mouseEnterMenuEvents.emit(null);
    this.refs.menuListItem.unlockHighlight();
  }

  render() {
    const {
      index, style, className,
      highlightedStyle, highlightedClassName, positionOptions,
      children, menu
    } = this.props;
    const {opened} = this.state;

    return (
      <MenuListItem
        ref="menuListItem"
        index={index}
        style={style}
        className={className}
        highlightedStyle={highlightedStyle}
        highlightedClassName={highlightedClassName}
        onHighlightChange={(h,e) => this._onHighlightChange(h,e)}
        onMouseLeave={e=>this._onMouseLeaveItem(e)}
        onItemChosen={e => {
          e.preventDefault();
          this.open();
          // TODO highlight first item of submenu if by keyboard
        }}
      >
        <FloatAnchor
          options={positionOptions}
          anchor={
            <div>
              {children}
            </div>
          }
          float={
            !opened ? null :
              <div
                ref="menu"
                onMouseEnter={()=>this._mouseEnterMenu()}
                >
                {menu}
              </div>
          }
          />
      </MenuListItem>
    );
  }
}
