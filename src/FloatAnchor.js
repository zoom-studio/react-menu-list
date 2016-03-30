/* @flow */

import fromEventsCapture from './lib/fromEventsCapture';
import Kefir from 'kefir';
import kefirBus from 'kefir-bus';
import React, {PropTypes} from 'react';
import ReactDOM, {findDOMNode} from 'react-dom';
import containByScreen from 'contain-by-screen';
import type {Options} from 'contain-by-screen';
import isEqual from 'lodash/isEqual';

type Props = {
  options?: ?Options;
  anchor: React.Element;
  float?: ?React.Element;
};
export default class FloatAnchor extends React.Component {
  props: Props;
  static propTypes = {
    options: PropTypes.object,
    anchor: PropTypes.element.isRequired,
    float: PropTypes.element
  };

  _portal: ?HTMLElement;
  _isRenderingFloat: boolean = false;
  _shouldRepositionOnFloatRender: boolean = false;
  _portalRemoval: Object = kefirBus();
  _stopper: Object = kefirBus();

  componentDidMount() {
    this._updateFloat(this.props);
  }

  componentWillReceiveProps(newProps: Props) {
    let forceReposition = !isEqual(newProps.options, this.props.options);
    if (forceReposition || newProps.float !== this.props.float) {
      this._updateFloat(newProps, forceReposition);
    }
  }

  componentWillUnmount() {
    this._stopper.emit(null);
  }

  _updateFloat(props: Props, forceReposition: boolean=false) {
    const {float} = props;

    if (float) {
      let shouldReposition = forceReposition;
      if (!this._portal) {
        shouldReposition = true;
        const portal = this._portal = document.createElement('div');
        portal.style.position = 'fixed';
        document.body.appendChild(portal);
        // delay(0) because React has issues with unmounting happening during
        // event processing: https://github.com/facebook/react/issues/3298
        Kefir.merge([
          this._portalRemoval.delay(0),
          this._stopper
        ]).take(1).onValue(() => {
          ReactDOM.unmountComponentAtNode(portal);
          portal.remove();
          this._portal = null;
        });
        const el = findDOMNode(this);
        fromEventsCapture(window, 'scroll')
          .filter(event => event.target.contains(el))
          .takeUntilBy(this._portalRemoval)
          .takeUntilBy(this._stopper)
          .onValue(() => {
            this.reposition();
          });
      }

      this._isRenderingFloat = true;
      (ReactDOM:any).unstable_renderSubtreeIntoContainer(
        this,
        float,
        this._portal,
        () => {
          this._isRenderingFloat = false;
          if (this._shouldRepositionOnFloatRender || shouldReposition) {
            this._shouldRepositionOnFloatRender = false;
            this.reposition();
          }
        }
      );
    } else {
      if (this._portal) {
        this._portalRemoval.emit(null);
      }
    }
  }

  reposition() {
    if (this._isRenderingFloat) {
      this._shouldRepositionOnFloatRender = true;
      return;
    }
    const portal = this._portal;
    if (portal) {
      containByScreen(portal, findDOMNode(this), this.props.options || {});
    }
  }

  render(): ?React.Element {
    const {anchor} = this.props;
    return anchor;
  }
}
