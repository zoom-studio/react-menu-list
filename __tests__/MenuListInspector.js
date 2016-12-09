/* @flow */

import assert from 'assert';
import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';
import {MenuListInspector, MenuList, MenuItem} from '../src';

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

  assert.deepEqual(
    menuListItems.map(c=>c.props.children),
    ['A', 'B', 'C']
  );

  assert.deepEqual(menuListItems[0].props.onHighlightChange.mock.calls, []);
  assert.deepEqual(menuListItems[1].props.onHighlightChange.mock.calls, []);
  assert.deepEqual(menuListItems[2].props.onHighlightChange.mock.calls, []);

  root.moveCursor('down');

  assert.deepEqual(menuListItems[0].props.onHighlightChange.mock.calls, [
    [true, {byKeyboard: true, prevCursorLocation: undefined, direction: 'down'}]]);
  assert.deepEqual(menuListItems[1].props.onHighlightChange.mock.calls, []);
  assert.deepEqual(menuListItems[2].props.onHighlightChange.mock.calls, []);

  root.moveCursor('up');

  assert.deepEqual(menuListItems[0].props.onHighlightChange.mock.calls, [
    [true, {byKeyboard: true, prevCursorLocation: undefined, direction: 'down'}],
    [false, {byKeyboard: undefined, prevCursorLocation: undefined, direction: undefined}]
  ]);
  assert.deepEqual(menuListItems[1].props.onHighlightChange.mock.calls, []);
  assert.deepEqual(menuListItems[2].props.onHighlightChange.mock.calls, [
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

  assert(!root.hasHighlight());

  root.moveCursor('down');

  assert(root.hasHighlight());

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
  assert(!root.hasHighlight());

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
  assert(!root.hasHighlight());

  ReactDOM.unmountComponentAtNode(mountPoint);
});
