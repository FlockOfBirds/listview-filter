import { ChangeEvent, Component, OptionHTMLAttributes, ReactElement, createElement } from "react";

import { FilterProps } from "./DropdownFilterContainer";
import "./ui/DropdownFilter.scss";

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
            selectedValue : props.defaultFilterIndex < 0 ? "1" : `${props.defaultFilterIndex + 1}`
        };
        this.handleOnChange = this.handleOnChange.bind(this);
    }

    render() {
        this.filters = this.applyFilter(this.props.filters);
        return createElement("select",
            {
                className: "form-control",
                onChange: this.handleOnChange,
                value: this.state.selectedValue
            },
            this.createOptions()
        );
    }

    componentDidMount() {
        // initial state has selectedValue as defaultFilter's index
        const selectedFilter = this.filters.find(filter => filter.selectedValue === this.state.selectedValue);
        this.props.handleChange(selectedFilter);
    }

    componentDidUpdate(_prevProps: DropdownFilterProps, prevState: DropdownFilterState) {
        if (prevState.selectedValue !== this.state.selectedValue) {
            const selectedFilter = this.filters.find(filter => filter.selectedValue === this.state.selectedValue);
            this.props.handleChange(selectedFilter);
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
