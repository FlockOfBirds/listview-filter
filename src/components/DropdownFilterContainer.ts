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
    targetGridName: string;
    values: ValueProps[];
}

export interface ValueProps {
    caption: string;
    comparison: comparisonOptions;
    attribute: string;
    value: string;
    constraint: string;
    filterMethod: filterMethodOptions;
}

type filterMethodOptions = "equals" | "contains";
export type comparisonOptions = "static" | "XPath";
type HybridConstraint = Array<{ attribute: string; operator: string; value: string; path?: string; }>;

export interface ListView extends mxui.widget._WidgetBase {
    datasource: {
        xpathConstraints: string;
    };
    _datasource: {
        _constraints: HybridConstraint | string;
        _entity: string;
        _setSize: number;
        atEnd: () => boolean;
        _pageSize: number;
    };
    _loadMore: () => void;
    _onLoad: () => void;
    _renderData: () => void;
    update: () => void;
}

interface DropdownFilterState {
    findingWidget: boolean;
    targetGrid?: ListView;
    targetNode?: HTMLElement;
    validationPassed?: boolean;
}

export default class DropdownFilterContainer extends Component<DropdownFilterContainerProps, DropdownFilterState> {

    constructor(props: DropdownFilterContainerProps) {
        super(props);

        this.state = { findingWidget: true };
        this.handleChange = this.handleChange.bind(this);
        dojoConnect.connect(props.mxform, "onNavigation", this, dojoLang.hitch(this, this.initDropdownFilter));
    }

    render() {
        return createElement("div",
            {
                className: classNames("widget-dropdown-filter")
            },
            createElement(ValidateConfigs, {
                ...this.props as DropdownFilterContainerProps,
                filterNode: this.state.targetNode,
                targetGrid: this.state.targetGrid,
                targetGridName: this.props.targetGridName,
                validate: !this.state.findingWidget,
                values: this.props.values
            }),
            this.renderDropdownFilter()
        );
    }

    private handleChange(value: string, attribute: string, comparison: comparisonOptions, constraint: string, filterMethod: string) {
        if (comparison === "static") {
            this.updateByConstraint(value, attribute, filterMethod);
        } else {
            this.updateByXpath(constraint);
        }
    }

    private updateByXpath(constraint: string) {
        this.state.targetGrid.datasource.xpathConstraints = constraint;
    }

    private updateByConstraint(value: string, attribute: string, filterMethod: string) {
        const constraints: HybridConstraint = [];
        if (this.state.targetGrid && this.state.targetGrid._datasource) {
            const datasource = this.state.targetGrid._datasource;
            if (window.device) {
                constraints.push({
                    attribute,
                    operator: filterMethod,
                    path: this.props.entity,
                    value
                });
                datasource._constraints = value ? constraints : [];
            } else {
                let constraint: HybridConstraint | string = [];
                constraint = `${filterMethod}(${attribute},'${value}')`;
                datasource._constraints = value ? "[" + constraint + "]" : "";
            }
            this.state.targetGrid.update();
        }
    }

    private renderDropdownFilter(): ReactElement<DropdownFilterProps> {
        if (this.state.validationPassed) {
            return createElement(DropdownFilter, {
                handleChange: this.handleChange,
                values: this.props.values
            });
        }

        return null;
    }

    private initDropdownFilter() {
        const filterNode = findDOMNode(this).parentNode as HTMLElement;
        const targetNode = ValidateConfigs.findTargetNode(this.props, filterNode);
        let targetGrid: ListView | null = null;

        if (targetNode) {
            this.setState({ targetNode });
            targetGrid = dijitRegistry.byNode(targetNode);
            if (targetGrid) {
                this.setState({ targetGrid });
            }
        }
        const validateMessage = ValidateConfigs.validate({
            ...this.props as DropdownFilterContainerProps,
            filterNode: targetNode,
            targetGrid,
            targetGridName: this.props.targetGridName,
            validate: true
        });
        this.setState({ findingWidget: false, validationPassed: !validateMessage });
    }
}
