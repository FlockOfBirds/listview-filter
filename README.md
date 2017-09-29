[![Build Status](https://travis-ci.org/mendixlabs/listview-filter.svg?branch=master)](https://travis-ci.org/mendixlabs/listview-filter)
[![Dependency Status](https://david-dm.org/mendixlabs/listview-filter.svg)](https://david-dm.org/mendixlabs/listview-filter)
[![Dev Dependency Status](https://david-dm.org/mendixlabs/listview-filter.svg#info=devDependencies)](https://david-dm.org/mendixlabs/listview-filter#info=devDependencies)
[![codecov](https://codecov.io/gh/mendixlabs/listview-filter/branch/master/graph/badge.svg)](https://codecov.io/gh/mendixlabs/listview-filter)

# Drop-down filter
Filter mendix list views using a drop-down

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
The list view entity in the `Data source` tab is a required property.

![Data source](assets/Datasource.png)

Add a new filter with a caption and choose comparison type.

![Filters](assets/Filters.png)

When filtering by `Attribute`, select an attribute and input a value to filter by
When filtering by `XPath`, input a constraint to filter by.

![Constraint](assets/Constraint.png)

## Issues, suggestions and feature requests
Please report issues at [https://github.com/mendixlabs/listview-filter/issues](https://github.com/mendixlabs/listview-filter/issues).

## Development and contribution
Please follow [development guide](/development.md).
