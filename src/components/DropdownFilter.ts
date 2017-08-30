import {
    ChangeEvent, Component, OptionHTMLAttributes, ReactElement, SelectHTMLAttributes, createElement
} from "react";
import * as classNames from "classNames";

import { filterSourceTypeOptions } from "./DropdownFilterContainer";
import "../ui/DropdownFilter.css";

interface DropdownFilterProps {
    caption: string;
    filterSourceType: filterSourceTypeOptions;
    handleChange: (value: string) => void;
    value: string;
    options: Array<{ filterOptionAttribute: string, filterOptionValue: string }>;
    updateConstraints: (query: string) => void;
}

interface DropdownFilterState {
    query: string;
    value: string;
}

export class DropdownFilter extends Component<DropdownFilterProps, DropdownFilterState> {

    constructor(props: DropdownFilterProps) {
        super(props);

        this.state = {
            query: "",
            value: ""
        };
        this.resetQuery = this.resetQuery.bind(this);
        this.handleStatic = this.handleStatic.bind(this);
        this.handleXPath = this.handleXPath.bind(this);
    }

    render() {
        const selectValue: SelectHTMLAttributes<HTMLSelectElement> = {
            className: classNames("dropdown-display"),
            disabled: this.props.filterSourceType === "static" ? true : false,
            onChange: this.props.filterSourceType === "static" ? this.handleStatic : this.handleXPath
        };
        return (
            createElement("label", { className: classNames("caption-display") }, this.props.caption,
                createElement("select", selectValue,
                    this.createOptions(this.props)
                ))
        );
    }

    componentDidMount() {
        this.setState({ query: this.props.value });
    }

    componentDidUpdate(_prevProps: DropdownFilterProps, prevState: DropdownFilterState) {
        if (this.state.query !== prevState.query) {
            setTimeout(() => {
                this.props.updateConstraints(this.state.query);
            });
        }

        if (this.state.value !== prevState.value) {
            setTimeout(() => {
                this.props.handleChange(this.state.value);
            });
        }
    }

    private resetQuery() {
        this.setState({ query: "", value: "" });
    }

    private createOptions(props: DropdownFilterProps): Array<ReactElement<{}>> {
        const optionElements: Array<ReactElement<{}>> = [];
        if (props.options.length) {
            props.options.map((optionObject) => {
                const { filterOptionValue } = optionObject;
                const optionValue: OptionHTMLAttributes<HTMLOptionElement> = {
                    className: "",
                    label: filterOptionValue,
                    value: filterOptionValue
                };
                optionElements.push(createElement("option", optionValue));
            });
        }
        return optionElements;
    }

    private handleStatic(event: ChangeEvent<HTMLSelectElement>) {
        this.props.updateConstraints(event.currentTarget.value);
    }

    private handleXPath(event: ChangeEvent<HTMLSelectElement>) {
        this.props.handleChange(event.currentTarget.value);
    }
}
