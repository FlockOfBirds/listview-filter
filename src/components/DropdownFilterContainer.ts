import { Component, ReactElement, createElement } from "react";
import { findDOMNode } from "react-dom";
import * as classNames from "classnames";
import * as dijitRegistry from "dijit/registry";
import * as dojoConnect from "dojo/_base/connect";
import * as dojoLang from "dojo/_base/lang";

import { Alert } from "./Alert";
import { DropdownFilter, DropdownFilterProps } from "./DropdownFilter";
import { Utils, parseStyle } from "../utils/ContainerUtils";

interface WrapperProps {
    class: string;
    style: string;
    friendlyId: string;
    mxform?: mxui.lib.form._FormBase;
}

export interface ContainerProps extends WrapperProps {
    enableEmptyFilter: boolean;
    entity: string;
    filters: FilterProps[];
    placeholder: string;
}

export interface FilterProps {
    caption: string;
    filterBy: filterOptions;
    attribute: string;
    attributeValue: string;
    constraint: string;
    isDefault: boolean;
}

export type filterOptions = "attribute" | "XPath";
type HybridConstraint = Array<{ attribute: string; operator: string; value: string; path?: string; }>;

export interface ListView extends mxui.widget._WidgetBase {
    _datasource: {
        _constraints: HybridConstraint | string;
    };
    filter: {
        [key: string ]: HybridConstraint | string;
    };
    update: () => void;
    _entity: string;
}

export interface ContainerState {
    listviewAvailable: boolean;
    targetListView?: ListView;
    targetNode?: HTMLElement;
    validationPassed?: boolean;
}

export default class DropdownFilterContainer extends Component<ContainerProps, ContainerState> {

    constructor(props: ContainerProps) {
        super(props);

        this.state = { listviewAvailable: true };
        this.handleChange = this.handleChange.bind(this);
        // Ensures that the listView is connected so the widget doesn't break in mobile due to unpredictable render time
        dojoConnect.connect(props.mxform, "onNavigation", this, dojoLang.hitch(this, this.connectToListView));
    }

    render() {
        return createElement("div",
            {
                className: classNames("widget-dropdown-filter", this.props.class),
                style: parseStyle(this.props.style)
            },
            this.renderAlert(),
            this.renderDropdownFilter()
        );
    }

    private renderAlert() {
        const errorMessage = Utils.validate({
            ...this.props as ContainerProps,
            filterNode: this.state.targetNode,
            filters: this.props.filters,
            targetListView: this.state.targetListView,
            validate: !this.state.listviewAvailable
        });

        return createElement(Alert, {
            bootstrapStyle: "danger",
            className: "widget-dropdown-filter-alert",
            message: errorMessage ? errorMessage : null
        });
    }

    private renderDropdownFilter(): ReactElement<DropdownFilterProps> {
        if (this.state.validationPassed) {
            const { filters } = this.props;
            const defaultFilterIndex = filters.indexOf(filters.filter(value => value.isDefault)[0]);

            return createElement(DropdownFilter, {
                defaultFilterIndex,
                enableEmptyFilter: this.props.enableEmptyFilter,
                filters: this.props.filters,
                handleChange: this.handleChange,
                placeholder: this.props.placeholder
            });
        }

        return null;
    }

    private handleChange(selectedFilter: FilterProps) {
        const { targetListView } = this.state;
        // To support multiple filters. We attach each dropdown-filter-widget's selected constraint
        // On the listView's custom 'filter' object.
        if (targetListView && targetListView._datasource) {
            const { attribute, filterBy, constraint, attributeValue } = selectedFilter;
            if (filterBy === "XPath") {
                targetListView.filter[this.props.friendlyId] = constraint;
            } else if (attributeValue) {
                targetListView.filter[this.props.friendlyId] = `[contains(${attribute},'${attributeValue}')]`;
            } else {
                targetListView.filter[this.props.friendlyId] = "";
            }

            // Combine multiple-filter constraints into one and apply it to the listview
            const finalContraint = Object.keys(targetListView.filter)
                .map(key => targetListView.filter[key])
                .join("");
            targetListView._datasource._constraints = finalContraint;
            targetListView.update();
        }
    }

    private connectToListView() {
        const filterNode = findDOMNode(this).parentNode as HTMLElement;
        const targetNode = Utils.findTargetNode(filterNode);
        let targetListView: ListView | null = null;

        if (targetNode) {
            this.setState({ targetNode });
            targetListView = dijitRegistry.byNode(targetNode);
            if (targetListView) {
                targetListView.filter = {};
                this.setState({ targetListView });
            }
        }
        const validateMessage = Utils.validate({
            ...this.props as ContainerProps,
            filterNode: targetNode,
            targetListView,
            validate: true
        });
        this.setState({ listviewAvailable: false, validationPassed: !validateMessage });
    }
}
