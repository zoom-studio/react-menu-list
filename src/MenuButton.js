/* @flow */

import React, {PropTypes} from 'react';
import FloatAnchor from 'react-float-anchor';
import MenuListInspector from './MenuListInspector';

type State = {
  opened: boolean;
};

export default class MenuButton extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    style: PropTypes.object,
    positionOptions: PropTypes.object,

    children: PropTypes.node,
    menu: PropTypes.element,
    onWillOpen: PropTypes.func,
    onDidOpen: PropTypes.func,
    onWillClose: PropTypes.func
  };

  static defaultProps = {
    positionOptions: {position:'bottom', hAlign:'left'}
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

  _itemChosen() {
    this.close();
  }

  render() {
    const {className, style, children, menu, positionOptions} = this.props;
    const {opened} = this.state;
    return (
      <FloatAnchor
        options={positionOptions}
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
            aria-haspopup={true}
            aria-expanded={opened}
          >
            {children}
          </button>
        }
        float={
          !opened ? null :
            <MenuListInspector onItemChosen={() => this._itemChosen()}>
              {menu}
            </MenuListInspector>
        }
      />
    );
  }
}
