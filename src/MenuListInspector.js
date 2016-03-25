/* @flow */

import React, {PropTypes} from 'react';

export type MenuListInspectorContext = {
  dispatchEvent(type: string, event: Object): void;
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
      dispatchEvent: (type: string, event: Object) => {
        switch (type) {
        case 'itemChosen':
          if (this.props.onItemChosen) {
            this.props.onItemChosen(event);
          }
          break;
        // TODO
        // case 'onRightPushed':
        //   break;
        // case 'onLeftPushed':
        //   break;
        // case 'onUpPushed':
        //   break;
        // case 'onDownPushed':
        //   break;
        }
        const parentCtx = this._parentCtx();
        if (parentCtx) {
          parentCtx.dispatchEvent(type, event);
        }
      }
    };
    return {menuListInspector};
  }

  render(): ?React.Element {
    return this.props.children;
  }
}
