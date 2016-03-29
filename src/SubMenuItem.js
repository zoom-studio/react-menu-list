/* @flow */

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

    onItemChosen: PropTypes.func,
    onHighlightChange: PropTypes.func,

    onWillOpen: PropTypes.func,
    onDidOpen: PropTypes.func,
    onWillClose: PropTypes.func,

    children: PropTypes.node,
    menu: PropTypes.node
  };

  state: State = {
    opened: false
  };

  _lockTimeout: any;

  componentWillUnmount() {
    clearTimeout(this._lockTimeout);
  }

  open() {
    if (this.state.opened) return;
    if (this.props.onWillOpen) this.props.onWillOpen();
    this.setState({opened: true}, this.props.onDidOpen);
    this.refs.menuListItem.takeKeyboard();
    this.refs.menuListItem.lockHighlight();
    this._lockTimeout = setTimeout(() => {
      this.refs.menuListItem.releaseKeyboard();
      this.refs.menuListItem.unlockHighlight();
    }, 5000);
  }

  close() {
    if (!this.state.opened) return;
    if (this.props.onWillClose) this.props.onWillClose();
    this.setState({opened: false});
    clearTimeout(this._lockTimeout);
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

  _mouseEnterMenu() {

  }

  _mouseLeaveMenu() {

  }

  render() {
    const {
      index, style, className,
      highlightedStyle, highlightedClassName, children, menu
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
        onItemChosen={e => {
          e.preventDefault();
          this.open();
          // TODO highlight first item of submenu if by keyboard
        }}
      >
        <FloatAnchor
          options={{position:'right', vAlign:'top', hAlign: 'left'}}
          anchor={
            <div>
              {children}
            </div>
          }
          float={
            !opened ? null :
              <div
                onMouseEnter={()=>this._mouseEnterMenu()}
                onMouseLeave={()=>this._mouseLeaveMenu()}
                >
                {menu}
              </div>
          }
          />
      </MenuListItem>
    );
  }
}
