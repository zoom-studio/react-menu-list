/* @flow */

import fromEventsCapture from './lib/fromEventsCapture';
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
  _portalRemoval: Object = kefirBus();

  componentDidMount() {
    this._updateFloat();
  }

  componentDidUpdate(prevProps: Props) {
    let forceReposition = !isEqual(prevProps.options, this.props.options);
    if (forceReposition || prevProps.float !== this.props.float) {
      this._updateFloat(forceReposition);
    }
  }

  componentWillUnmount() {
    this._portalRemoval.emit(null);
  }

  _updateFloat(forceReposition: boolean=false) {
    const {float} = this.props;

    if (float) {
      let shouldReposition = forceReposition;
      if (!this._portal) {
        shouldReposition = true;
        const portal = this._portal = document.createElement('div');
        portal.style.position = 'fixed';
        document.body.appendChild(portal);
        // delay(0) because React has issues with unmounting happening during
        // event processing: https://github.com/facebook/react/issues/3298
        this._portalRemoval.take(1).delay(0).onValue(() => {
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
    const {anchor} = this.props;
    return anchor;
  }
}
