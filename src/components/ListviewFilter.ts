import { Component, createElement } from "react";
import { findDOMNode } from "react-dom";
import * as dijitRegistry from "dijit/registry";

import { Alert } from "./Alert";
import { ValidateConfigs } from "./ValidateConfigs";
import { HybridConstraint, ListView, ListviewFilterProps, ListviewFilterState } from "../utils/ContainerUtils";
import "../ui/ListviewFilter.css";

export default class ListviewFilter extends Component<ListviewFilterProps, ListviewFilterState> {
    private searchButton: HTMLButtonElement;
    private searchInput: HTMLInputElement;
    private targetWidget: ListView;

    constructor(props: ListviewFilterProps) {
        super(props);

        this.state = {
            alertMessage: "",
            buttonVisibility: "hidden",
            findingWidget: true
        };
        this.updateConstraints = this.updateConstraints.bind(this);
    }

    render() {
        return (
            createElement("div", { className: "widget-listview-filter" },
                createElement(Alert, { bootstrapStyle: "danger", className: "danger", message: this.state.alertMessage }),
                this.props.showSearchBar
                    ?
                    createElement("div", { className: "search-container" },
                        createElement("span", { className: "glyphicon glyphicon-filter" }),
                        createElement("input", {
                            className: "form-control", placeholder: "Search",
                            ref: input => this.searchInput = input as HTMLInputElement
                        }),
                        createElement("button", {
                            className: `btn-transparent ${this.state.buttonVisibility}`,
                            ref: button => this.searchButton = button as HTMLButtonElement
                        },
                            createElement("span", { className: "glyphicon glyphicon-remove" })
                        )
                    )
                    : createElement("div", { className: "search-container-hidden" })
            )
        );
    }

    componentDidMount() {
        const queryNode = findDOMNode(this).parentNode as HTMLElement;
        const targetNode = ValidateConfigs.findTargetNode(this.props, queryNode);
        let targetGrid: ListView | null = null;

        if (targetNode) {
            this.setState({ targetNode });
            targetGrid = dijitRegistry.byNode(targetNode);
            if (targetGrid) {
                this.setState({ targetGrid });
            }
        }
        const validateMessage = ValidateConfigs.validate({
            ...this.props as ListviewFilterProps,
            queryNode: targetNode,
            targetGrid,
            targetGridName: this.props.targetGridName,
            validate: true
        });
        this.setState({ findingWidget: false, validationPassed: !validateMessage });
    }

    componentWillUnmount() {
        if (this.props.showSearchBar) {
            this.searchButton.removeEventListener("click", this.onClear);
            this.searchInput.removeEventListener("keyup", this.onSearchKeyDown);
        }
    }

    private updateConstraints(self: ListviewFilter) {
        if (this.state.targetGrid && this.state.targetGrid._datasource && this.state.validationPassed) {
            const datasource = self.targetWidget._datasource;
            if (window.device) {
                const constraints: HybridConstraint = [];
                self.props.searchAttributes.forEach(searchAttribute => {
                    if (this.props.searchEntity) {
                        constraints.push({
                            attribute: searchAttribute.name,
                            operator: self.props.searchMethod,
                            path: self.props.searchEntity,
                            value: self.searchInput.value
                        });
                    } else {
                        constraints.push({
                            attribute: searchAttribute.name,
                            operator: self.props.searchMethod,
                            value: self.searchInput.value
                        });
                    }
                });
                self.searchInput.value.trim() ? datasource._constraints = constraints : datasource._constraints = [];
            } else {
                const constraints: string[] = [];
                self.props.searchAttributes.forEach(searchAttribute => {
                    this.props.searchEntity
                        ?
                        constraints.push(`${self.props.searchEntity}
                            [${self.props.searchMethod}(${searchAttribute.name},'${self.searchInput.value}')]`
                        )
                        :
                        constraints.push(
                            `${self.props.searchMethod}(${searchAttribute.name},'${self.searchInput.value}')`
                        );
                });
                self.searchInput.value.trim()
                    ? datasource._constraints = "[" + constraints.join(" or ") + "]" : datasource._constraints = "";
            }

            this.state.targetGrid.update();
        }
    }

    private updateButtonVisibility() {
        if (this.searchInput.value.trim()) {
            this.setState({ buttonVisibility: "visible" });
        } else {
            this.setState({ buttonVisibility: "hidden" });
        }
    }

    private onSearchKeyDown() {
        this.updateButtonVisibility();
        const searchTimeout = setTimeout(this.updateConstraints(this), 500);
        clearTimeout(searchTimeout);
    }

    private onClear() {
        this.searchInput.value = "";
        this.updateButtonVisibility();
        this.updateConstraints(this);
    }
}
