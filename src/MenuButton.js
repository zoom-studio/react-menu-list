/* @flow */

import React, {PropTypes} from 'react';
import FloatAnchor from './FloatAnchor';
import MenuListInspector from './MenuListInspector';

type State = {
  opened: boolean;
}

export default class MenuButton extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    style: PropTypes.object,

    children: PropTypes.node,
    menu: PropTypes.node,
    onWillOpen: PropTypes.func,
    onDidOpen: PropTypes.func,
    onWillClose: PropTypes.func
  };

  state: State = {
    opened: false
  };

  _open() {
    if (this.state.opened) return;
    if (this.props.onWillOpen) this.props.onWillOpen();
    this.setState({opened: true}, this.props.onDidOpen);
  }

  _close() {
    if (!this.state.opened) return;
    if (this.props.onWillClose) this.props.onWillClose();
    this.setState({opened: false});
  }

  _toggle() {
    if (this.state.opened) {
      this._close();
    } else {
      this._open();
    }
  }

  _itemChosen(event: Object) {
    if (!event.defaultPrevented) {
      this._close();
    }
  }

  render() {
    const {className, style, children, menu} = this.props;
    const {opened} = this.state;
    return (
      <FloatAnchor
        options={{position:'bottom', hAlign:'left'}}
        anchor={
          <button
            className={className}
            style={style}
            onBlur={()=>this._close()}
            onClick={()=>this._toggle()}
            >
            {children}
          </button>
        }
        float={
          !opened ? null :
            <MenuListInspector onItemChosen={e => this._itemChosen(e)}>
              <div onMouseDown={e=>e.preventDefault()}>
                {menu}
              </div>
            </MenuListInspector>
        }
      />
    );
  }
}
