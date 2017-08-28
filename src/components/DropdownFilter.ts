import { Component, createElement } from "react";

interface DropdownFilterProps {
    caption: string;
    value: string;
    getFilterValue?: (query: string) => void;
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
        return createElement("div", { className: "btn-group" },
            createElement("button", { className: "btn" }, this.props.caption),
            createElement("button", { className: "btn dropdown-toggle", dataToggle: "dropdown" },
                createElement("span", { className: "caret" })),
            createElement("ul", { className: "dropdown-menu" }));
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
