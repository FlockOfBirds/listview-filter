import { Component, createElement } from "react";
import * as classNames from "classNames";

import "../ui/DropdownFilter.css";

interface DropdownFilterProps {
    caption: string;
    value: string;
    getFilterValue?: (query: string) => void;
    options: Array<{ filterAttributeOption: string }>;
}

interface DropdownFilterState {
    query: string;
}

export class DropdownFilter extends Component<DropdownFilterProps, DropdownFilterState> {

    constructor(props: DropdownFilterProps) {
        super(props);

        this.state = { query: "" };
        this.resetQuery = this.resetQuery.bind(this);
    }

    render() {
        return (
            createElement("label", { className: classNames("caption-display") }, this.props.caption + ": ",
                createElement("select", { className: classNames("dropdown-display") }, this.props.options,
                    createElement("option", {}, this.props.options)))
        );
    }

    componentDidMount() {
        this.setState({ query: this.props.value });
    }

    componentDidUpdate(_prevProps: DropdownFilterProps, prevState: DropdownFilterState) {
        if (this.state.query !== prevState.query) {
            setTimeout(() => {
                this.props.getFilterValue(this.state.query);
            });
        }
    }

    private resetQuery() {
        this.setState({ query: "" });
    }
}
