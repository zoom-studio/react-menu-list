import * as React from 'react';
import {ReactNode, Ref} from 'react';

import {Options as FloatAnchorOptions} from 'react-float-anchor';
export {Options as FloatAnchorOptions} from 'react-float-anchor';

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Rect {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface MenuEvent {
  type: string;
  cancelBubble: boolean;
  defaultPrevented: boolean;
  stopPropagation(): void;
  preventDefault(): void;
}

export interface ChosenEvent extends MenuEvent {
  byKeyboard: boolean;
}

// MenuList

export interface MenuListProps {
  onItemChosen?: (event: ChosenEvent) => void;
  onLeftPushed?: (event: MenuEvent) => void;
  onRightPushed?: (event: MenuEvent) => void;
  children?: ReactNode;
}
export class MenuList extends React.Component<MenuListProps> {
  moveCursor(direction: Direction, prevCursorLocation?: Rect): void;
  hasHighlight(): boolean;
}

// MenuItem

export interface MenuItemProps {
  onItemChosen?: (event: ChosenEvent) => void;
  onLeftPushed?: (event: MenuEvent) => void;
  onRightPushed?: (event: MenuEvent) => void;
  onHighlightChange?: (
    highlighted: boolean,
    details: {
      byKeyboard?: boolean;
      prevCursorLocation?: Rect;
      direction?: Direction;
    }
  ) => void;

  className?: string;
  style?: Object;
  highlightedClassName?: string;
  highlightedStyle?: Object;

  index?: number;
  onMouseLeave?: (event: MouseEvent) => void;

  children?: ReactNode;

  domRef?: Ref<HTMLDivElement>;

  'aria-haspopup'?: boolean;
  'aria-expanded'?: boolean;
}
export class MenuItem extends React.Component<MenuItemProps> {
  hasHighlight(): boolean;
  takeKeyboard(): void;
  releaseKeyboard(): void;
  lockHighlight(): void;
  unlockHighlight(): void;

  // TODO jsdoc/tsdoc?
  // byKeyboard forces focus immediately and scrolls the item into view. It defaults to true.
  // With it false, the highlight might be delayed depending on mouse movement
  // and won't cause anything to scroll.
  highlight(byKeyboard?: boolean): void;

  unhighlight(): void;
  moveCursor(direction: Direction, prevCursorLocation?: Rect): void;
}

// MenuListInspector

export interface MenuListInspectorProps {
  onItemChosen?: (event: ChosenEvent) => void;
  onLeftPushed?: (event: MenuEvent) => void;
  onRightPushed?: (event: MenuEvent) => void;
  children: ReactNode;
}
export class MenuListInspector extends React.Component<MenuListInspectorProps> {
  moveCursor(direction: Direction, prevCursorLocation?: Rect): boolean;
  hasHighlight(): boolean;
}

// Dropdown

export class Dropdown extends React.Component<{}> {}

// MenuButton

export type MenuButtonRenderProp = (
  domRef: React.Ref<any>,
  opened: boolean,
  onKeyPress: (e: React.KeyboardEvent) => void,
  onMouseDown: (e: React.MouseEvent) => void
) => ReactNode;

export interface MenuButtonProps {
  className?: string;
  style?: Object;
  disabled?: boolean;
  title?: string;
  openedClassName?: string;
  openedStyle?: Object;
  children?: ReactNode;

  renderButton?: MenuButtonRenderProp;

  positionOptions?: FloatAnchorOptions;
  menuZIndex?: string | number;
  menuParentElement?: HTMLElement;

  menu: ReactNode;
  onWillOpen?: () => void;
  onDidOpen?: () => void;
  onWillClose?: () => void;
}
export class MenuButton extends React.Component<MenuButtonProps> {
  open(): Promise<void>;
  close(): void;
  toggle(): void;
  reposition(): void;
}

// SubMenuItem

export interface SubMenuItemProps {
  menu: ReactNode;
  positionOptions?: FloatAnchorOptions;
  menuZIndex?: string | number;
  menuParentElement?: HTMLElement;

  onWillOpen?: () => void;
  onDidOpen?: () => void;
  onWillClose?: () => void;

  className?: string;
  style?: Object;
  highlightedClassName?: string;
  highlightedStyle?: Object;
  index?: number;

  openedClassName?: string;
  openedStyle?: Object;

  onItemChosen?: (event: ChosenEvent) => void;
  onHighlightChange?: (
    highlighted: boolean,
    details: {
      byKeyboard?: boolean;
      prevCursorLocation?: Rect;
      direction?: Direction;
    }
  ) => void;

  children?: ReactNode;
}
export class SubMenuItem extends React.Component<SubMenuItemProps> {
  open(): Promise<void>;
  close(): void;
  toggle(): void;
  reposition(): void;
  hasHighlight(): boolean;
  highlight(byKeyboard?: boolean): void;
  unhighlight(): void;
  moveCursor(direction: Direction, prevCursorLocation?: Rect): void;
}
