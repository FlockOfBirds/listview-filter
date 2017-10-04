[![Build Status](https://travis-ci.org/mendixlabs/listview-filter.svg?branch=master)](https://travis-ci.org/mendixlabs/listview-filter)
[![Dependency Status](https://david-dm.org/mendixlabs/listview-filter.svg)](https://david-dm.org/mendixlabs/listview-filter)
[![Dev Dependency Status](https://david-dm.org/mendixlabs/listview-filter.svg#info=devDependencies)](https://david-dm.org/mendixlabs/listview-filter#info=devDependencies)
[![codecov](https://codecov.io/gh/mendixlabs/listview-filter/branch/master/graph/badge.svg)](https://codecov.io/gh/mendixlabs/listview-filter)

# Drop-down filter
Enable users to filter a list view at run time, with various options that can be selected from a drop-down

## Features
* Filter items by an attribute
* Filter items by XPath
* Select a filter from a list of options
* Set a default filter option

## Dependencies
Mendix 7.6

## Demo project
[https://dropdownfilter.mxapps.io/](https://dropdownfilter.mxapps.io/)

![Demo](assets/Demo.gif)

## Usage
Place the Drop-down filter widget above a list view.
Provide the entity name of the target list view in the `General` tab.

![General](assets/General.png)

Add a new filter with a caption and choose comparison type.

![Filters](assets/Filters.png)

When filtering by `Attribute`, select an attribute and input a value to filter by
When filtering by `XPath`, input a constraint to filter by.
`None` is for an empty option which resets the filter then selected.

**NB: The `None` filter option should always appear at the top of the list and it does not require a caption.** 
**Also to note, only one empty filter option should be selected.**

![XPathConstraint](assets/XPathConstraint.png)

## Issues, suggestions and feature requests
Please report issues at [https://github.com/mendixlabs/listview-filter/issues](https://github.com/mendixlabs/listview-filter/issues).

## Development and contribution
Please follow [development guide](/development.md).
