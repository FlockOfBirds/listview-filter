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
    defaultFilter: number;
    entity: string;
    targetListViewName: string;
    filters: FilterProps[];
}

export interface FilterProps {
    caption: string;
    filterBy: filterOptions;
    attribute: string;
    attributeValue: string;
    constraint: string;
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

export interface DropdownFilterState {
    widgetAvailable: boolean;
    targetListView?: ListView;
    targetNode?: HTMLElement;
    validationPassed?: boolean;
    value?: string;
}

export default class DropdownFilterContainer extends Component<ContainerProps, DropdownFilterState> {

    constructor(props: ContainerProps) {
        super(props);

        this.state = { widgetAvailable: true };
        this.handleChange = this.handleChange.bind(this);
        // Ensures that the listView is connected so the widget doesn't break in mobile due to unpredictable render time
        dojoConnect.connect(props.mxform, "onNavigation", this, dojoLang.hitch(this, this.connectToListView));
    }

    render() {
        // validate filter values if filterby = attribute, then value should not be empty or "" or " ".
        return createElement("div",
            {
                className: classNames("widget-dropdown-filter")
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
            targetListViewName: this.props.targetListViewName,
            validate: !this.state.widgetAvailable
        });

        return createElement(Alert, {
            bootstrapStyle: "danger",
            className: "widget-dropdown-filter-alert",
            message: errorMessage ? errorMessage : null
        });
    }

    private renderDropdownFilter(): ReactElement<DropdownFilterProps> {
        if (this.state.validationPassed) {
            return createElement(DropdownFilter, {
                className: this.props.class,
                defaultFilter: this.props.defaultFilter,
                filters: this.props.filters,
                handleChange: this.handleChange,
                style: parseStyle(this.props.style)
            });
        }

        return null;
    }

    private handleChange(selectedFilter: FilterProps) {
        const { targetListView } = this.state;

        if (targetListView && targetListView._datasource) {
            const { attribute, filterBy, constraint, attributeValue } = selectedFilter;
            if (filterBy === "XPath") {
                targetListView.filter[this.props.friendlyId] = constraint;
            } else if (attributeValue) {
                targetListView.filter[this.props.friendlyId] = `[contains(${attribute},'${attributeValue}')]`;
            } else {
                targetListView.filter[this.props.friendlyId] = "";
            }

            const finalContraint = Object.keys(targetListView.filter)
                .map(key => targetListView.filter[key])
                .join("");
            targetListView._datasource._constraints = finalContraint;
            targetListView.update();
        }
    }

    private connectToListView() {
        const filterNode = findDOMNode(this).parentNode as HTMLElement;
        const targetNode = Utils.findTargetNode(this.props, filterNode);
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
        this.setState({ widgetAvailable: false, validationPassed: !validateMessage });
    }

    // private validateProps(props: ContainerProps & { filterNode: HTMLElement; targetListView: ListView; validate: boolean }) {
    //     const widgetName = "DropdownFilter";
    //     if (!props.filterNode) {
    //         return `${widgetName}: unable to find a listview with to attach to`;
    //     }

    //     if (!(props.targetListView && props.targetListView._datasource)) {
    //         return `${widgetName}: this Mendix version is incompatible`;
    //     }

    //     if (props.entity && !ValidateConfigs.itContains(props.entity, "/")) {
    //         if (props.entity !== props.targetListView._datasource._entity) {
    //             return `${widgetName}: supplied entity "${props.entity}" does not belong to list view data source`;
    //         }
    //     }

    //     if (props.filters && props.filters.length) {
    //         return `${widgetName}: should have atleast one filter`;
    //     }

    //     if (props.filters) {
    //         const errorMessage: string[] = [];
    //         props.filters.forEach((filter, index) => {
    //             if (filter.filterBy === "XPath" && !filter.constraint) {
    //                 errorMessage.push(`Filter position: {${index + 1 }} is missing XPath constraint`);
    //             }
    //             if (filter.filterBy === "attribute" && !filter.attributeValue) {
    //                 errorMessage.push(`Filter position: {${index + 1 }} is missing a Value constraint`);
    //             }
    //         });
    //         if (errorMessage.length) {
    //             return `${widgetName} : ${errorMessage.join(", ")}`;
    //         }
    //     }

    //     if (!isNaN(props.defaultFilter) && props.defaultFilter >= 0 && props.defaultFilter > props.filters.length) {
    //         return `${widgetName}: Default value must be a number not more number of filters`;
    //     }

    //     return "";
    // }
}
