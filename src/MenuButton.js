/* @flow */

import React, {PropTypes} from 'react';
import {findDOMNode} from 'react-dom';
import FloatAnchor from 'react-float-anchor';
import kefirBus from 'kefir-bus';
import Kefir from 'kefir';
import fromEventsCapture from './lib/fromEventsCapture';
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
    menuZIndex: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

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

  _onClose: Object = kefirBus();

  open() {
    if (this.state.opened) return;
    if (this.props.onWillOpen) this.props.onWillOpen();
    this.setState({opened: true}, this.props.onDidOpen);

    // Clicking outside of the dropdown or pressing escape should close the
    // dropdown.
    Kefir.merge([
      Kefir.merge([
        fromEventsCapture(window, 'click'),
        fromEventsCapture(window, 'focus')
      ])
        .filter(e => {
          const el = findDOMNode(this);
          for (let node of FloatAnchor.parentNodes(e.target)) {
            if (node === el) return false;
          }
          return true;
        }),
      Kefir.fromEvents(window, 'keydown')
        .filter(e => e.key ? e.key === 'Escape' : e.which === 27)
        .map(e => {
          e.preventDefault();
          e.stopPropagation();
        })
    ])
      .takeUntilBy(this._onClose)
      .onValue(() => {
        this.close();
      });
  }

  close() {
    if (!this.state.opened) return;
    if (this.props.onWillClose) this.props.onWillClose();
    this.setState({opened: false});
    this._onClose.emit();
  }

  toggle() {
    if (this.state.opened) {
      this.close();
    } else {
      this.open();
    }
  }

  reposition() {
    this.refs.floatAnchor.reposition();
  }

  _itemChosen() {
    this.close();
  }

  componentWillUnmount() {
    this._onClose.emit();
  }

  render() {
    const {
      children, menu,
      positionOptions, menuZIndex,
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
        ref="floatAnchor"
        options={positionOptions}
        zIndex={menuZIndex}
        anchor={
          <button
            type="button"
            ref="button"
            className={className}
            style={style}
            onMouseDown={e => {
              if (e.button !== 0) return;
              this.toggle();
            }}
            onKeyPress={e=>{
              if (e.key === 'Enter' || e.key === ' ') {
                this.toggle();
              }
            }}
            aria-haspopup={true}
            aria-expanded={opened}
            disabled={disabled}
            title={title}
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
