import { Component, ReactElement, createElement } from "react";
import { findDOMNode } from "react-dom";
import * as classNames from "classnames";
import { Alert } from "./components/Alert";

import { DropdownFilter, DropdownFilterProps } from "./components/DropdownFilter";
import { ContainerProps, ContainerState } from "./components/DropdownFilterContainer";
import { Utils, parseStyle } from "./utils/ContainerUtils";

// tslint:disable-next-line class-name
export class preview extends Component<ContainerProps, ContainerState> {
    constructor(props: ContainerProps) {
        super(props);

        this.state = { listviewAvailable: true };
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

    componentDidMount() {
        this.validateConfigs();
    }

    componentWillReceiveProps(_newProps: ContainerProps) {
        this.validateConfigs();
    }

    private validateConfigs() {
        // validate filter values if filterby is attribute, then value should not be empty or "" or " ".
        const routeNode = findDOMNode(this) as HTMLElement;
        const targetNode = Utils.findTargetNode(routeNode);

        if (targetNode) {
            this.setState({ targetNode });
        }
        this.setState({ listviewAvailable: true });
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
        const defaultFilterIndex = this.props.filters.findIndex(filter => filter.isDefaultFilter);

        return createElement(DropdownFilter, {
            defaultFilterIndex,
            enableEmptyFilter: this.props.enableEmptyFilter,
            filters: this.props.filters,
            handleChange: () => { return; },
            placeholder: this.props.placeholder
        });
    }
}

export function getPreviewCss() {
    return require("./components/ui/DropdownFilter.css");
}

export function getVisibleProperties(valueMap: ContainerProps, visibilityMap: any) {
    valueMap.filters.forEach(filterAttribute => {
        if (filterAttribute.filterBy === "attribute") {
            visibilityMap.filters.attribute = true;
            visibilityMap.filters.filterBy = true;
            visibilityMap.filters.value = true;
            visibilityMap.filters.constraint = false;
        } else if (filterAttribute.filterBy === "XPath") {
            visibilityMap.filters.attribute = false;
            visibilityMap.filters.filterBy = false;
            visibilityMap.filters.value = false;
            visibilityMap.filters.constraint = true;
        }
    });

    return visibilityMap;
}
