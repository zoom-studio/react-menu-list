/* @flow */

import React, {PropTypes} from 'react';
import type MenuList from './MenuList';
import type MenuEvent from './events/MenuEvent';
import type {Direction, Rect} from './types';

export type MenuListInspectorContext = {
  registerMenuList(menuList: MenuList): void;
  unregisterMenuList(menuList: MenuList): void;
  dispatchEvent(event: MenuEvent): void;
};

export default class MenuListInspector extends React.Component {
  static propTypes = {
    onItemChosen: PropTypes.func,
    onLeftPushed: PropTypes.func,
    onRightPushed: PropTypes.func,
    onUpPushed: PropTypes.func,
    onDownPushed: PropTypes.func,

    children: PropTypes.element
  };

  static childContextTypes = {
    menuListInspector: React.PropTypes.object
  };

  static contextTypes = {
    menuListInspector: React.PropTypes.object
  };

  _descendantMenuLists: Array<MenuList> = [];

  _parentCtx(): ?MenuListInspectorContext {
    return this.context.menuListInspector;
  }

  getChildContext(): Object {
    const menuListInspector: MenuListInspectorContext = {
      registerMenuList: (menuList: MenuList) => {
        this._descendantMenuLists.push(menuList);
      },
      unregisterMenuList: (menuList: MenuList) => {
        const i = this._descendantMenuLists.indexOf(menuList);
        if (i < 0) throw new Error('MenuList not registered');
        this._descendantMenuLists.splice(i, 1);
      },
      dispatchEvent: (event: MenuEvent) => {
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
        if (event.cancelBubble) return;
        const parentCtx = this._parentCtx();
        if (parentCtx) {
          parentCtx.dispatchEvent(event);
        }
      }
    };
    return {menuListInspector};
  }

  moveCursor(direction: Direction, prevCursorLocation: ?Rect) {
    const menuList = this._descendantMenuLists[0];
    if (!menuList) {
      throw new Error('No descendant menu lists!');
    }
    menuList.moveCursor(direction, prevCursorLocation);
  }

  render(): ?React.Element {
    return this.props.children;
  }
}
