/* @flow */

import * as React from 'react';
import type {Node as ReactNode} from 'react';
import PropTypes from 'prop-types';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export default class Dropdown extends React.Component<Props> {
  static propTypes = {
    children: PropTypes.node,
  };

  render() {
    return (
      <div
        {...this.props}
        style={{
          background: 'white',
          border: '1px solid rgba(0,0,0,.2)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          padding: '6px 0',
        }}
      >
        {this.props.children}
      </div>
    );
  }
}
