import { Component, createElement } from "react";

import { DropdownFilterContainerProps, ListView } from "../components/DropdownFilterContainer";
import { Alert } from "../components/Alert";

export interface ValidateConfigProps extends DropdownFilterContainerProps {
    inWebModeler?: boolean;
    filterNode?: HTMLElement;
    targetGrid?: ListView;
    targetGridName: string;
    validate: boolean;
}

const widgetName = "dropdown filter widget";

export class ValidateConfigs extends Component<ValidateConfigProps, {}> {
    render() {
        return createElement(Alert, {
            bootstrapStyle: "danger",
            className: "widget-dropdown-filter-alert",
            message: this.props.validate ? ValidateConfigs.validate(this.props) : ""
        });
    }

    static validate(props: ValidateConfigProps): string {
        if (!props.filterNode) {
            return `${widgetName}: unable to find grid with the name "${props.targetGridName}"`;
        }
        if (props.inWebModeler) {
            return "";
        }
        if (!(props.targetGrid && props.targetGrid.declaredClass === "mxui.widget.ListView")) {
            return `${widgetName}: supplied target name "${props.targetGridName}" is not of the type list view`;
        }
        if (!ValidateConfigs.isCompatible(props.targetGrid)) {
            return `${widgetName}: this Mendix version is incompatible with the offline search widget`;
        }
        // if (!props.entity && !ValidateConfigs.isValidAttribute(props.targetGrid._datasource._entity, props)) {
        //     // return `${widgetName}: supplied attribute name "${props.values.attribute}" does not belong to list view`;
        //     return `${widgetName}: supplied attribute name does not belong to list view`;
        // }
        if (props.entity && !ValidateConfigs.itContains(props.entity, "/")) {
            if (props.entity !== props.targetGrid._datasource._entity) {
                return `${widgetName}: supplied entity "${props.entity}" does not belong to list view data source`;
            }
        }
        if (props.entity && ValidateConfigs.itContains(props.entity, "/") && !ValidateConfigs.getRelatedEntity(props)) {
            return `${widgetName}: supplied entity "${props.entity}" does not belong to list view data source reference`;
        }
        if (props.entity && ValidateConfigs.itContains(props.entity, "/")) {
            // const entityPath = ValidateConfigs.getRelatedEntity(props);
            // if (props.entity && !ValidateConfigs.isValidAttribute(entityPath, props)) {
            //     // return `${widgetName}: supplied attribute name "${props.values.attribute}" does not belong to list view data source reference`;
            //     return `${widgetName}: supplied attribute name does not belong to list view data source reference`;
            // }
        }

        return "";
    }

    static getRelatedEntity(props: ValidateConfigProps): string {
        if (props.targetGrid) {
            const dataSourceEntity = window.mx.meta.getEntity(props.targetGrid._datasource._entity);
            const referenceAttributes: string[] = dataSourceEntity.getReferenceAttributes();
            for (const referenceAttribute of referenceAttributes) {
                if (ValidateConfigs.itContains(props.entity, referenceAttribute)) {
                    const selectorEntity = dataSourceEntity.getSelectorEntity(referenceAttribute);
                    if (ValidateConfigs.itContains(props.entity, selectorEntity)) {
                        return selectorEntity;
                    }
                }
            }
        }

        return "";
    }

    // static isValidAttribute(entity: string, props: ValidateConfigProps): boolean {
    //     if (props.targetGrid) {
    //         const dataSourceEntity: mendix.lib.MxMetaObject = window.mx.meta.getEntity(entity);
    //         const dataAttributes: string[] = dataSourceEntity.getAttributes();
    //         if (ValidateConfigs.itContains(dataAttributes, props.values.)) {
    //             return true;
    //         }
    //     }

    //     return false;
    // }

    static isCompatible(targetGrid: ListView): boolean {
        return !!(targetGrid &&
            targetGrid._onLoad &&
            targetGrid._loadMore &&
            targetGrid._renderData &&
            targetGrid._datasource &&
            targetGrid._datasource.atEnd &&
            typeof targetGrid._datasource._pageSize !== "undefined" &&
            typeof targetGrid._datasource._setSize !== "undefined");
    }

    static findTargetNode(props: DropdownFilterContainerProps, filterNode: HTMLElement): HTMLElement | null {
        let targetNode: HTMLElement | null = null ;

        while (!targetNode && filterNode) {
            targetNode = props.targetGridName
                ? filterNode.querySelector(`.mx-name-${props.targetGridName}`) as HTMLElement
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
