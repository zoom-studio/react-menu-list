/* @flow */
/* eslint-disable no-console, react/prop-types */

import React from 'react';
import {MenuList, MenuItem, MenuButton, Dropdown, SubMenuItem} from '../src';
import AutoComplete from './AutoComplete';

// MenuItems don't come with any styling by default! You'll probably want to
// make your own component which wraps them and adds your own application's
// style to them like this.
function LI(props) {
  return (
    <MenuItem
      highlightedStyle={{background: 'gray'}}
      onItemChosen={e => {
        console.log(`selected ${props.children}, byKeyboard: ${e.byKeyboard}`);
      }}
      {...props}
    />
  );
}

export default class Example extends React.Component {
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
            MenuButton example<br/>
            <MenuButton
              menu={
                <Dropdown>
                  <MenuList>
                    <LI>Mercury</LI>
                    <div style={{
                      height: '50px', overflowY: 'scroll', border: '1px solid gray'
                    }}>
                      <LI>Venus</LI>
                      <LI>Earth</LI>
                      <LI>Mars</LI>
                      <LI>Jupiter</LI>
                      <LI>Saturn</LI>
                      <LI>Uranus</LI>
                    </div>
                    <LI>Neptune</LI>
                    <hr/>
                    <SubMenuItem
                      highlightedStyle={{background: 'gray'}}
                      menu={
                        <Dropdown>
                          <MenuList>
                            <LI>Ceres</LI>
                            <LI>Pluto</LI>
                            <LI>Eris</LI>
                          </MenuList>
                        </Dropdown>
                      }>
                      Dwarf Planets ►
                    </SubMenuItem>
                  </MenuList>
                </Dropdown>
              }
              >
              Menu Button
            </MenuButton>
          </div>
          <div>
            AutoComplete example<br/>
            <AutoComplete
              defaultValue="M"
              items={[
                'Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn',
                'Uranus', 'Neptune',
                {title: 'Dwarf Planets', items: ['Ceres', 'Pluto', 'Eris']}
              ]}
            />
          </div>
        </div>
      </div>
    );
  }
}
