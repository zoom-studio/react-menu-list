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
      style={{cursor: 'pointer', userSelect: 'none'}}
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
            The MenuButton dropdown can have arbitrary elements inside of it.
            Here, the dropdown contains some menu items nested inside of a
            scrollable section.
          </p>
          <div>
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
                    <hr style={{margin: '1px 0'}} />
                    <SubMenuItem
                      style={{cursor: 'pointer', userSelect: 'none'}}
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
          <p>
            The autocomplete example here shows a dropdown while it's focused,
            and it filters the dropdown options based on what's typed. The
            dropdown is usable by mouse or arrow keys. The autocomplete
            dropdown has a submenu to show that they still work here.
          </p>
          <p>
            The autocomplete widget here isn't something provided as a generic
            component by the react-menu-list library; it's an example of how to
            use react-menu-list.
          </p>
          <div>
            <AutoComplete
              defaultValue="M"
              items={[
                'Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn',
                'Uranus', 'Neptune',
                {title: 'Dwarf Planets', items: ['Ceres', 'Pluto', 'Eris']}
              ]}
            />
          </div>
          <p>
            Different applications have different needs, which are often easy
            to accomplish with react-menu-list.
            Here's a variation of the autocomplete widget which keeps the first
            item highlighted whenever the text changes, so that the user can
            immediately pick the first item by hitting enter.
          </p>
          <div>
            <AutoComplete
              autoHighlight={true}
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
