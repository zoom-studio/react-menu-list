/* @flow */

import React, {PropTypes} from 'react';
import FloatAnchor from './FloatAnchor';
import MenuListInspector from './MenuListInspector';

type State = {
  opened: boolean;
};

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

  open() {
    if (this.state.opened) return;
    if (this.props.onWillOpen) this.props.onWillOpen();
    this.setState({opened: true}, this.props.onDidOpen);
  }

  close() {
    if (!this.state.opened) return;
    if (this.props.onWillClose) this.props.onWillClose();
    this.setState({opened: false});
  }

  toggle() {
    if (this.state.opened) {
      this.close();
    } else {
      this.open();
    }
  }

  _itemChosen(event: Object) {
    if (!event.defaultPrevented) {
      this.close();
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
            onBlur={()=>this.close()}
            onClick={()=>this.toggle()}
            onKeyDown={e=>{
              if (e.key === 'Escape' && opened) {
                this.close();
                e.preventDefault();
                e.stopPropagation();
              }
            }}
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
