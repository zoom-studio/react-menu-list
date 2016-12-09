/* @flow */

import assert from 'assert';
import sinon from 'sinon';
import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';
import {MenuListInspector, MenuList, MenuItem} from '../src';

describe('MenuListInspector', function() {
  it('cursor movement works', function() {
    const mountPoint = document.createElement('div');
    const root: MenuListInspector = (ReactDOM.render(
      <MenuListInspector>
        <div>
          <MenuList>
            <MenuItem onHighlightChange={sinon.spy()}>A</MenuItem>
            <div>
              <MenuItem onHighlightChange={sinon.spy()}>B</MenuItem>
            </div>
            <MenuItem onHighlightChange={sinon.spy()}>C</MenuItem>
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

    assert.deepEqual(menuListItems[0].props.onHighlightChange.args, []);
    assert.deepEqual(menuListItems[1].props.onHighlightChange.args, []);
    assert.deepEqual(menuListItems[2].props.onHighlightChange.args, []);

    root.moveCursor('down');

    assert.deepEqual(menuListItems[0].props.onHighlightChange.args, [
      [true, {byKeyboard: true, prevCursorLocation: undefined, direction: 'down'}]]);
    assert.deepEqual(menuListItems[1].props.onHighlightChange.args, []);
    assert.deepEqual(menuListItems[2].props.onHighlightChange.args, []);

    root.moveCursor('up');

    assert.deepEqual(menuListItems[0].props.onHighlightChange.args, [
      [true, {byKeyboard: true, prevCursorLocation: undefined, direction: 'down'}],
      [false, {byKeyboard: undefined, prevCursorLocation: undefined, direction: undefined}]
    ]);
    assert.deepEqual(menuListItems[1].props.onHighlightChange.args, []);
    assert.deepEqual(menuListItems[2].props.onHighlightChange.args, [
      [true, {byKeyboard: true, prevCursorLocation: undefined, direction: 'up'}]
    ]);

    ReactDOM.unmountComponentAtNode(mountPoint);
  });

  it('hasHighlight works', function() {
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

  it('empty list works', function() {
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

  it('no lists works', function() {
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
});
