/* @flow */

import fromEventsCapture from './lib/fromEventsCapture';
import kefirBus from 'kefir-bus';
import React, {PropTypes} from 'react';
import ReactDOM, {findDOMNode} from 'react-dom';
import containByScreen from 'contain-by-screen';
import type {Options} from 'contain-by-screen';
import isEqual from 'lodash/isEqual';

class Float extends React.Component {
  static propTypes = {
    children: PropTypes.element.isRequired
  };

  render(): React.Element {
    return this.props.children;
  }
}

class Anchor extends React.Component {
  static propTypes = {
    children: PropTypes.element.isRequired
  };

  render(): React.Element {
    return this.props.children;
  }
}

type Props = {
  options?: ?Options;
  children?: any;
};
export default class FloatAnchor extends React.Component {
  props: Props;
  static propTypes = {
    options: PropTypes.object,
    children: function(props, propName) {
      let failed = false;
      React.Children.forEach(props[propName], child => {
        if (child && child.type !== Anchor && child.type !== Float) {
          failed = true;
        }
      });
      if (failed) {
        return new Error('Children of FloatAnchor must be Float or Anchor elements.');
      }
    }
  };

  static Anchor = Anchor;
  static Float = Float;

  _portal: ?HTMLElement;
  _portalRemoval: Object = kefirBus();

  _getAnchorChildren(): {anchor: ?React.Element, float: ?React.Element} {
    let anchor = null;
    let float = null;

    React.Children.forEach(this.props.children, child => {
      if (!child) return;
      if (child.type === Anchor) {
        anchor = child;
      } else if (child.type === Float) {
        float = child;
      }
    });

    return {anchor, float};
  }

  componentDidMount() {
    this._updateFloat();
  }

  componentDidUpdate(prevProps: typeof FloatAnchor.prototype.props) {
    let forceReposition = !isEqual(prevProps.options, this.props.options);
    if (forceReposition || prevProps.children !== this.props.children) {
      this._updateFloat(forceReposition);
    }
  }

  componentWillUnmount() {
    this._portalRemoval.emit(null);
  }

  _updateFloat(forceReposition: boolean=false) {
    const {float} = this._getAnchorChildren();

    if (float) {
      let shouldReposition = forceReposition;
      if (!this._portal) {
        shouldReposition = true;
        const portal = this._portal = document.createElement('div');
        portal.style.position = 'fixed';
        document.body.appendChild(portal);
        this._portalRemoval.take(1).onValue(() => {
          ReactDOM.unmountComponentAtNode(portal);
          portal.remove();
          this._portal = null;
        });
        const el = findDOMNode(this);
        fromEventsCapture(window, 'scroll')
          .filter(event => event.target.contains(el))
          .takeUntilBy(this._portalRemoval)
          .onValue(() => {
            this.reposition();
          });
      }
      (ReactDOM:any).unstable_renderSubtreeIntoContainer(
        this,
        float,
        this._portal,
        shouldReposition ?
          () => {
            this.reposition();
          } : null
      );
    } else {
      if (this._portal) {
        this._portalRemoval.emit(null);
      }
    }
  }

  reposition() {
    const portal = this._portal;
    if (portal) {
      containByScreen(portal, findDOMNode(this), this.props.options || {});
    }
  }

  render(): ?React.Element {
    const {anchor} = this._getAnchorChildren();
    return anchor;
  }
}
