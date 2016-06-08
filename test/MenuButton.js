/* @flow */

import './lib/testdom';
import assert from 'assert';
import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';
import FloatAnchor from 'react-float-anchor';
import sinon from 'sinon';
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

    TestUtils.Simulate.mouseDown(button, {button: 0});

    const menuListItems = TestUtils.scryRenderedComponentsWithType(floatAnchor.portal, MenuItem);

    assert.deepEqual(
      menuListItems.map(c=>c.props.children),
      ['A', 'B']
    );

    root.reposition(); // just check this doesn't throw

    TestUtils.Simulate.mouseDown(button, {button: 0});

    assert.strictEqual(TestUtils.scryRenderedComponentsWithType(floatAnchor.portal, MenuItem).length, 0);

    ReactDOM.unmountComponentAtNode(mountPoint);
  });

  it('closes on outside click', sinon.test(function() {
    this.slow();
    this.spy(window, 'addEventListener');
    this.spy(window, 'removeEventListener');

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
    assert.strictEqual(window.addEventListener.args.filter(c => c[0] === 'click').length, 0);

    TestUtils.Simulate.mouseDown(button, {button: 0});
    TestUtils.Simulate.focus(button);

    assert.strictEqual(window.addEventListener.args.filter(c => c[0] === 'click').length, 1);
    assert.strictEqual(window.addEventListener.args.filter(c => c[0] === 'click')[0][2], true);

    assert.strictEqual(window.removeEventListener.args.filter(c => c[0] === 'click').length, 0);

    const menuListItems = TestUtils.scryRenderedComponentsWithType(floatAnchor.portal, MenuItem);

    assert.deepEqual(
      menuListItems.map(c=>c.props.children),
      ['A', 'B']
    );

    // Simulate a click on the page
    window.addEventListener.args.filter(c => c[0] === 'click')[0][1].call(window, {
      target: 'window'
    });

    assert.strictEqual(TestUtils.scryRenderedComponentsWithType(floatAnchor.portal, MenuItem).length, 0);

    assert.strictEqual(window.addEventListener.args.filter(c => c[0] === 'click').length, 1);
    assert.strictEqual(window.removeEventListener.args.filter(c => c[0] === 'click').length, 1);

    ReactDOM.unmountComponentAtNode(mountPoint);
  }));
});
