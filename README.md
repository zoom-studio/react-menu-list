# react-menu-list

[![Circle CI](https://circleci.com/gh/StreakYC/react-menu-list.svg?style=shield)](https://circleci.com/gh/StreakYC/react-menu-list)
[![npm version](https://badge.fury.io/js/react-menu-list.svg)](https://badge.fury.io/js/react-menu-list)

**This project is a work-in-progress and may not be functional yet!**

This project is a set of components for building menus with.

![Example](https://streakyc.github.io/react-menu-list/video/menus.gif)

This project differs from other similar projects because it allows arbitrary
elements to be in the menu, including allowing menu items to be nested into
other elements, and allows custom menu items that take control of the cursor.

The above example can be tried here:

https://streakyc.github.io/react-menu-list/example/

You can find its code in the `example` directory. The example may be compiled
by running:

```
npm install
npm run example-build
```

You can build the example with live editing enabled (using
[react-transform-hmr](https://github.com/gaearon/react-transform-hmr) and
[browserify-hmr](https://github.com/AgentME/browserify-hmr)) by running:

```
npm run example-watch
```

## MenuList

*TODO*

This module exports the `DraggableList` React component, which takes the
following props:

* `list` must be an array of objects representing your list's items.
* `itemKey` must be the name of a property of the list's objects to use as a
 key to identify the objects, or it must be a function that takes an object as
 an argument and returns a key.
* `template` must be a React component used to render the list items. See the
 next section for a description of the props passed to the component.
* `onMoveEnd` may be a function which will be called when the user drags and
 drops an item to a new position in the list. The arguments to the function
 will be `(newList: Array<Object>, movedItem: Object, oldIndex: number,
 newIndex: number)`.
* `container`: If the DraggableList is inside a scrollable element, then this
 property should be set to a function which returns a reference to it. When the
 user moves an item in the list, the container will be scrolled to keep the
 item in view.
* `springConfig` is an optional object which sets the [SpringHelperConfig
 object passed to
 React-Motion](https://github.com/chenglou/react-motion/tree/85ca75c6de9ed85937d1c95646b6044a66981eee#--spring-val-number-config-springhelperconfig--opaqueconfig)
 for animations. This prop defaults to `{stiffness: 300, damping: 50}`.
* `padding` is an optional number of pixels to leave between items. Defaults to
 10.
* `unsetZIndex` is an optional property that defaults to false. If set to true,
 then the z-index of all of the list items will be set to "auto" when the list
 isn't animating. This may have a small performance cost when the list starts
 and stops animating. Use this if you need to avoid having the list item create
 a stacking context when it's not being animated.

## MenuListItem

*TODO*

## Types

[Flow Type](http://flowtype.org/) declarations for this module are included! As
of Flow v0.22, you must add the following entries to your `.flowconfig` file's
options section for them to work:

```
[options]
esproposal.class_static_fields=enable
esproposal.class_instance_fields=enable
```
