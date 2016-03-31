/* @flow */

import React, {PropTypes} from 'react';
import {
  Dropdown, MenuList, MenuItem, MenuListInspector,
  SubMenuItem
} from '../src';
import FloatAnchor from 'react-float-anchor';
import type {Options as PositionOptions} from 'contain-by-screen';

type Item = string|{title:string,items:Array<Item>};

type Props = {
  className?: ?string;
  style?: ?Object;
  positionOptions: PositionOptions;
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
  static propTypes = {
    className: PropTypes.string,
    style: PropTypes.object,
    positionOptions: PropTypes.object,

    defaultValue: PropTypes.string,
    items: PropTypes.array.isRequired
  };

  static defaultProps = {
    positionOptions: {position:'bottom', hAlign:'left'},
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

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (prevState.value !== this.state.value) {
      this.refs.floatanchor.reposition();
    }
  }

  render() {
    const {className, style, positionOptions, items} = this.props;
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

    const makeElements = item => (
      typeof item === 'string' ?
        <MenuItem
          highlightedStyle={{background: 'gray'}}
          onItemChosen={() => this.setState({value: (item: any)})}
          key={item}
        >
          {item}
        </MenuItem>
      :
        <SubMenuItem
          highlightedStyle={{background: 'gray'}}
          key={item.title}
          menu={
            <Dropdown>
              <MenuList>
                {item.items.map(makeElements)}
              </MenuList>
            </Dropdown>
          }
        >
          {item.title} ►
        </SubMenuItem>
    );

    const filteredItems = filterItems(items);
    const itemElements = filteredItems.map(makeElements);

    return (
      <FloatAnchor
        ref="floatanchor"
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
            <MenuListInspector
              onItemChosen={() => this.close()}
            >
              <Dropdown>
                <MenuList>
                  {itemElements}
                </MenuList>
              </Dropdown>
            </MenuListInspector>
        }
      />
    );
  }
}
