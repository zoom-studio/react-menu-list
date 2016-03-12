/* @flow */

import React from 'react';
import cx from 'classnames';
import {MenuList, MenuListItem} from '../src';

function LI(props) {
  return (
    <MenuListItem
      highlightedStyle={{background: 'gray'}}
      onClick={() => alert(`selected ${props.children}`)}
      >
      {props.children}
    </MenuListItem>
  );
}

export default class Example extends React.Component {
  state: Object = {
    opened: false
  };
  render() {
    const {opened} = this.state;

    return (
      <div className="main">
        <div className="intro">
          <p>
            This is a demonstration of the <a href="https://github.com/StreakYC/react-menu-list">react-menu-list</a> library.
          </p>
          <p>
            Each item has a drag handle visible when the user hovers over them.
            The items may have any height, and can each define their own height
            to use while being dragged.
          </p>
          <p>
            When the list is reordered, the page will
            be scrolled if possible to keep the moved item visible and on the
            same part of the screen.
          </p>
          <div>
            <input
              type="button"
              value={opened ? 'Close' : 'Open'}
              onClick={()=>this.setState({opened: !opened})}
              />
          </div>
          <MenuList>
            <LI>Mercury</LI>
            <LI>Venus</LI>
            <div style={{
                height: '40px', overflowY: 'scroll', border: '1px solid gray'
              }}>
              <LI>Earth</LI>
              <LI>Mars</LI>
              <LI>Jupiter</LI>
              <LI>Saturn</LI>
              <LI>Uranus</LI>
            </div>
            <LI>Neptune</LI>
          </MenuList>
        </div>
      </div>
    );
  }
}
