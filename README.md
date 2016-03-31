# react-menu-list

[![Circle CI](https://circleci.com/gh/StreakYC/react-menu-list.svg?style=shield)](https://circleci.com/gh/StreakYC/react-menu-list)
[![npm version](https://badge.fury.io/js/react-menu-list.svg)](https://badge.fury.io/js/react-menu-list)

**This project's documentation is currently incomplete.**

This project is a set of components for building menus with. This project works
well for dropdown and autocomplete menus. The menus are correctly
keyboard-accessible, and it includes polish like established desktop
application menus have such as well-behaved submenus which stay open even if
the user briefly moves the mouse over other menu items while moving toward the
submenu's dropdown.

This project differs from other similar projects because it allows arbitrary
elements to be in the menu, including allowing menu items to be nested into
other elements, and allows custom menu items that take control of the cursor.

This project doesn't include much CSS styling for the menus. You need to bring
your own CSS. This makes this project great for someone trying to match their
application's existing style. It's recommended that your application create
wrapper components around this project's components that add your application's
CSS.

![Example](https://streakyc.github.io/react-menu-list/video/menus.gif)

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

## Component Overview

This project exports the following components:

Core
* `MenuList`
* `MenuItem`
* `SubMenuItem`
* `MenuListInspector`: This component lets you manipulate and listen to events
 from descendant MenuList elements. The primary use of this component is to
 allow a MenuButton to detect when a MenuList provided to it has been clicked
 on.

Application
* `MenuButton`
* `Dropdown`

## MenuList

*TODO*

## MenuList

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
