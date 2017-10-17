import { Component, ReactElement, createElement } from "react";
import { findDOMNode } from "react-dom";

import { Alert } from "./Alert";
import { DropDownFilter, DropDownFilterProps } from "./DropDownFilter";
import { Utils, parseStyle } from "../utils/ContainerUtils";
import { DataSourceHelper } from "../utils/DataSourceHelper/DataSourceHelper";

import * as classNames from "classnames";
import * as dijitRegistry from "dijit/registry";
import * as dojoConnect from "dojo/_base/connect";

interface WrapperProps {
    class: string;
    style: string;
    friendlyId: string;
    mxform?: mxui.lib.form._FormBase;
    mxObject: mendix.lib.MxObject;
}

export interface ContainerProps extends WrapperProps {
    entity: string;
    filters: FilterProps[];
}

export interface FilterProps {
    caption: string;
    filterBy: filterOptions;
    attribute: string;
    attributeValue: string;
    constraint: string;
    isDefault: boolean;
}

export type filterOptions = "none" | "attribute" | "XPath";
type HybridConstraint = Array<{ attribute: string; operator: string; value: string; path?: string; }>;

export interface ListView extends mxui.widget._WidgetBase {
    _datasource: {
        _constraints: HybridConstraint | string;
        _pageObjs: mendix.lib.MxObject[];
    };
    datasource: {
        type: "microflow" | "entityPath" | "database" | "xpath";
    };
    filter: {
        [key: string ]: HybridConstraint | string;
    };
    update: (obj: mendix.lib.MxObject | null, callback?: () => void) => void;
    _entity: string;
    __customWidgetDataSourceHelper: DataSourceHelper;
}

export interface ContainerState {
    listviewAvailable: boolean;
    targetListView?: ListView;
    targetNode?: HTMLElement;
    validationPassed?: boolean;
}

export default class DropDownFilterContainer extends Component<ContainerProps, ContainerState> {
    private dataSourceHelper: DataSourceHelper;
    private errorMessage: string;

    constructor(props: ContainerProps) {
        super(props);

        this.state = { listviewAvailable: true };
        this.applyFilter = this.applyFilter.bind(this);
        // Ensures that the listView is connected so the widget doesn't break in mobile due to unpredictable render time
        this.connectToListView = this.connectToListView.bind(this);
        dojoConnect.connect(props.mxform, "onNavigation", this, this.connectToListView);
    }

    render() {
        return createElement("div",
            {
                className: classNames("widget-drop-down-filter", this.props.class),
                style: parseStyle(this.props.style)
            },
            this.renderAlert(),
            this.renderDropDownFilter()
        );
    }

    private renderAlert() {
        this.errorMessage = Utils.validate({
            ...this.props as ContainerProps,
            filterNode: this.state.targetNode,
            targetListView: this.state.targetListView,
            validate: !this.state.listviewAvailable
        });

        return createElement(Alert, {
            bootstrapStyle: "danger",
            className: "widget-drop-down-filter-alert",
            message: this.errorMessage
        });
    }

    private renderDropDownFilter(): ReactElement<DropDownFilterProps> {
        if (this.state.validationPassed) {
            const defaultFilterIndex = this.props.filters.indexOf(this.props.filters.filter(value => value.isDefault)[0]);
            if (this.props.mxObject) {
            this.props.filters.forEach(filter => filter.constraint = filter.constraint.replace(`'[%CurrentObject%]'`,
                    this.props.mxObject.getGuid()
                ));
            }

            return createElement(DropDownFilter, {
                defaultFilterIndex,
                filters: this.props.filters,
                handleChange: this.applyFilter
            });
        }

        return null;
    }

    // private handleChange(selectedFilter: FilterProps) {
    //     const { targetListView, targetNode } = this.state;
    //     // To support multiple filters. We attach each drop-down-filter-widget's selected constraint
    //     // On the listView's custom 'filter' object.
    //     if (targetListView && targetListView._datasource && targetNode) {
    //         this.showLoader(targetNode);
    //         const { attribute, filterBy, constraint, attributeValue } = selectedFilter;
    //         if (filterBy === "XPath") {
    //             targetListView.filter[this.props.friendlyId] = constraint;
    //         } else if (filterBy === "attribute") {
    //             targetListView.filter[this.props.friendlyId] = `[contains(${attribute},'${attributeValue}')]`;
    //         } else {
    //             targetListView.filter[this.props.friendlyId] = "";
    //         }
    //         // Combine multiple-filter constraints into one and apply it to the listview
    //         const finalConstraint = Object.keys(targetListView.filter)
    //             .map(key => targetListView.filter[key])
    //             .join("");
    //         targetListView._datasource._constraints = finalConstraint;
    //         targetListView.update(null, () => {
    //             this.hideLoader(targetNode);
    //         });
    //     }
    // }

    private applyFilter(selectedFilter: FilterProps) {
        // construct constraint based on checked
        const constraint = this.getConstraint(selectedFilter);
        if (this.dataSourceHelper)
            this.dataSourceHelper.setConstraint(this.props.friendlyId, constraint);
    }

    private getConstraint(selectedFilter: FilterProps) {
        const { targetListView } = this.state;
        if (targetListView && targetListView._datasource) {
            const { attribute, filterBy, constraint, attributeValue } = selectedFilter;
            if (filterBy === "XPath") {
                return constraint;
            } else if (filterBy === "attribute") {
                return `[contains(${attribute},'${attributeValue}')]`;
            } else {
                return "";
            }
        }
    }

    private connectToListView() {
        const filterNode = findDOMNode(this).parentNode as HTMLElement;
        const targetNode = Utils.findTargetNode(filterNode);
        let targetListView: ListView | null = null;

        if (targetNode) {
            targetListView = dijitRegistry.byNode(targetNode);
            if (targetListView) {
                if (!targetListView.__customWidgetDataSourceHelper) {
                    try {
                        targetListView.__customWidgetDataSourceHelper = new DataSourceHelper(targetListView);
                    } catch (error) {
                        console.log("failed to instantiate DataSourceHelper \n" + error); // tslint:disable-line
                    }
                } else if (!DataSourceHelper.checkVersionCompatible(targetListView.__customWidgetDataSourceHelper.version)) {
                    console.log("Compartibility issue"); // tslint:disable-line
                }
                this.dataSourceHelper = targetListView.__customWidgetDataSourceHelper;

                const validateMessage = Utils.validate({
                    ...this.props as ContainerProps,
                    filterNode: targetNode,
                    targetListView,
                    validate: true
                });
                this.setState({
                    listviewAvailable: !!targetListView,
                    targetListView,
                    targetNode,
                    validationPassed: !validateMessage
                });
            }
        }
    }

    // private connectToListView() {
    //     const filterNode = findDOMNode(this).parentNode as HTMLElement;
    //     const targetNode = Utils.findTargetNode(filterNode);
    //     let targetListView: ListView | null = null;

    //     if (targetNode) {//
    //         this.setState({ targetNode }); //
    //         targetListView = dijitRegistry.byNode(targetNode); //
    //         if (targetListView) { //
    //             targetListView.filter = {}; //
    //             this.setState({ targetListView }); //
    //         }
    //     }
    //     const validateMessage = Utils.validate({
    //         ...this.props as ContainerProps,
    //         filterNode: targetNode,
    //         targetListView,
    //         validate: true
    //     });
    //     this.setState({ listviewAvailable: false, validationPassed: !validateMessage });
    // }
}
