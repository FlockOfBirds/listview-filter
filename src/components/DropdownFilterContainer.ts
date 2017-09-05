import { Component, ReactElement, createElement } from "react";
import { findDOMNode } from "react-dom";
import * as dijitRegistry from "dijit/registry";
import * as classNames from "classnames";
import * as dojoLang from "dojo/_base/lang";
import * as dojoConnect from "dojo/_base/connect";

import { DropdownFilter, DropdownFilterProps } from "./DropdownFilter";
import { ValidateConfigs } from "./ValidateConfigs";

export interface DropdownFilterContainerProps {
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
    datasource: {
        xpathConstraints: string;
    };
    _datasource: {
        _constraints: HybridConstraint | string;
        _entity: string;
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

    constructor(props: DropdownFilterContainerProps) {
        super(props);

        this.state = { widgetAvailable: true };
        this.handleChange = this.handleChange.bind(this);
        dojoConnect.connect(props.mxform, "onNavigation", this, dojoLang.hitch(this, this.connectToListView));
    }

    render() {
        // validate filter values if filterby is attribute, then value should not be empty or "" or " ".
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
                filters: this.props.filters,
                handleChange: this.handleChange
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
