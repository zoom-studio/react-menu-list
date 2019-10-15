/* @flow */

import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import TestUtils from 'react-dom/test-utils';
import {MenuButton, Dropdown, MenuList, MenuItem} from '.';

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
  if (!button) throw new Error();
  expect(TestUtils.scryRenderedComponentsWithType(root, Dropdown).length).toBe(0);

  TestUtils.Simulate.mouseDown(button, {button: 0});

  const dropdown: Dropdown = (TestUtils.findRenderedComponentWithType(root, Dropdown): any);
  const menuListItems = TestUtils.scryRenderedComponentsWithType(dropdown, MenuItem);

  expect(menuListItems.map(c=>c.props.children)).toEqual(
    ['A', 'B']
  );

  root.reposition(); // just check this doesn't throw

  TestUtils.Simulate.mouseDown(button, {button: 0});

  expect(TestUtils.scryRenderedComponentsWithType(root, Dropdown).length).toBe(0);

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
  if (!button) throw new Error();

  expect(TestUtils.scryRenderedComponentsWithType(root, Dropdown).length).toBe(0);
  expect(window.addEventListener.mock.calls.filter(c => c[0] === 'mousedown').length).toBe(0);

  TestUtils.Simulate.mouseDown(button, {button: 0});
  TestUtils.Simulate.focus(button);

  expect(window.addEventListener.mock.calls.filter(c => c[0] === 'mousedown').length).toBe(1);
  expect(window.addEventListener.mock.calls.filter(c => c[0] === 'mousedown')[0][2]).toBe(true);

  expect(window.removeEventListener.mock.calls.filter(c => c[0] === 'mousedown').length).toBe(0);

  const dropdown: Dropdown = (TestUtils.findRenderedComponentWithType(root, Dropdown): any);
  const menuListItems = TestUtils.scryRenderedComponentsWithType(dropdown, MenuItem);

  expect(menuListItems.map(c=>c.props.children)).toEqual(
    ['A', 'B']
  );

  // Simulate a click on the page
  window.addEventListener.mock.calls.filter(c => c[0] === 'mousedown')[0][1].call(window, {
    target: 'window'
  });

  expect(TestUtils.scryRenderedComponentsWithType(root, Dropdown).length).toBe(0);

  expect(window.addEventListener.mock.calls.filter(c => c[0] === 'mousedown').length).toBe(1);
  expect(window.removeEventListener.mock.calls.filter(c => c[0] === 'mousedown').length).toBe(1);

  ReactDOM.unmountComponentAtNode(mountPoint);
});

test('passes buttonProps to custom component', () => {
  const mountPoint = document.createElement('div');
  /* eslint-ignore-next-line react/prop-types */
  const CustomButton: Function = ({domNode, customProp}) => {
    return <button html-custom={customProp} ref={domNode}>btn</button>;
  };
  CustomButton.propTypes = {
    domNode: PropTypes.node,
    customProp: PropTypes.string
  };

  const root: MenuButton = (ReactDOM.render(
    <MenuButton
      ButtonComponent={CustomButton}
      buttonProps={{ customProp: 'custom-prop' }}
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
  if (!button) throw new Error();
  expect(TestUtils.scryRenderedComponentsWithType(root, Dropdown).length).toBe(0);

  expect(button.getAttribute('custom')).toBeDefined();

  ReactDOM.unmountComponentAtNode(mountPoint);
});
