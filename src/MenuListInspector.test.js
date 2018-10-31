/* @flow */

import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-dom/test-utils';
import {MenuListInspector, MenuList, MenuItem} from '.';

test('cursor movement works', () => {
  const mountPoint = document.createElement('div');
  const root: MenuListInspector = (ReactDOM.render(
    <MenuListInspector>
      <div>
        <MenuList>
          <MenuItem onHighlightChange={jest.fn()}>A</MenuItem>
          <div>
            <MenuItem onHighlightChange={jest.fn()}>B</MenuItem>
          </div>
          <MenuItem onHighlightChange={jest.fn()}>C</MenuItem>
        </MenuList>
      </div>
    </MenuListInspector>,
    mountPoint
  ): any);

  const menuListItems = TestUtils.scryRenderedComponentsWithType(root, MenuItem);

  expect(menuListItems.map(c=>c.props.children)).toEqual(
    ['A', 'B', 'C']
  );

  expect(menuListItems[0].props.onHighlightChange.mock.calls).toEqual([]);
  expect(menuListItems[1].props.onHighlightChange.mock.calls).toEqual([]);
  expect(menuListItems[2].props.onHighlightChange.mock.calls).toEqual([]);

  root.moveCursor('down');

  expect(menuListItems[0].props.onHighlightChange.mock.calls).toEqual([
    [true, {byKeyboard: true, prevCursorLocation: undefined, direction: 'down'}]]);
  expect(menuListItems[1].props.onHighlightChange.mock.calls).toEqual([]);
  expect(menuListItems[2].props.onHighlightChange.mock.calls).toEqual([]);

  root.moveCursor('up');

  expect(menuListItems[0].props.onHighlightChange.mock.calls).toEqual([
    [true, {byKeyboard: true, prevCursorLocation: undefined, direction: 'down'}],
    [false, {byKeyboard: undefined, prevCursorLocation: undefined, direction: undefined}]
  ]);
  expect(menuListItems[1].props.onHighlightChange.mock.calls).toEqual([]);
  expect(menuListItems[2].props.onHighlightChange.mock.calls).toEqual([
    [true, {byKeyboard: true, prevCursorLocation: undefined, direction: 'up'}]
  ]);

  ReactDOM.unmountComponentAtNode(mountPoint);
});

test('hasHighlight works', () => {
  const mountPoint = document.createElement('div');
  const root: MenuListInspector = (ReactDOM.render(
    <MenuListInspector>
      <MenuList>
        <MenuItem>A</MenuItem>
        <MenuItem>B</MenuItem>
      </MenuList>
    </MenuListInspector>,
    mountPoint
  ): any);

  expect(root.hasHighlight()).toBe(false);

  root.moveCursor('down');

  expect(root.hasHighlight()).toBe(true);

  ReactDOM.unmountComponentAtNode(mountPoint);
});

test('empty list works', () => {
  const mountPoint = document.createElement('div');
  const root: MenuListInspector = (ReactDOM.render(
    <MenuListInspector>
      <MenuList>
      </MenuList>
    </MenuListInspector>,
    mountPoint
  ): any);

  root.moveCursor('up');
  root.moveCursor('down');
  expect(root.hasHighlight()).toBe(false);

  ReactDOM.unmountComponentAtNode(mountPoint);
});

test('no lists works', () => {
  const mountPoint = document.createElement('div');
  const root: MenuListInspector = (ReactDOM.render(
    <MenuListInspector>
      <div />
    </MenuListInspector>,
    mountPoint
  ): any);

  root.moveCursor('up');
  root.moveCursor('down');
  expect(root.hasHighlight()).toBe(false);

  ReactDOM.unmountComponentAtNode(mountPoint);
});
