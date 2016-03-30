/* @flow */

import React, {PropTypes} from 'react';
import type MenuEvent from './MenuEvent';

export type MenuListInspectorContext = {
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

  _parentCtx(): ?MenuListInspectorContext {
    return this.context.menuListInspector;
  }

  getChildContext(): Object {
    const menuListInspector: MenuListInspectorContext = {
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

  render(): ?React.Element {
    return this.props.children;
  }
}
