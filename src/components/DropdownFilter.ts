import { ChangeEvent, Component, OptionHTMLAttributes, ReactElement, createElement } from "react";

import { ValueProps, comparisonOptions } from "./DropdownFilterContainer";

export interface DropdownFilterProps {
    handleChange: (value: string, attribute: string, comparison: comparisonOptions, constraint: string, filterMethod: string) => void;
    values: ValueProps[];
}

interface DropdownFilterState {
    value: string;
    constraint: string;
    filter: string;
    comparison: comparisonOptions;
    attributeName: string;
}

interface DropdownType extends OptionHTMLAttributes<HTMLOptionElement> {
    "data-comparison": string;
    "data-attribute": string;
    "data-constraint": string;
    "data-filter": string;
}

export class DropdownFilter extends Component<DropdownFilterProps, DropdownFilterState> {
    constructor(props: DropdownFilterProps) {
        super(props);

        this.state = { value: "", constraint: "", comparison: "static", attributeName: "", filter: "" };
        this.handleOnChange = this.handleOnChange.bind(this);
    }

    render() {
        return createElement("div", { className: "form-group" },
            createElement("select", {
                className: "form-control",
                onChange: this.handleOnChange
            }, this.createOptions())
        );
    }

    componentDidUpdate(_prevProps: DropdownFilterProps, _prevState: DropdownFilterState) {
        this.props.handleChange(this.state.value, this.state.attributeName, this.state.comparison, this.state.constraint, this.state.filter);
    }

    private createOptions(): Array<ReactElement<{}>> {
        const optionElements: Array<ReactElement<{}>> = [];
        optionElements.push(createElement("option", {
            className: "",
            label: "",
            value: "(empty)"
        }));
        if (this.props.values.length) {
            this.props.values.map((optionObject) => {
                const { value, caption, attribute, comparison, constraint, filterMethod } = optionObject;
                const optionValue: DropdownType = {
                    "data-attribute": attribute,
                    "data-comparison": comparison,
                    "data-constraint": constraint,
                    "data-filter": filterMethod,
                    "label": caption,
                    value
                };
                optionElements.push(createElement("option", optionValue));
            });
        }
        return optionElements;
    }

    private handleOnChange(event: ChangeEvent<HTMLSelectElement>) {
        this.setState({
            attributeName: event.currentTarget.selectedOptions[0].getAttribute("data-attribute"),
            comparison: event.currentTarget.selectedOptions[0].getAttribute("data-comparison") as comparisonOptions,
            constraint: event.currentTarget.selectedOptions[0].getAttribute("data-constraint"),
            filter: event.currentTarget.selectedOptions[0].getAttribute("data-filter"),
            value: event.currentTarget.value
        });
    }
}
