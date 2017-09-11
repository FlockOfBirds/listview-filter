import * as classNames from "classnames";
import { ChangeEvent, Component, ReactElement, createElement } from "react";

import { DropdownType, FilterProps, filterOptions } from "../utils/ContainerUtils";

import { FilterProps } from "./DropdownFilterContainer";

export interface DropdownFilterProps {
    handleChange: (value: string) => void;
    filters: FilterProps[];
}

interface DropdownFilterState {
    value: string;
}

interface DropdownType extends OptionHTMLAttributes<HTMLOptionElement> {
    "value": string;
    "label": string;
}

export class DropdownFilter extends Component<DropdownFilterProps, DropdownFilterState> {
    private defaultAttribute: string;
    private defaultComparison: filterOptions;
    private defaultConstraint: string;
    private defaultValue: string;

    constructor(props: DropdownFilterProps) {
        super(props);
        // because select is a controlled component which has its own state
        this.state = { value: "" };
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

    componentDidUpdate(_prevProps: DropdownFilterProps, prevState: DropdownFilterState) {
        if (prevState.value !== this.state.value) {
            this.props.handleChange(this.state.value);
        }
    }

    private createOptions(): Array<ReactElement<{}>> {
        const options: Array<ReactElement<{}>> = [];
        let optionAttributes: DropdownType = {
            label: "",
            value: ""
        };

        options.push(createElement("option", optionAttributes));

        this.props.filters.forEach(option => {
            optionAttributes = {
                label: option.caption,
                value: option.caption
            };
            options.push(createElement("option", optionAttributes));
        });
        return options;
    }

    private handleOnChange(event: ChangeEvent<HTMLSelectElement>) {
        this.setState({
            value: event.currentTarget.value
        });
    }
}
