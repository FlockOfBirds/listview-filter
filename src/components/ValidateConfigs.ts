import { Component, createElement } from "react";

import { Alert } from "../components/Alert";
import { DropdownFilterContainerProps, ListView } from "../utils/ContainerUtils";

export interface ValidateConfigProps extends DropdownFilterContainerProps {
    inWebModeler?: boolean;
    filterNode?: HTMLElement;
    targetListView?: ListView;
    targetListViewName: string;
    validate: boolean;
}

const widgetName = "dropdown filter widget";

export class ValidateConfigs extends Component<ValidateConfigProps, {}> {
    render() {
        return createElement(Alert, {
            bootstrapStyle: "danger",
            className: "widget-dropdown-filter-alert",
            message: this.props.validate ? ValidateConfigs.validate(this.props) : null
        });
    }

    static validate(props: ValidateConfigProps): string {
        if (!props.filterNode) {
            return `${widgetName}: unable to find a listview with to attach to`;
        }

        if (!ValidateConfigs.isCompatible(props.targetListView)) {
            return `${widgetName}: this Mendix version is incompatible`;
        }

        if (props.entity && !ValidateConfigs.itContains(props.entity, "/")) {
            if (props.entity !== props.targetListView._datasource._entity) {
                return `${widgetName}: supplied entity "${props.entity}" does not belong to list view data source`;
            }
        }

        return "";
    }

    static isCompatible(targetListView: ListView): boolean {
        return !!(targetListView && targetListView._datasource);
    }

    static findTargetNode(props: DropdownFilterContainerProps, filterNode: HTMLElement): HTMLElement | null {
        let targetNode: HTMLElement | null = null ;

        while (!targetNode && filterNode) {
            targetNode = props.targetListViewName
                ? filterNode.querySelector(`.mx-name-${props.targetListViewName}`) as HTMLElement
                : filterNode.querySelectorAll(`.mx-listview`)[0] as HTMLElement;

            if (targetNode) break;
            filterNode = filterNode.parentNode as HTMLElement;
        }

        return targetNode;
    }

    static itContains(array: string[] | string, element: string) {
        return array.indexOf(element) > -1;
    }
}
