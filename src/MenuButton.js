/* @flow */

import * as React from 'react';
import PropTypes from 'prop-types';
import FloatAnchor from 'react-float-anchor';
import type {Options as FloatAnchorOptions} from 'react-float-anchor';
import Kefir from 'kefir';
import kefirBus from 'kefir-bus';
import type {Bus} from 'kefir-bus';
import fromEventsCapture from './lib/fromEventsCapture';
import setRef from './lib/setRef';
import MenuListInspector from './MenuListInspector';

type State = {
  opened: boolean,
};

type RenderProp = (
  domRef: React.Ref<any>,
  opened: boolean,
  onKeyPress: (e: KeyboardEvent) => void,
  onMouseDown: (e: MouseEvent) => void
) => React.Node;
export type Props = {
  positionOptions: FloatAnchorOptions,
  menuZIndex?: string | number,
  menuParentElement?: HTMLElement,

  renderButton?: RenderProp,

  children?: React.Node,
  className?: string,
  style?: Object,
  openedClassName?: string,
  openedStyle?: Object,
  disabled?: boolean,
  title?: string,

  menu: React.Node,
  onWillOpen?: () => void,
  onDidOpen?: () => void,
  onWillClose?: () => void,
};

export default class MenuButton extends React.Component<Props, State> {
  static propTypes = {
    positionOptions: PropTypes.object,
    menuZIndex: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

    renderButton: PropTypes.func,

    className: PropTypes.string,
    openedClassName: PropTypes.string,
    children: PropTypes.node,
    style: PropTypes.object,
    openedStyle: PropTypes.object,
    disabled: PropTypes.bool,
    title: PropTypes.string,

    menu: PropTypes.element,
    onWillOpen: PropTypes.func,
    onDidOpen: PropTypes.func,
    onWillClose: PropTypes.func,
  };

  static defaultProps = {
    positionOptions: {position: 'bottom', hAlign: 'left'},
  };

  state: State = {
    opened: false,
  };

  _floatAnchorRef = React.createRef<FloatAnchor>();
  _anchorRef = React.createRef<HTMLElement>();
  _onClose: Bus<void> = kefirBus();

  open(): Promise<void> {
    if (this.state.opened) return Promise.resolve();
    if (this.props.onWillOpen) this.props.onWillOpen();

    // Clicking outside of the dropdown or pressing escape should close the
    // dropdown.
    Kefir.merge([
      Kefir.merge([
        fromEventsCapture(window, 'mousedown'),
        fromEventsCapture(window, 'focus'),
      ]).filter(e => {
        const el = this._anchorRef;
        for (let node of FloatAnchor.parentNodes(e.target)) {
          if (node === el) return false;
        }
        return true;
      }),
      Kefir.fromEvents(window, 'keydown')
        .filter(e => (e.key ? e.key === 'Escape' : e.which === 27))
        .map(e => {
          e.preventDefault();
          e.stopPropagation();
        }),
    ])
      .takeUntilBy(this._onClose)
      .onValue(() => {
        this.close();
      });

    return new Promise(resolve => {
      this.setState({opened: true}, () => {
        if (this.props.onDidOpen) this.props.onDidOpen();
        resolve();
      });
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
    const floatAnchor = this._floatAnchorRef.current;
    if (!floatAnchor) throw new Error();
    floatAnchor.reposition();
  }

  _onMouseDown(e: MouseEvent) {
    if (e.button !== 0) {
      return;
    }

    this.toggle();
  }

  _onKeyPress(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      this.toggle();
    }
  }

  _setRef(el: HTMLElement | null, anchorRef: React.Ref<any>) {
    this._anchorRef = el;
    setRef(anchorRef, el);
  }

  _itemChosen() {
    this.close();
  }

  _defaultRenderButton = (
    domRef: React.Ref<any>,
    opened: boolean,
    onKeyPress: (e: KeyboardEvent) => void,
    onMouseDown: (e: MouseEvent) => void
  ) => {
    const {openedStyle, openedClassName} = this.props;
    let {style, className} = this.props;
    if (opened) {
      if (openedStyle) {
        style = {...style, ...openedStyle};
      }
      if (openedClassName) {
        className = `${className || ''} ${openedClassName}`;
      }
    }

    return (
      <button
        className={className}
        style={style}
        ref={domRef}
        aria-haspopup={true}
        aria-expanded={opened}
        onKeyPress={onKeyPress}
        onMouseDown={onMouseDown}
        disabled={this.props.disabled}
        title={this.props.title}
      >
        {this.props.children}
      </button>
    );
  };

  componentWillUnmount() {
    this._onClose.emit();
  }

  render() {
    const {menu, positionOptions, menuZIndex} = this.props;
    const {opened} = this.state;

    const renderButton = this.props.renderButton || this._defaultRenderButton;

    return (
      <FloatAnchor
        parentElement={this.props.menuParentElement}
        ref={this._floatAnchorRef}
        options={positionOptions}
        zIndex={menuZIndex}
        anchor={anchorRef =>
          renderButton(
            el => this._setRef(el, anchorRef),
            opened,
            e => this._onKeyPress(e),
            e => this._onMouseDown(e)
          )
        }
        float={
          !opened ? null : (
            <MenuListInspector onItemChosen={() => this._itemChosen()}>
              {menu}
            </MenuListInspector>
          )
        }
      />
    );
  }
}
