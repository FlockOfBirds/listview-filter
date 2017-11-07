import { Component, ReactElement, createElement } from "react";
import { findDOMNode } from "react-dom";

import { Alert } from "./Alert";
import { DropDownFilter, DropDownFilterProps } from "./DropDownFilter";
import { Utils, parseStyle } from "../utils/ContainerUtils";
import { DataSourceHelper, ListView } from "mendix-data-source-helper";

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

export interface ContainerState {
    alertMessage?: string;
    listviewAvailable: boolean;
    targetListView?: ListView;
    targetNode?: HTMLElement;
}

export default class DropDownFilterContainer extends Component<ContainerProps, ContainerState> {
    private dataSourceHelper: DataSourceHelper;
    private alertMessage: string;

    constructor(props: ContainerProps) {
        super(props);

        this.state = { listviewAvailable: true };
        this.applyFilter = this.applyFilter.bind(this);
        // Ensures that the listView is connected so the widget doesn't break in mobile due to unpredictable render time
        this.connectToListView = this.connectToListView.bind(this);
        dojoConnect.connect(props.mxform, "onNavigation", this, this.connectToListView);
    }

    componentDidMount() {
        const filterNode = findDOMNode(this).parentNode as HTMLElement;
        const targetNode = Utils.findTargetNode(filterNode);
        DataSourceHelper.hideContent(targetNode);
    }

    render() {
        this.alertMessage = Utils.validate({
            ...this.props as ContainerProps,
            filterNode: this.state.targetNode,
            targetListView: this.state.targetListView,
            validate: !this.state.listviewAvailable
        }) || this.alertMessage || "";

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
        return createElement(Alert, {
            bootstrapStyle: "danger",
            className: "widget-drop-down-filter-alert",
            message: this.alertMessage
        });
    }

    private renderDropDownFilter(): ReactElement<DropDownFilterProps> {
        if (!this.alertMessage) {
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

    private applyFilter(selectedFilter: FilterProps) {
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
        let errorMessage = "";

        if (targetNode) {
            targetListView = dijitRegistry.byNode(targetNode);
            if (targetListView) {
                try {
                    this.dataSourceHelper = new DataSourceHelper(targetNode, targetListView, this.props.friendlyId, DataSourceHelper.VERSION);
                } catch (error) {
                    errorMessage = error.message;
                }
                const validationMessage = Utils.validate({
                    ...this.props as ContainerProps,
                    filterNode: targetNode,
                    targetListView,
                    validate: true
                });

                this.setState({
                    alertMessage: validationMessage || errorMessage,
                    listviewAvailable: !!targetListView,
                    targetListView,
                    targetNode
                });
            }
        }
    }
}
