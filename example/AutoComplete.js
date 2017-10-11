/* @flow */
/* eslint-disable react/prop-types */

import React from 'react';
import {
  Dropdown, MenuList, MenuItem, SubMenuItem
} from '../src';
import FloatAnchor from 'react-float-anchor';
import type {Options as PositionOptions} from 'react-float-anchor';

type Item = string|{title:string,items:Array<Item>};

type Props = {
  className?: ?string;
  style?: ?Object;
  positionOptions: PositionOptions;
  autoHighlight: boolean;
  defaultValue: string;
  items: Array<Item>;
};

type State = {
  opened: boolean;
  value: string;
};

// This is an example autocomplete widget built using the library. It's not
// very generic; you might want to copy this into your application and
// customize it for your uses and to match your application's styling.
export default class AutoComplete extends React.Component<Props, State> {
  static defaultProps = {
    positionOptions: {position:'bottom', hAlign:'left'},
    autoHighlight: false,
    defaultValue: ''
  };

  _floatAnchor: FloatAnchor;

  constructor(props: Props) {
    super(props);
    this.state = {
      opened: false,
      value: props.defaultValue
    };
  }

  open() {
    if (this.state.opened) return;
    this.setState({opened: true});
  }

  close() {
    if (!this.state.opened) return;
    this.setState({opened: false});
  }

  toggle() {
    if (this.state.opened) {
      this.close();
    } else {
      this.open();
    }
  }

  _itemChosen() {
    this.close();
  }

  render() {
    const {className, style, positionOptions, autoHighlight, items} = this.props;
    const {value, opened} = this.state;

    function filterItems(items: Array<Item>): Array<Item> {
      return items.map(item => {
        if (typeof item === 'string') {
          return item.toLowerCase().startsWith(value.toLowerCase()) ? item : null;
        } else {
          const subItems = filterItems(item.items);
          return subItems.length ? {title: item.title, items: subItems} : null;
        }
      }).filter(Boolean);
    }

    const filteredItems = filterItems(items);

    return (
      <FloatAnchor
        ref={el => {
          if (el) this._floatAnchor = el;
        }}
        options={positionOptions}
        anchor={
          <input
            type="text"
            className={className}
            style={style}
            value={value}
            onChange={e => this.setState({value: e.target.value})}
            onBlur={()=>this.close()}
            onFocus={()=>this.open()}
            onKeyDown={e=>{
              if (opened) {
                if (e.key === 'Escape') {
                  this.close();
                  e.preventDefault();
                  e.stopPropagation();
                }
              } else {
                if (e.key !== 'Enter') {
                  this.open();
                }
              }
            }}
          />
        }
        float={
          !(opened && filteredItems.length) ? null :
            <AutoCompleteMenu
              value={value}
              autoHighlight={autoHighlight}
              filteredItems={filteredItems}
              onValueChosen={value => {
                this.setState({value});
                this.close();
              }}
              reposition={() => {
                this._floatAnchor.reposition();
              }}
            />
        }
      />
    );
  }
}

type MenuProps = {
  value: string;
  autoHighlight: boolean;
  filteredItems: Array<Item>;
  onValueChosen: (value: string) => void;
  reposition: () => void;
};

// This component is separate so that its componentDidUpdate method gets called
// at the right time. AutoComplete's componentDidUpdate method may get called
// before the FloatAnchor's floated elements have been updated.
class AutoCompleteMenu extends React.Component<MenuProps> {
  _firstItem: MenuItem|SubMenuItem;

  componentDidMount() {
    if (this.props.autoHighlight && this._firstItem) {
      this._firstItem.highlight();
    }
  }

  componentDidUpdate(prevProps: MenuProps) {
    if (prevProps.value !== this.props.value) {
      this.props.reposition();

      if (this.props.autoHighlight && this._firstItem) {
        this._firstItem.highlight();
      }
    }
  }

  render() {
    const {filteredItems} = this.props;

    const makeElements = nested => (_item, i) => {
      const item = _item; // needed so Flow knows the variable can't have its type change
      const ref = !nested && i === 0 ?
        (el => {
          if (el) this._firstItem = el;
        })
        : null;

      return typeof item === 'string' ?
        <MenuItem
          ref={ref}
          highlightedStyle={{background: 'gray'}}
          onItemChosen={() => this.props.onValueChosen(item)}
          key={item}
        >
          {item}
        </MenuItem>
        :
        <SubMenuItem
          ref={ref}
          highlightedStyle={{background: 'gray'}}
          key={item.title}
          menu={
            <Dropdown>
              <MenuList>
                {item.items.map(makeElements(true))}
              </MenuList>
            </Dropdown>
          }
        >
          {item.title} ►
        </SubMenuItem>;
    };

    const itemElements = filteredItems.map(makeElements(false));

    return (
      <Dropdown>
        <div
          onMouseDown={e => {
            // Block focus from being switched out of the AutoComplete textbox.
            // If you need an AutoComplete-like component that keeps its
            // dropdown open after the textbox loses focus, then look at the
            // changes made to MenuButton in commit 47a698a3cd59.
            e.preventDefault();
          }}
        >
          <MenuList>
            {itemElements}
          </MenuList>
        </div>
      </Dropdown>
    );
  }
}
