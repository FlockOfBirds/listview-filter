import { Component, ReactElement, createElement } from "react";
import { findDOMNode } from "react-dom";
import * as classNames from "classnames";
import * as dijitRegistry from "dijit/registry";
import * as dojoConnect from "dojo/_base/connect";
import * as dojoLang from "dojo/_base/lang";

import { DropdownFilter, DropdownFilterProps } from "./DropdownFilter";
import { DropdownFilterContainerProps, DropdownFilterState, HybridConstraint, ListView, filterOptions, parseStyle } from "../utils/ContainerUtils";
import { ValidateConfigs } from "./ValidateConfigs";

export default class DropdownFilterContainer extends Component<DropdownFilterContainerProps, DropdownFilterState> {

    constructor(props: DropdownFilterContainerProps) {
        super(props);

        this.state = { widgetAvailable: true };
        this.handleChange = this.handleChange.bind(this);
        // Ensure that the listView is connected so the widget doesn't break in mobile due to unpredictable render time
        dojoConnect.connect(props.mxform, "onNavigation", this, dojoLang.hitch(this, this.connectToListView));
    }

    render() {
        // validate filter values if filterby = attribute, then value should not be empty or "" or " ".
        return createElement("div",
            {
                className: classNames("widget-dropdown-filter")
            },
            createElement(ValidateConfigs, {
                ...this.props as DropdownFilterContainerProps,
                filterNode: this.state.targetNode,
                filters: this.props.filters,
                targetListView: this.state.targetListView,
                targetListViewName: this.props.targetListViewName,
                validate: !this.state.widgetAvailable
            }),
            this.renderDropdownFilter()
        );
    }

    private renderDropdownFilter(): ReactElement<DropdownFilterProps> {
        if (this.state.validationPassed) {
            return createElement(DropdownFilter, {
                className: this.props.class,
                filters: this.props.filters,
                handleChange: this.handleChange,
                style: parseStyle(this.props.style)
            });
        }

        return null;
    }

    private handleChange(value: string, attribute: string, filterBy: filterOptions, constraint: string) {
        if (this.state.targetListView && this.state.targetListView._datasource) {
            let dataConstraint: HybridConstraint | string = [];

            if (window.device) {
                dataConstraint.push({
                    attribute,
                    operator: "contains",
                    path: this.props.entity,
                    value
                });
            } else {
                if (filterBy === "XPath") {
                    dataConstraint = constraint;
                } else if (value) {
                    dataConstraint = `[contains(${attribute},'${value}')]`;
                }
            }
            this.state.targetListView._datasource._constraints = dataConstraint;
            this.state.targetListView.update();
        }
    }

    private connectToListView() {
        const filterNode = findDOMNode(this).parentNode as HTMLElement;
        const targetNode = ValidateConfigs.findTargetNode(this.props, filterNode);
        let targetListView: ListView | null = null;

        if (targetNode) {
            this.setState({ targetNode });
            targetListView = dijitRegistry.byNode(targetNode);
            if (targetListView) {
                this.setState({ targetListView });
            }
        }
        const validateMessage = ValidateConfigs.validate({
            ...this.props as DropdownFilterContainerProps,
            filterNode: targetNode,
            targetListView,
            targetListViewName: this.props.targetListViewName,
            validate: true
        });
        this.setState({ widgetAvailable: false, validationPassed: !validateMessage });
    }
}
