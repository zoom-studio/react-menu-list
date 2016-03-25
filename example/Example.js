/* @flow */
/* eslint-disable no-console */

import React, {PropTypes} from 'react';
import {MenuList, MenuListItem, MenuButton, Dropdown} from '../src';

function LI(props) {
  return (
    <MenuListItem
      highlightedStyle={{background: 'gray'}}
      onItemChosen={e => {
        if (props.children === 'Mercury') {
          e.preventDefault();
        }
        console.log(`selected ${props.children}`);
      }}
      >
      {props.children}
    </MenuListItem>
  );
}
LI.propTypes = {
  children: PropTypes.node
};

export default class Example extends React.Component {
  state: Object = {
  };
  render() {
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
            TODO:{' '}
            <MenuButton
              menu={
                <Dropdown>
                  <MenuList onItemChosen={e=>console.log('something chosen', e)}>
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
                    <MenuListItem
                      onItemChosen={e => e.preventDefault()}
                      >
                      <MenuButton
                        menu={
                          <Dropdown>
                            <MenuList>
                              <LI>Ceres</LI>
                              <LI>Pluto</LI>
                              <LI>Eris</LI>
                            </MenuList>
                          </Dropdown>
                        }>
                        More
                      </MenuButton>
                    </MenuListItem>
                  </MenuList>
                </Dropdown>
              }
              >
              Menu Button
            </MenuButton>
          </div>
          <div>
            <textarea defaultValue="fooobar" />
          </div>
        </div>
      </div>
    );
  }
}
