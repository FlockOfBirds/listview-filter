import { ChangeEvent, Component, OptionHTMLAttributes, ReactElement, createElement } from "react";

import { FilterProps } from "./DropdownFilterContainer";
import "./ui/DropdownFilter.css";

export interface DropdownFilterProps {
    defaultFilter: number;
    className?: string;
    filters: FilterProps[];
    handleChange: (FilterProps) => void;
    style?: {[key: string]: string; };
}

interface DropdownFilterState {
    selectedValue: string;
}
// added to deal with typings issue of componentClass
// needing to pass a className attribute on select options
export interface DropdownType extends OptionHTMLAttributes<HTMLOptionElement> {
    value: string;
    label: string;
}
type Display = FilterProps & DropdownFilterState;

export class DropdownFilter extends Component<DropdownFilterProps, DropdownFilterState> {
    // remap prop filters to dropdownfilters
    private filters: Display[];

    constructor(props: DropdownFilterProps) {
        super(props);
        // because select is a controlled component which has its own state
        this.state = { selectedValue: `${this.props.defaultFilter}` };
        this.handleOnChange = this.handleOnChange.bind(this);
    }

    render() {
        this.filters = this.applyEmptyFilter(this.props.filters);
        return createElement("select", {
            className: "form-control",
            onChange: this.handleOnChange,
            value: this.state.selectedValue
        }, this.createOptions());
    }

    componentDidMount() {
        // initial state has selectedValue as defaultFilter's index
        const selectedFilter = this.filters.find(filter => filter.selectedValue === this.state.selectedValue);
        this.props.handleChange(selectedFilter as FilterProps);
    }

    componentDidUpdate(_prevProps: DropdownFilterProps, prevState: DropdownFilterState) {
        if (prevState.selectedValue !== this.state.selectedValue) {
            const selectedFilter = this.filters.find(filter => filter.selectedValue === this.state.selectedValue);
            this.props.handleChange(selectedFilter as FilterProps);
        }
    }

    private createOptions(): Array<ReactElement<{}>> {
        const options: Array<ReactElement<{}>> = this.filters.map((option, index) => {
            const optionAttributes: DropdownType = {
                // placeholder option is at index 0
                disabled: (index === 0) ? true : undefined,
                label: option.caption,
                value: option.selectedValue
            };
            return createElement("option", optionAttributes);
        });
        return options;
    }

    private applyEmptyFilter(filters: FilterProps[]): Display[] {
        const returnFilters: Display[] = [];
        // Select...
        returnFilters.push({
            attribute: "",
            attributeValue: "",
            caption: "Select...",
            constraint: "",
            filterBy: "attribute",
            selectedValue: "0"
        });

        // empty
        returnFilters.push({
            attribute: "",
            attributeValue: "",
            caption: "",
            constraint: "",
            filterBy: "attribute",
            selectedValue: "0"
        });
        // remap prop filters to dropdownfilters
        filters.forEach((filter, index) => {
            returnFilters.push({
                ...filter,
                selectedValue: `${index + 1}`
            });
        });
        return returnFilters;
    }

    private handleOnChange(event: ChangeEvent<HTMLSelectElement>) {
        // event.currentTarget.value
        this.setState({
            selectedValue: event.currentTarget.value
        });
    }
}
