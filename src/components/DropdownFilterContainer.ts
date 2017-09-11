import { Component, ReactElement, createElement } from "react";
import { findDOMNode } from "react-dom";
import * as classNames from "classnames";
import * as dijitRegistry from "dijit/registry";
import * as dojoConnect from "dojo/_base/connect";
import * as dojoLang from "dojo/_base/lang";

import { DropdownFilter, DropdownFilterProps } from "./DropdownFilter";
import { DropdownFilterContainerProps, DropdownFilterState, HybridConstraint, ListView, filterOptions, parseStyle } from "../utils/ContainerUtils";
import { ValidateConfigs } from "./ValidateConfigs";

// import { Alert } from "../components/Alert";
import { ValidateConfigs } from "./ValidateConfigs";

export interface DropdownFilterContainerProps {
    friendlyId: string;
    entity: string;
    mxform: mxui.lib.form._FormBase;
    targetListViewName: string;
    filters: FilterProps[];
}

export interface FilterProps {
    caption: string;
    filterBy: filterOptions;
    attribute: string;
    value: string;
    constraint: string;
}

export type filterOptions = "attribute" | "XPath";
type HybridConstraint = Array<{ attribute: string; operator: string; value: string; path?: string; }>;

export interface ListView extends mxui.widget._WidgetBase {
    _datasource: {
        _constraints: HybridConstraint | string;
        _entity: string;
    };
    filter: {
        [key: string ]: HybridConstraint | string;
    };
    update: () => void;
}

export interface DropdownFilterState {
    widgetAvailable: boolean;
    targetListView?: ListView;
    targetNode?: HTMLElement;
    validationPassed?: boolean;
    value?: string;
}

export default class DropdownFilterContainer extends Component<DropdownFilterContainerProps, DropdownFilterState> {

    private emptyFilter: FilterProps;
    constructor(props: DropdownFilterContainerProps) {
        super(props);

        this.state = { widgetAvailable: true };
        this.handleChange = this.handleChange.bind(this);
        this.emptyFilter = {
            attribute: "",
            caption: "",
            constraint: "",
            filterBy: "attribute",
            value: ""
        };
        // Ensures that the listView is connected so the widget doesn't break in mobile due to unpredictable render time
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

    private handleChange(value: string) {
        const { targetListView } = this.state;
        const selectedFilter = this.props.filters.filter((filter) => filter.caption === value)[0];

        if (targetListView && targetListView._datasource) {
            const { attribute, filterBy, constraint } = selectedFilter || this.emptyFilter;
            if (filterBy === "XPath") {
                targetListView.filter[this.props.friendlyId] = constraint;
            } else if (value) {
                targetListView.filter[this.props.friendlyId] = `[contains(${attribute},'${value}')]`;
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
        const targetNode = ValidateConfigs.findTargetNode(this.props, filterNode);
        let targetListView: ListView | null = null;

        if (targetNode) {
            this.setState({ targetNode });
            targetListView = dijitRegistry.byNode(targetNode);
            if (targetListView) {
                targetListView.filter = {};
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
