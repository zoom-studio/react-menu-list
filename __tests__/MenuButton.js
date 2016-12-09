/* @flow */

import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';
import FloatAnchor from 'react-float-anchor';
import {MenuButton, Dropdown, MenuList, MenuItem} from '../src';

afterEach(() => {
  delete window.addEventListener;
  delete window.removeEventListener;
});

test('opens and closes on click', () => {
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

  expect(TestUtils.scryRenderedComponentsWithType(floatAnchor.portal, MenuItem).length).toBe(0);

  TestUtils.Simulate.mouseDown(button, {button: 0});

  const menuListItems = TestUtils.scryRenderedComponentsWithType(floatAnchor.portal, MenuItem);

  expect(menuListItems.map(c=>c.props.children)).toEqual(
    ['A', 'B']
  );

  root.reposition(); // just check this doesn't throw

  TestUtils.Simulate.mouseDown(button, {button: 0});

  expect(TestUtils.scryRenderedComponentsWithType(floatAnchor.portal, MenuItem).length).toBe(0);

  ReactDOM.unmountComponentAtNode(mountPoint);
});

test('closes on outside click', () => {
  window.addEventListener = jest.fn(window.addEventListener);
  window.removeEventListener = jest.fn(window.removeEventListener);

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

  expect(TestUtils.scryRenderedComponentsWithType(floatAnchor.portal, MenuItem).length).toBe(0);
  expect(window.addEventListener.mock.calls.filter(c => c[0] === 'click').length).toBe(0);

  TestUtils.Simulate.mouseDown(button, {button: 0});
  TestUtils.Simulate.focus(button);

  expect(window.addEventListener.mock.calls.filter(c => c[0] === 'click').length).toBe(1);
  expect(window.addEventListener.mock.calls.filter(c => c[0] === 'click')[0][2]).toBe(true);

  expect(window.removeEventListener.mock.calls.filter(c => c[0] === 'click').length).toBe(0);

  const menuListItems = TestUtils.scryRenderedComponentsWithType(floatAnchor.portal, MenuItem);

  expect(menuListItems.map(c=>c.props.children)).toEqual(
    ['A', 'B']
  );

  // Simulate a click on the page
  window.addEventListener.mock.calls.filter(c => c[0] === 'click')[0][1].call(window, {
    target: 'window'
  });

  expect(TestUtils.scryRenderedComponentsWithType(floatAnchor.portal, MenuItem).length).toBe(0);

  expect(window.addEventListener.mock.calls.filter(c => c[0] === 'click').length).toBe(1);
  expect(window.removeEventListener.mock.calls.filter(c => c[0] === 'click').length).toBe(1);

  ReactDOM.unmountComponentAtNode(mountPoint);
});
