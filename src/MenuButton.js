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
    disabled: PropTypes.bool,
    title: PropTypes.string,
    openedClassName: PropTypes.string,
    openedStyle: PropTypes.object,

    positionOptions: PropTypes.object,
    zIndex: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

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

  // Safari and Firefox on OS X don't focus the button on mousedown, so on
  // mousedown we do a quick setTimeout and focus a dummy child element if the
  // button wasn't focused.
  _focusFixerTimeout: any = null;

  // Set to true after mousedown until the focus event happens. When it's true,
  // blur events on the dummy child element should not cause the menu to close.
  _focusing: boolean = false;

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

  componentWillUnmount() {
    clearTimeout(this._focusFixerTimeout);
  }

  render() {
    const {
      children, menu,
      positionOptions, zIndex,
      disabled, title
    } = this.props;
    const {opened} = this.state;

    let style = this.props.style;
    let className = this.props.className;
    if (opened) {
      if (this.props.openedStyle) {
        style = {...style, ...this.props.openedStyle};
      }
      if (this.props.openedClassName) {
        className = `${className||''} ${this.props.openedClassName}`;
      }
    }

    return (
      <FloatAnchor
        options={positionOptions}
        zIndex={zIndex}
        anchor={
          <button
            type="button"
            ref="button"
            className={className}
            style={style}
            onFocus={()=>{
              this._focusing = false;
              clearTimeout(this._focusFixerTimeout);
            }}
            onBlur={()=>{
              clearTimeout(this._focusFixerTimeout);
              this.close();
            }}
            onMouseDown={()=>{
              clearTimeout(this._focusFixerTimeout);
              if (!opened) {
                this._focusing = true;
                this._focusFixerTimeout = setTimeout(() => {
                  if (document.activeElement !== this.refs.button) {
                    this.refs.focusHolder.focus();
                  }
                }, 0);
              }
              this.toggle();
            }}
            onKeyPress={e=>{
              if (e.key === 'Enter' || e.key === ' ') {
                this.toggle();
              }
            }}
            onKeyDown={e=>{
              if (e.key === 'Escape' && opened) {
                this.close();
                e.preventDefault();
                e.stopPropagation();
              }
            }}
            aria-haspopup={true}
            aria-expanded={opened}
            disabled={disabled}
            title={title}
          >
            <div
              ref="focusHolder"
              tabIndex="-1"
              aria-hidden={true}
              style={{
                opacity: '0',
                outline: 'none',
                width: '0px',
                height: '0px',
                overflow: 'hidden'
              }}
              onBlur={e=>{
                if (this._focusing) {
                  e.stopPropagation();
                }
              }}
            />
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
