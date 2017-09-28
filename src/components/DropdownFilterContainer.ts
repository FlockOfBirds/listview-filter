import { Component, ReactElement, createElement } from "react";
import { findDOMNode } from "react-dom";

import { Alert } from "./Alert";
import { DropdownFilter, DropdownFilterProps } from "./DropdownFilter";
import { Utils, parseStyle } from "../utils/ContainerUtils";

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
    };
    filter: {
        [key: string ]: HybridConstraint | string;
    };
    update: (obj: mendix.lib.MxObject | null, callback?: () => void) => void;
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
        this.connectToListView = this.connectToListView.bind(this);
        dojoConnect.connect(props.mxform, "onNavigation", this, this.connectToListView);
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
            targetListView: this.state.targetListView,
            validate: !this.state.listviewAvailable
        });

        return createElement(Alert, {
            bootstrapStyle: "danger",
            className: "widget-dropdown-filter-alert",
            message: errorMessage
        });
    }

    private renderDropdownFilter(): ReactElement<DropdownFilterProps> {
        if (this.state.validationPassed) {
            const defaultFilterIndex = this.props.filters.indexOf(this.props.filters.filter(value => value.isDefault)[0]);
            if (this.props.mxObject) {
            this.props.filters.forEach(filter => filter.constraint = filter.constraint.replace(`'[%CurrentObject%]'`,
                    this.props.mxObject.getGuid()
                ));
            }

            return createElement(DropdownFilter, {
                defaultFilterIndex,
                filters: this.props.filters,
                handleChange: this.handleChange
            });
        }

        return null;
    }

    private handleChange(selectedFilter: FilterProps) {
        const { targetListView, targetNode } = this.state;
        // To support multiple filters. We attach each dropdown-filter-widget's selected constraint
        // On the listView's custom 'filter' object.
        if (targetListView && targetListView._datasource && targetNode) {
            this.showLoader(targetNode);
            const { attribute, filterBy, constraint, attributeValue } = selectedFilter;
            if (filterBy === "XPath") {
                targetListView.filter[this.props.friendlyId] = constraint;
            } else if (filterBy === "attribute") {
                targetListView.filter[this.props.friendlyId] = `[contains(${attribute},'${attributeValue}')]`;
            } else {
                targetListView.filter[this.props.friendlyId] = "";
            }
            // Combine multiple-filter constraints into one and apply it to the listview
            const finalConstraint = Object.keys(targetListView.filter)
                .map(key => targetListView.filter[key])
                .join("");
            targetListView._datasource._constraints = finalConstraint;
            targetListView.update(null, () => {
                this.hideLoader(targetNode);
            });
        }
    }

    private showLoader(node?: HTMLElement) {
        if (node) {
            node.classList.add("widget-drop-down-filter-loading");
        }
    }

    private hideLoader(node?: HTMLElement) {
        if (node) {
            node.classList.remove("widget-drop-down-filter-loading");
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
