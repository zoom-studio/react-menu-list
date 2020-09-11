/* @flow */

import Kefir from 'kefir';
import kefirBus from 'kefir-bus';
import type {Bus} from 'kefir-bus';
import kefirStopper from 'kefir-stopper';
import React from 'react';
import type {Node as ReactNode} from 'react';
import PropTypes from 'prop-types';
import pointRectDistance from './lib/pointRectDistance';

import MenuListInspector from './MenuListInspector';
import FloatAnchor from 'react-float-anchor';
import type {Options as FloatAnchorOptions} from 'react-float-anchor';
export type {Options as FloatAnchorOptions} from 'react-float-anchor';
import MenuItem from './MenuItem';

import type {Direction, Rect} from './types';
import type MenuEvent from './events/MenuEvent';
import type ChosenEvent from './events/ChosenEvent';

type State = {
  opened: boolean,
};

export type Props = {
  menu: ReactNode,
  positionOptions: FloatAnchorOptions,
  menuZIndex?: string | number,
  menuParentElement?: HTMLElement,

  onWillOpen?: () => void,
  onDidOpen?: () => void,
  onWillClose?: () => void,

  className?: string,
  style?: Object,
  highlightedClassName?: string,
  highlightedStyle?: Object,
  index?: number,

  openedClassName?: string,
  openedStyle?: Object,

  onItemChosen?: (event: ChosenEvent) => void,
  onHighlightChange?: (
    highlighted: boolean,
    details: {
      byKeyboard?: boolean,
      prevCursorLocation?: Rect,
      direction?: Direction,
    }
  ) => void,

  children?: ReactNode,
};

export default class SubMenuItem extends React.Component<Props, State> {
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

    children: PropTypes.node,
  };

  static defaultProps = {
    positionOptions: {position: 'right', vAlign: 'top', hAlign: 'left'},
  };

  state: State = {
    opened: false,
  };

  _menuItemRef = React.createRef<MenuItem>();
  _floatAnchorRef = React.createRef<FloatAnchor>();
  _menuInspectorRef = React.createRef<MenuListInspector>();
  _menuContainerRef = React.createRef<HTMLDivElement>();
  _resetMouseLeaveWatcher: Bus<null> = kefirBus();
  _stopper = kefirStopper();

  componentWillUnmount() {
    this._stopper.destroy();
  }

  open(): Promise<void> {
    const menuItem = this._menuItemRef.current;
    if (!menuItem) throw new Error();

    menuItem.lockHighlight();
    if (this.state.opened) return Promise.resolve();
    if (this.props.onWillOpen) this.props.onWillOpen();
    menuItem.takeKeyboard();
    return new Promise(resolve => {
      this.setState({opened: true}, () => {
        if (this.props.onDidOpen) this.props.onDidOpen();
        resolve();
      });
    });
  }

  close() {
    const menuItem = this._menuItemRef.current;
    if (!menuItem) throw new Error();

    if (!this.state.opened) return;
    if (this.props.onWillClose) this.props.onWillClose();
    this.setState({opened: false});
    menuItem.releaseKeyboard();
    menuItem.unlockHighlight();
  }

  toggle() {
    if (this.state.opened) {
      this.close();
    } else {
      this.open();
    }
  }

  reposition() {
    const floatAnchor = this._floatAnchorRef.current;
    if (!floatAnchor) throw new Error();

    floatAnchor.reposition();
  }

  hasHighlight(): boolean {
    const menuItem = this._menuItemRef.current;
    if (!menuItem) throw new Error();

    return menuItem.hasHighlight();
  }

  highlight(byKeyboard: boolean = true) {
    const menuItem = this._menuItemRef.current;
    if (!menuItem) throw new Error();

    menuItem.highlight(byKeyboard);
  }

  unhighlight() {
    const menuItem = this._menuItemRef.current;
    if (!menuItem) throw new Error();

    menuItem.unhighlight();
  }

  moveCursor(direction: Direction, prevCursorLocation: ?Rect) {
    const menuItem = this._menuItemRef.current;
    if (!menuItem) throw new Error();

    menuItem.moveCursor(direction, prevCursorLocation);
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
    const menuItem = this._menuItemRef.current;
    if (!menuItem) throw new Error();

    if (!this.state.opened) {
      menuItem.unhighlight();
      return;
    }

    const menuContainer = this._menuContainerRef.current;
    if (!menuContainer) throw new Error();

    // If the mouse isn't going toward the menu, then unhighlight ourself.

    const menuRect = menuContainer.getBoundingClientRect();

    const startTime = Date.now();
    const startX = event.pageX,
      startY = event.pageY;

    function getDistance(x, y) {
      return pointRectDistance(
        x,
        y,
        menuRect.left,
        menuRect.top,
        menuRect.right - menuRect.width,
        menuRect.bottom - menuRect.top
      );
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
          const last = events[events.length - 1];
          lastCoords = {pageX: last.pageX, pageY: last.pageY};
        }
        return lastCoords;
      })
      .filter(({pageX, pageY}) => {
        const distance = getDistance(pageX, pageY);
        const maxDistance =
          startDistance -
          ((Date.now() - startTime - LEAD_TIME) / 1000) * MIN_SPEED;
        return distance > maxDistance;
      })
      .merge(Kefir.later(MAX_TIME * 1000))
      .take(1)
      .takeUntilBy(this._resetMouseLeaveWatcher)
      .takeUntilBy(this._stopper)
      .onValue(() => {
        this.close();
        menuItem.unhighlight();
      });
  }

  _mouseEnterMenu() {
    const menuItem = this._menuItemRef.current;
    if (!menuItem) throw new Error();

    this._resetMouseLeaveWatcher.emit(null);
    menuItem.unlockHighlight();
  }

  render() {
    const {
      index,
      highlightedStyle,
      highlightedClassName,
      positionOptions,
      menuZIndex,
      children,
      menu,
    } = this.props;
    const {opened} = this.state;

    let style = this.props.style;
    let className = this.props.className;
    if (opened) {
      if (this.props.openedStyle) {
        style = {...style, ...this.props.openedStyle};
      }
      if (this.props.openedClassName) {
        className = `${className || ''} ${this.props.openedClassName}`;
      }
    }

    return (
      <FloatAnchor
        parentElement={this.props.menuParentElement}
        ref={this._floatAnchorRef}
        options={positionOptions}
        zIndex={menuZIndex}
        anchor={anchorRef => (
          <MenuItem
            ref={this._menuItemRef}
            domRef={anchorRef}
            index={index}
            style={style}
            className={className}
            highlightedStyle={highlightedStyle}
            highlightedClassName={highlightedClassName}
            onHighlightChange={(h, e) => this._onHighlightChange(h, e)}
            onMouseLeave={e => this._onMouseLeaveItem(e)}
            onRightPushed={(e: MenuEvent) => {
              if (!this.state.opened) {
                e.stopPropagation();
                e.preventDefault();
                this.open();
                const menuInspector = this._menuInspectorRef.current;
                if (!menuInspector) throw new Error();
                menuInspector.moveCursor('down');
              }
            }}
            onItemChosen={(e: ChosenEvent) => {
              e.stopPropagation();
              e.preventDefault();
              this.open();
              if (e.byKeyboard) {
                const menuInspector = this._menuInspectorRef.current;
                if (!menuInspector) throw new Error();
                menuInspector.moveCursor('down');
              }
            }}
            aria-haspopup={true}
            aria-expanded={opened}
          >
            {children}
          </MenuItem>
        )}
        float={
          !opened ? null : (
            <MenuListInspector
              ref={this._menuInspectorRef}
              onLeftPushed={e => {
                e.stopPropagation();
                e.preventDefault();
                this.close();
              }}
            >
              <div
                ref={this._menuContainerRef}
                onMouseEnter={() => this._mouseEnterMenu()}
              >
                {menu}
              </div>
            </MenuListInspector>
          )
        }
      />
    );
  }
}
