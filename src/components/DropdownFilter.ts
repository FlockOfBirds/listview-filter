import { ChangeEvent, Component, OptionHTMLAttributes, ReactElement, createElement } from "react";

import { FilterProps, filterOptions } from "./DropdownFilterContainer";

export interface DropdownFilterProps {
    handleChange: (value: string, attribute: string, filterBy: filterOptions, constraint: string, filterMethod: string) => void;
    filters: FilterProps[];
}

interface DropdownFilterState {
    value: string;
    constraint: string;
    filter: string;
    filterBy: filterOptions;
    attributeName: string;
}

interface DropdownType extends OptionHTMLAttributes<HTMLOptionElement> {
    "data-filterBy": string;
    "data-attribute": string;
    "data-constraint": string;
}

export class DropdownFilter extends Component<DropdownFilterProps, DropdownFilterState> {
    constructor(props: DropdownFilterProps) {
        super(props);

        this.state = { value: "", constraint: "", filterBy: "attribute", attributeName: "", filter: "" };
        this.handleOnChange = this.handleOnChange.bind(this);
    }

    render() {
        return createElement("div", { className: "widget-dropdown-filter" },
            createElement("select", {
                className: "form-control",
                onChange: this.handleOnChange
            }, this.createOptions())
        );
    }

    componentDidUpdate(_prevProps: DropdownFilterProps, _prevState: DropdownFilterState) {
        this.props.handleChange(this.state.value, this.state.attributeName, this.state.filterBy, this.state.constraint, this.state.filter);
    }

    private createOptions(): Array<ReactElement<{}>> {
        const optionElements: Array<ReactElement<{}>> = [];
        optionElements.push(createElement("option", {
            className: "",
            label: "",
            value: ""
        }));
        this.props.filters.map((optionObject) => {
            const { value, caption, attribute, filterBy, constraint } = optionObject;
            const optionValue: DropdownType = {
                "data-attribute": attribute,
                "data-constraint": constraint,
                "data-filterBy": filterBy,
                "label": caption,
                value
            };
            optionElements.push(createElement("option", optionValue));
        });
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
