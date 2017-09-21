import { ChangeEvent, Component, OptionHTMLAttributes, ReactElement, createElement } from "react";

import { FilterProps } from "./DropdownFilterContainer";
import "./ui/DropdownFilter.css";

export interface DropdownFilterProps {
    defaultFilterIndex: number;
    filters: FilterProps[];
    handleChange: (FilterProps) => void;
}

interface DropdownFilterState {
    selectedValue: string;
}
// Added to deal with typings issue of componentClass, needing to pass a className attribute on select options
export interface DropdownType extends OptionHTMLAttributes<HTMLOptionElement> {
    key: string;
    value: string;
    label: string;
}

type Display = Partial<FilterProps> & DropdownFilterState;

export class DropdownFilter extends Component<DropdownFilterProps, DropdownFilterState> {
    // Remap prop filters to dropdownfilters
    private filters: Display[];

    constructor(props: DropdownFilterProps) {
        super(props);
        // Should have state because select is a controlled component
        this.state = {
            selectedValue : this.getSelectedIndex()
        };
        this.handleOnChange = this.handleOnChange.bind(this);
    }

    render() {
        this.filters = this.applyFilter(this.props.filters);
        return createElement("select", {
            className: "form-control",
            onChange: this.handleOnChange,
            value: this.state.selectedValue
        }, this.createOptions());
    }

    componentDidMount() {
        // initial state has selectedValue as defaultFilter's index
        const selectedValue = this.getSelectedIndex();
        const selectedFilter = this.filters.find(filter => filter.selectedValue === selectedValue);
        this.props.handleChange(selectedFilter as FilterProps);
    }

    componentDidUpdate(_prevProps: DropdownFilterProps, prevState: DropdownFilterState) {
        if (prevState.selectedValue !== this.state.selectedValue) {
            const selectedFilter = this.filters.find(filter => filter.selectedValue === this.state.selectedValue);
            this.props.handleChange(selectedFilter as FilterProps);
        }
    }

    private getSelectedIndex() {
        if (this.props.defaultFilterIndex < 0) {
            return "1";
        }
        if (this.props.defaultFilterIndex >= 0) {
            return `${this.props.defaultFilterIndex + 1}`;
        }
    }

    private createOptions(): ReactElement<{}>[] {
        return this.filters.map((option, index) => createElement("option", {
            className: "",
            key: index,
            label: option.caption,
            value: option.selectedValue
        }, option.caption));
    }

    private applyFilter(filters: FilterProps[]): Display[] {
        const returnFilters: Display[] = [];
        // Remap prop filters to dropdownfilters
        filters.forEach((filter, index) => {
            returnFilters.push({
                ...filter,
                selectedValue: `${index + 1}`
            });
        });
        return returnFilters;
    }

    private handleOnChange(event: ChangeEvent<HTMLSelectElement>) {
        this.setState({
            selectedValue: event.currentTarget.value
        });
    }
}
