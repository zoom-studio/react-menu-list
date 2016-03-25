/* @flow */

import React, {PropTypes} from 'react';

export default class Dropdown extends React.Component {
  static propTypes = {
    children: PropTypes.node
  };

  render() {
    return (
      <div style={{
        background: 'white',
        border: '1px solid rgba(0,0,0,.2)',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        padding: '6px 0'
      }}>
        {this.props.children}
      </div>
    );
  }
}
