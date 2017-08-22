import { Component, FormEvent, createElement } from "react";
import { CommonProps } from "../utils/ContainerUtils";

export interface SearchBarProps extends CommonProps {
    onTextChangeAction?: (query: string) => void;
    style: object;
}

export interface SearchBarState {
    query: string;
}

export class SearchBar extends Component<SearchBarProps, SearchBarState> {

    constructor(props: SearchBarProps) {
        super(props);

        this.state = { query: "" };
        this.updateQuery = this.updateQuery.bind(this);
        this.resetQuery = this.resetQuery.bind(this);
    }

    render() {
        if (this.props.showSearchBar) {
            return createElement("div", { className: "search-bar" },
                    createElement("span", { className: "glyphicon glyphicon-search" }),
                    createElement("input", {
                        className: "form-control",
                        onChange: this.updateQuery,
                        placeholder: this.props.placeHolder,
                        value: this.state.query
                    }),
                    createElement("button",
                        {
                            className: `btn-transparent ${this.state.query ? "visible" : "hidden"}`,
                            onClick: this.resetQuery
                        },
                        createElement("span", { className: "glyphicon glyphicon-remove" })
                    )
                );
        } else {
            return null;
        }
    }

    componentDidMount() {
        this.setState({ query: this.props.defaultQuery });
    }

    componentDidUpdate(_prevProps: SearchBarProps, prevState: SearchBarState) {
        if (this.state.query !== prevState.query) {
            setTimeout(() => {
                this.props.onTextChangeAction(this.state.query);
            }, this.geTimeOut());
        }
    }

    private geTimeOut(): number {
        return this.props.showSearchBar === false || this.props.defaultQuery ? 0 : 500;
    }

    private updateQuery(event: FormEvent<HTMLInputElement>) {
        this.setState({ query: event.currentTarget.value });
    }

    private resetQuery() {
        this.setState({ query: "" });
    }
}
