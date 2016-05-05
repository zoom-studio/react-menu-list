/* @flow */

import React from 'react';
import {
  Dropdown, MenuList, MenuItem, SubMenuItem
} from '../src';
import FloatAnchor from 'react-float-anchor';
import type {Options as PositionOptions} from 'contain-by-screen';

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
export default class AutoComplete extends React.Component {
  static defaultProps = {
    positionOptions: {position:'bottom', hAlign:'left'},
    autoHighlight: false,
    defaultValue: ''
  };

  state: State;

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
          return item.toLowerCase().startsWith(value.toLowerCase()) ? item : (null:any);
        } else {
          const subItems = filterItems(item.items);
          return subItems.length ? {title: item.title, items: subItems} : (null:any);
        }
      }).filter(Boolean);
    }

    const filteredItems = filterItems(items);

    return (
      <FloatAnchor
        ref="floatAnchor"
        options={positionOptions}
        anchor={
          <input
            type="text"
            ref="text"
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
                this.refs.floatAnchor.reposition();
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
class AutoCompleteMenu extends React.Component {
  props: MenuProps;

  componentDidMount() {
    if (this.props.autoHighlight && this.refs.firstItem) {
      this.refs.firstItem.highlight();
    }
  }

  componentDidUpdate(prevProps: MenuProps) {
    if (prevProps.value !== this.props.value) {
      this.props.reposition();

      if (this.props.autoHighlight && this.refs.firstItem) {
        this.refs.firstItem.highlight();
      }
    }
  }

  render() {
    const {filteredItems} = this.props;

    const makeElements = nested => (item, i) => {
      const ref = !nested && i === 0 ? 'firstItem' : null;

      return typeof item === 'string' ?
        <MenuItem
          ref={ref}
          highlightedStyle={{background: 'gray'}}
          onItemChosen={() => this.props.onValueChosen((item: any))}
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
        <MenuList>
          {itemElements}
        </MenuList>
      </Dropdown>
    );
  }
}
