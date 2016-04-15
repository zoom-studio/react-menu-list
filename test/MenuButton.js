/* @flow */

import './lib/testdom';
import assert from 'assert';
import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';
import FloatAnchor from 'react-float-anchor';
import {MenuButton, Dropdown, MenuList, MenuItem} from '../src';

describe('MenuButton', function() {
  it('opens and closes on click', function() {
    this.slow();

    const mountPoint = document.createElement('div');
    const root: MenuButton = (ReactDOM.render(
      <MenuButton
        menu={
          <Dropdown>
            <MenuList>
              <MenuItem>A</MenuItem>
              <MenuItem>B</MenuItem>
            </MenuList>
          </Dropdown>
        }
      >
        foo button
      </MenuButton>,
      mountPoint
    ): any);

    root.reposition(); // just check this doesn't throw

    const button = TestUtils.findRenderedDOMComponentWithTag(root, 'button');
    const floatAnchor: FloatAnchor = TestUtils.findRenderedComponentWithType(root, FloatAnchor);

    assert.strictEqual(TestUtils.scryRenderedComponentsWithType(floatAnchor.portal, MenuItem).length, 0);

    TestUtils.Simulate.mouseDown(button);

    const menuListItems = TestUtils.scryRenderedComponentsWithType(floatAnchor.portal, MenuItem);

    assert.deepEqual(
      menuListItems.map(c=>c.props.children),
      ['A', 'B']
    );

    root.reposition(); // just check this doesn't throw

    TestUtils.Simulate.mouseDown(button);

    assert.strictEqual(TestUtils.scryRenderedComponentsWithType(floatAnchor.portal, MenuItem).length, 0);

    ReactDOM.unmountComponentAtNode(mountPoint);
  });

  it('closes on blur', function() {
    this.slow();

    const mountPoint = document.createElement('div');
    const root: MenuButton = (ReactDOM.render(
      <MenuButton
        menu={
          <Dropdown>
            <MenuList>
              <MenuItem>A</MenuItem>
              <MenuItem>B</MenuItem>
            </MenuList>
          </Dropdown>
        }
      >
        foo button
      </MenuButton>,
      mountPoint
    ): any);

    const button = TestUtils.findRenderedDOMComponentWithTag(root, 'button');
    const floatAnchor: FloatAnchor = TestUtils.findRenderedComponentWithType(root, FloatAnchor);

    assert.strictEqual(TestUtils.scryRenderedComponentsWithType(floatAnchor.portal, MenuItem).length, 0);

    TestUtils.Simulate.mouseDown(button);
    TestUtils.Simulate.focus(button);

    const menuListItems = TestUtils.scryRenderedComponentsWithType(floatAnchor.portal, MenuItem);

    assert.deepEqual(
      menuListItems.map(c=>c.props.children),
      ['A', 'B']
    );

    TestUtils.Simulate.blur(button);

    assert.strictEqual(TestUtils.scryRenderedComponentsWithType(floatAnchor.portal, MenuItem).length, 0);

    ReactDOM.unmountComponentAtNode(mountPoint);
  });
});
