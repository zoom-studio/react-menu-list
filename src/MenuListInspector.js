/* @flow */

import React from 'react';
import type {Node as ReactNode} from 'react';
import PropTypes from 'prop-types';
import type MenuList from './MenuList';
import type MenuEvent from './events/MenuEvent';
import ChosenEvent from './events/ChosenEvent';
import type {Direction, Rect} from './types';

export type MenuListInspectorContextValue = {
  registerMenuList(menuList: MenuList): void;
  unregisterMenuList(menuList: MenuList): void;
  dispatchEvent(event: MenuEvent): void;
};

export const MenuListInspectorContext = React.createContext<?MenuListInspectorContextValue>(null);

export type Props = {
  onItemChosen?: (event: ChosenEvent) => void;
  onLeftPushed?: (event: MenuEvent) => void;
  onRightPushed?: (event: MenuEvent) => void;
  children: ReactNode;
};

export default class MenuListInspector extends React.Component<Props> {
  static propTypes = {
    onItemChosen: PropTypes.func,
    onLeftPushed: PropTypes.func,
    onRightPushed: PropTypes.func,

    children: PropTypes.element
  };

  static contextType = MenuListInspectorContext;

  _descendantMenuLists: Array<MenuList> = [];

  _parentCtx(): ?MenuListInspectorContextValue {
    return this.context;
  }

  _menuListInspectorContext: MenuListInspectorContextValue = {
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
      if (event.cancelBubble) return;
      const parentCtx = this._parentCtx();
      if (parentCtx) {
        parentCtx.dispatchEvent(event);
      }
    }
  };

  moveCursor(direction: Direction, prevCursorLocation: ?Rect): boolean {
    const menuList = this._descendantMenuLists[0];
    if (!menuList) {
      return false;
    }
    menuList.moveCursor(direction, prevCursorLocation);
    return true;
  }

  hasHighlight(): boolean {
    for (let i=0, len=this._descendantMenuLists.length; i<len; i++) {
      if (this._descendantMenuLists[i].hasHighlight()) {
        return true;
      }
    }
    return false;
  }

  render() {
    return (
      <MenuListInspectorContext.Provider value={this._menuListInspectorContext}>
        {this.props.children}
      </MenuListInspectorContext.Provider>
    );
  }
}
