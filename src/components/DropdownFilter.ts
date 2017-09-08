import * as classNames from "classnames";
import { ChangeEvent, Component, ReactElement, createElement } from "react";

import { DropdownType, FilterProps, filterOptions } from "../utils/ContainerUtils";

export interface DropdownFilterProps {
    className: string;
    handleChange?: (value: string, attribute: string, filterBy: filterOptions, constraint: string) => void;
    filters?: FilterProps[];
    style?: object;
}

interface DropdownFilterState {
    value: string;
    constraint: string;
    filter: string;
    filterBy: filterOptions;
    attributeName: string;
}

export class DropdownFilter extends Component<DropdownFilterProps, DropdownFilterState> {
    private defaultAttribute: string;
    private defaultComparison: filterOptions;
    private defaultConstraint: string;
    private defaultValue: string;

    constructor(props: DropdownFilterProps) {
        super(props);

        this.state = { value: "", constraint: "", filterBy: "attribute", attributeName: "", filter: "" };
        this.handleOnChange = this.handleOnChange.bind(this);
    }

    render() {
        return createElement("div", {
            className: classNames("widget-dropdown-filter", this.props.className),
            style: this.props.style
        },
            createElement("select", {
                className: "form-control",
                onChange: this.handleOnChange
            }, this.createOptions())
        );
    }

    componentDidMount() {
        this.props.handleChange(this.defaultAttribute, this.defaultConstraint, this.defaultComparison, this.defaultValue);
        this.setState({
            attributeName: this.defaultAttribute,
            constraint: this.defaultConstraint,
            filterBy: this.defaultComparison,
            value: this.defaultValue
        });
    }

    componentDidUpdate(_prevProps: DropdownFilterProps, _prevState: DropdownFilterState) {
        this.props.handleChange(this.state.value, this.state.attributeName, this.state.filterBy, this.state.constraint);
    }

    private createOptions(): Array<ReactElement<{}>> {
        let foundDefaultFilterOption;
        const optionElements: Array<ReactElement<{}>> = [];
        optionElements.push(createElement("option", {
            className: "",
            label: "",
            value: ""
        }));
        this.props.filters.map((optionObject) => {
            const { value, caption, attribute, filterBy, constraint, isDefaultOption } = optionObject;
            const optionValue: DropdownType = {
                "data-attribute": attribute,
                "data-constraint": constraint,
                "data-filterBy": filterBy,
                "label": caption,
                "selected": isDefaultOption && !foundDefaultFilterOption,
                value
            };
            if (isDefaultOption) {
                foundDefaultFilterOption = true;
                this.defaultAttribute = attribute;
                this.defaultValue = value;
                this.defaultComparison = filterBy;
                this.defaultConstraint = constraint;
            }
            optionElements.push(createElement("option", optionValue));
        });
        if (!foundDefaultFilterOption && this.props.filters.length > 0) {
            this.defaultAttribute = this.props.filters[0].attribute;
            this.defaultComparison = this.props.filters[0].filterBy;
            this.defaultConstraint = this.props.filters[0].constraint;
            this.defaultValue = this.props.filters[0].value;
        }
        return optionElements;
    }

    private handleOnChange(event: ChangeEvent<HTMLSelectElement>) {
        this.setState({
            attributeName: event.currentTarget.selectedOptions[0].getAttribute("data-attribute"),
            constraint: event.currentTarget.selectedOptions[0].getAttribute("data-constraint"),
            filterBy: event.currentTarget.selectedOptions[0].getAttribute("data-filterBy") as filterOptions,
            value: event.currentTarget.value
        });
    }
}
