/* @flow */

import assert from 'assert';
import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';
import {MenuList, MenuItem} from '../src';

afterEach(() => {
  delete window.addEventListener;
  delete window.removeEventListener;
});

test('cursor movement works', () => {
  window.addEventListener = jest.fn(window.addEventListener);
  window.removeEventListener = jest.fn(window.removeEventListener);

  const mountPoint = document.createElement('div');
  const root: MenuList = (ReactDOM.render(
    <MenuList>
      <MenuItem onHighlightChange={jest.fn()}>A</MenuItem>
      <div>
        <MenuItem onHighlightChange={jest.fn()}>B</MenuItem>
      </div>
      <MenuItem onHighlightChange={jest.fn()}>C</MenuItem>
    </MenuList>,
    mountPoint
  ): any);

  const menuListItems = TestUtils.scryRenderedComponentsWithType(root, MenuItem);

  assert.deepEqual(
    menuListItems.map(c=>c.props.children),
    ['A', 'B', 'C']
  );

  const keydownCaptureHandlers = window.addEventListener.mock.calls.filter(args =>
    args[0] === 'keydown' && args[2]
  ).map(args => args[1]);
  assert.strictEqual(keydownCaptureHandlers.length, 1);

  assert.deepEqual(menuListItems[0].props.onHighlightChange.mock.calls, []);
  assert.deepEqual(menuListItems[1].props.onHighlightChange.mock.calls, []);
  assert.deepEqual(menuListItems[2].props.onHighlightChange.mock.calls, []);

  keydownCaptureHandlers[0]({
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
    key: 'ArrowDown',
    which: 40,
    target: document.body
  });

  assert.deepEqual(menuListItems[0].props.onHighlightChange.mock.calls, [
    [true, {byKeyboard: true, prevCursorLocation: undefined, direction: 'down'}]]);
  assert.deepEqual(menuListItems[1].props.onHighlightChange.mock.calls, []);
  assert.deepEqual(menuListItems[2].props.onHighlightChange.mock.calls, []);

  keydownCaptureHandlers[0]({
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
    key: 'ArrowDown',
    which: 40,
    target: document.body
  });

  assert.deepEqual(menuListItems[0].props.onHighlightChange.mock.calls, [
    [true, {byKeyboard: true, prevCursorLocation: undefined, direction: 'down'}],
    [false, {byKeyboard: undefined, prevCursorLocation: undefined, direction: undefined}]]);
  assert.deepEqual(menuListItems[1].props.onHighlightChange.mock.calls, [
    [true, {byKeyboard: true, prevCursorLocation: undefined, direction: 'down'}]]);
  assert.deepEqual(menuListItems[2].props.onHighlightChange.mock.calls, []);

  keydownCaptureHandlers[0]({
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
    key: 'ArrowDown',
    which: 40,
    target: document.body
  });

  assert.deepEqual(menuListItems[0].props.onHighlightChange.mock.calls, [
    [true, {byKeyboard: true, prevCursorLocation: undefined, direction: 'down'}],
    [false, {byKeyboard: undefined, prevCursorLocation: undefined, direction: undefined}]]);
  assert.deepEqual(menuListItems[1].props.onHighlightChange.mock.calls, [
    [true, {byKeyboard: true, prevCursorLocation: undefined, direction: 'down'}],
    [false, {byKeyboard: undefined, prevCursorLocation: undefined, direction: undefined}]]);
  assert.deepEqual(menuListItems[2].props.onHighlightChange.mock.calls, [
    [true, {byKeyboard: true, prevCursorLocation: undefined, direction: 'down'}]]);

  keydownCaptureHandlers[0]({
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
    key: 'ArrowDown',
    which: 40,
    target: document.body
  });

  assert.deepEqual(menuListItems[0].props.onHighlightChange.mock.calls, [
    [true, {byKeyboard: true, prevCursorLocation: undefined, direction: 'down'}],
    [false, {byKeyboard: undefined, prevCursorLocation: undefined, direction: undefined}],
    [true, {byKeyboard: true, prevCursorLocation: undefined, direction: 'down'}]]);
  assert.deepEqual(menuListItems[1].props.onHighlightChange.mock.calls, [
    [true, {byKeyboard: true, prevCursorLocation: undefined, direction: 'down'}],
    [false, {byKeyboard: undefined, prevCursorLocation: undefined, direction: undefined}]]);
  assert.deepEqual(menuListItems[2].props.onHighlightChange.mock.calls, [
    [true, {byKeyboard: true, prevCursorLocation: undefined, direction: 'down'}],
    [false, {byKeyboard: undefined, prevCursorLocation: undefined, direction: undefined}]]);

  // Up time

  keydownCaptureHandlers[0]({
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
    key: 'ArrowUp',
    which: 38,
    target: document.body
  });

  assert.deepEqual(menuListItems[0].props.onHighlightChange.mock.calls, [
    [true, {byKeyboard: true, prevCursorLocation: undefined, direction: 'down'}],
    [false, {byKeyboard: undefined, prevCursorLocation: undefined, direction: undefined}],
    [true, {byKeyboard: true, prevCursorLocation: undefined, direction: 'down'}],
    [false, {byKeyboard: undefined, prevCursorLocation: undefined, direction: undefined}]]);
  assert.deepEqual(menuListItems[1].props.onHighlightChange.mock.calls, [
    [true, {byKeyboard: true, prevCursorLocation: undefined, direction: 'down'}],
    [false, {byKeyboard: undefined, prevCursorLocation: undefined, direction: undefined}]]);
  assert.deepEqual(menuListItems[2].props.onHighlightChange.mock.calls, [
    [true, {byKeyboard: true, prevCursorLocation: undefined, direction: 'down'}],
    [false, {byKeyboard: undefined, prevCursorLocation: undefined, direction: undefined}],
    [true, {byKeyboard: true, prevCursorLocation: undefined, direction: 'up'}]]);

  keydownCaptureHandlers[0]({
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
    key: 'ArrowUp',
    which: 38,
    target: document.body
  });

  assert.deepEqual(menuListItems[0].props.onHighlightChange.mock.calls, [
    [true, {byKeyboard: true, prevCursorLocation: undefined, direction: 'down'}],
    [false, {byKeyboard: undefined, prevCursorLocation: undefined, direction: undefined}],
    [true, {byKeyboard: true, prevCursorLocation: undefined, direction: 'down'}],
    [false, {byKeyboard: undefined, prevCursorLocation: undefined, direction: undefined}]]);
  assert.deepEqual(menuListItems[1].props.onHighlightChange.mock.calls, [
    [true, {byKeyboard: true, prevCursorLocation: undefined, direction: 'down'}],
    [false, {byKeyboard: undefined, prevCursorLocation: undefined, direction: undefined}],
    [true, {byKeyboard: true, prevCursorLocation: undefined, direction: 'up'}]]);
  assert.deepEqual(menuListItems[2].props.onHighlightChange.mock.calls, [
    [true, {byKeyboard: true, prevCursorLocation: undefined, direction: 'down'}],
    [false, {byKeyboard: undefined, prevCursorLocation: undefined, direction: undefined}],
    [true, {byKeyboard: true, prevCursorLocation: undefined, direction: 'up'}],
    [false, {byKeyboard: undefined, prevCursorLocation: undefined, direction: undefined}]]);

  root.moveCursor('up', {top: 5, bottom: 6, left: 7, right: 8});

  assert.deepEqual(menuListItems[0].props.onHighlightChange.mock.calls, [
    [true, {byKeyboard: true, prevCursorLocation: undefined, direction: 'down'}],
    [false, {byKeyboard: undefined, prevCursorLocation: undefined, direction: undefined}],
    [true, {byKeyboard: true, prevCursorLocation: undefined, direction: 'down'}],
    [false, {byKeyboard: undefined, prevCursorLocation: undefined, direction: undefined}],
    [true, {byKeyboard: true, prevCursorLocation: {top: 5, bottom: 6, left: 7, right: 8}, direction: 'up'}]]);
  assert.deepEqual(menuListItems[1].props.onHighlightChange.mock.calls, [
    [true, {byKeyboard: true, prevCursorLocation: undefined, direction: 'down'}],
    [false, {byKeyboard: undefined, prevCursorLocation: undefined, direction: undefined}],
    [true, {byKeyboard: true, prevCursorLocation: undefined, direction: 'up'}],
    [false, {byKeyboard: undefined, prevCursorLocation: undefined, direction: undefined}]]);
  assert.deepEqual(menuListItems[2].props.onHighlightChange.mock.calls, [
    [true, {byKeyboard: true, prevCursorLocation: undefined, direction: 'down'}],
    [false, {byKeyboard: undefined, prevCursorLocation: undefined, direction: undefined}],
    [true, {byKeyboard: true, prevCursorLocation: undefined, direction: 'up'}],
    [false, {byKeyboard: undefined, prevCursorLocation: undefined, direction: undefined}]]);

  ReactDOM.unmountComponentAtNode(mountPoint);
});

test('empty list works', () => {
  const mountPoint = document.createElement('div');
  const root: MenuList = (ReactDOM.render(
    <MenuList>
    </MenuList>,
    mountPoint
  ): any);

  root.moveCursor('up');
  root.moveCursor('down');

  ReactDOM.unmountComponentAtNode(mountPoint);
});

test('does not emit ChosenEvents on enter if nothing was chosen', () => {
  window.addEventListener = jest.fn(window.addEventListener);
  window.removeEventListener = jest.fn(window.removeEventListener);

  const mountPoint = document.createElement('div');
  const root: MenuList = (ReactDOM.render(
    <MenuList onItemChosen={jest.fn()}>
      <MenuItem onItemChosen={jest.fn()}>A</MenuItem>
      <MenuItem onItemChosen={jest.fn()}>B</MenuItem>
    </MenuList>,
    mountPoint
  ): any);

  const menuListItems = TestUtils.scryRenderedComponentsWithType(root, MenuItem);

  const keydownCaptureHandlers = window.addEventListener.mock.calls.filter(args =>
    args[0] === 'keydown' && args[2]
  ).map(args => args[1]);
  assert.strictEqual(keydownCaptureHandlers.length, 1);

  expect(root.props.onItemChosen).not.toHaveBeenCalled();
  expect(menuListItems[0].props.onItemChosen).not.toHaveBeenCalled();
  expect(menuListItems[1].props.onItemChosen).not.toHaveBeenCalled();

  {
    const event = {
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
      key: 'Enter',
      which: 13,
      target: document.body
    };
    keydownCaptureHandlers[0](event);
    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(event.stopPropagation).not.toHaveBeenCalled();
  }

  assert(!root.hasHighlight());
  expect(root.props.onItemChosen).not.toHaveBeenCalled();
  expect(menuListItems[0].props.onItemChosen).not.toHaveBeenCalled();
  expect(menuListItems[1].props.onItemChosen).not.toHaveBeenCalled();

  keydownCaptureHandlers[0]({
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
    key: 'ArrowDown',
    which: 40,
    target: document.body
  });

  assert(root.hasHighlight());

  {
    const event = {
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
      key: 'Enter',
      which: 13,
      target: document.body
    };
    keydownCaptureHandlers[0](event);
    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(event.stopPropagation).toHaveBeenCalledTimes(1);
  }

  assert(root.hasHighlight());
  expect(root.props.onItemChosen).toHaveBeenCalledTimes(1);
  expect(menuListItems[0].props.onItemChosen).toHaveBeenCalledTimes(1);
  expect(menuListItems[1].props.onItemChosen).not.toHaveBeenCalled();

  ReactDOM.unmountComponentAtNode(mountPoint);
});
