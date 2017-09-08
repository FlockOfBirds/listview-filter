import { OptionHTMLAttributes } from "react";

interface WrapperProps {
    class: string;
    style: string;
}

export interface DropdownType extends OptionHTMLAttributes<HTMLOptionElement> {
    "data-filterBy": string;
    "data-attribute": string;
    "data-constraint": string;
}

export interface DropdownFilterContainerProps extends WrapperProps {
    entity: string;
    mxform: mxui.lib.form._FormBase;
    targetListViewName: string;
    filters: FilterProps[];
}

export interface FilterProps {
    caption: string;
    filterBy?: filterOptions;
    attribute?: string;
    value?: string;
    constraint?: string;
    isDefaultOption?: boolean;
}

export interface ListView extends mxui.widget._WidgetBase {
    _datasource: {
        _constraints: HybridConstraint | string;
        _entity: string;
    };
    update: () => void;
}

export interface DropdownFilterState {
    widgetAvailable: boolean;
    targetListView?: ListView;
    targetNode?: HTMLElement;
    validationPassed?: boolean;
    value?: string;
}

export type HybridConstraint = Array<{ attribute: string; operator: string; value: string; path?: string; }>;

export type filterOptions = "attribute" | "XPath";

export const parseStyle = (style = ""): {[key: string]: string} => {
    try {
        return style.split(";").reduce<{[key: string]: string}>((styleObject, line) => {
            const pair = line.split(":");
            if (pair.length === 2) {
                const name = pair[0].trim().replace(/(-.)/g, match => match[1].toUpperCase());
                styleObject[name] = pair[1].trim();
            }
            return styleObject;
        }, {});
    } catch (error) {
        // tslint:disable-next-line no-console
        window.console.log("Failed to parse style", style, error);
    }

    return {};
};
