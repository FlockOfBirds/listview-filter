import { Component, createElement } from "react";
import { findDOMNode } from "react-dom";

import { DropdownFilter } from "./components/DropdownFilter";
import { DropdownFilterContainerProps, DropdownFilterState } from "./components/DropdownFilterContainer";
import { ValidateConfigs } from "./components/ValidateConfigs";

// tslint:disable-next-line class-name
export class preview extends Component<DropdownFilterContainerProps, DropdownFilterState> {
    constructor(props: DropdownFilterContainerProps) {
        super(props);

        this.state = { widgetAvailable: true };
    }

    render() {
        return createElement("div", { className: "widget-offline-search" },
            createElement(ValidateConfigs, {
                ...this.props as DropdownFilterContainerProps,
                filterNode: this.state.targetNode,
                filters: this.props.filters,
                targetGridName: this.props.targetGridName,
                targetListView: this.state.targetListView,
                validate: !this.state.widgetAvailable
            }),
            createElement(DropdownFilter, {
                filters: this.props.filters,
                handleChange: () => { return; }
            })
        );
    }

    componentDidMount() {
        this.validateConfigs(this.props);
    }

    componentWillReceiveProps(newProps: DropdownFilterContainerProps) {
        this.validateConfigs(newProps);
    }

    private validateConfigs(props: DropdownFilterContainerProps) {
        const routeNode = findDOMNode(this) as HTMLElement;
        const targetNode = ValidateConfigs.findTargetNode(props, routeNode);

        if (targetNode) {
            this.setState({ targetNode });
        }
        this.setState({ widgetAvailable: true });
    }
}
