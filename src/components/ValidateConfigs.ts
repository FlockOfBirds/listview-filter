import { Component } from "react";

import { DropdownFilterContainerProps, ListView } from "../components/DropdownFilterContainer";

export interface ValidateConfigProps extends DropdownFilterContainerProps {
    inWebModeler?: boolean;
    queryNode?: HTMLElement;
    targetGrid?: ListView;
    targetGridName: string;
    validate: boolean;
}

const widgetName = "dropdown filter widget";

export class ValidateConfigs extends Component<ValidateConfigProps, {}> {

    static validate(props: ValidateConfigProps): string {
        if (!props.queryNode) {
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
        if (!props.filterEntity && !ValidateConfigs.isValidAttribute(props.targetGrid._datasource._entity, props)) {
            return `${widgetName}: supplied attribute name "${props.searchAttribute}" does not belong to list view`;
        }
        if (props.filterEntity && !ValidateConfigs.itContains(props.filterEntity, "/")) {
            if (props.filterEntity !== props.targetGrid._datasource._entity) {
                return `${widgetName}: supplied entity "${props.filterEntity}" does not belong to list view data source`;
            }
        }
        if (props.filterEntity && ValidateConfigs.itContains(props.filterEntity, "/") && !ValidateConfigs.getRelatedEntity(props)) {
            return `${widgetName}: supplied entity "${props.filterEntity}" does not belong to list view data source reference`;
        }
        if (props.filterEntity && ValidateConfigs.itContains(props.filterEntity, "/")) {
            const entityPath = ValidateConfigs.getRelatedEntity(props);
            if (props.filterEntity && !ValidateConfigs.isValidAttribute(entityPath, props)) {
                return `${widgetName}: supplied attribute name "${props.searchAttribute}" does not belong to list view data source reference`;
            }
        }

        return "";
    }

    static getRelatedEntity(props: ValidateConfigProps): string {
        if (props.targetGrid) {
            const dataSourceEntity = window.mx.meta.getEntity(props.targetGrid._datasource._entity);
            const referenceAttributes: string[] = dataSourceEntity.getReferenceAttributes();
            for (const referenceAttribute of referenceAttributes) {
                if (ValidateConfigs.itContains(props.filterEntity, referenceAttribute)) {
                    const selectorEntity = dataSourceEntity.getSelectorEntity(referenceAttribute);
                    if (ValidateConfigs.itContains(props.filterEntity, selectorEntity)) {
                        return selectorEntity;
                    }
                }
            }
        }

        return "";
    }

    static isValidAttribute(entity: string, props: ValidateConfigProps): boolean {
        if (props.targetGrid) {
            const dataSourceEntity: mendix.lib.MxMetaObject = window.mx.meta.getEntity(entity);
            const dataAttributes: string[] = dataSourceEntity.getAttributes();
            if (ValidateConfigs.itContains(dataAttributes, props.searchAttribute)) {
                return true;
            }
        }

        return false;
    }

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

    static findTargetNode(props: DropdownFilterContainerProps, queryNode: HTMLElement): HTMLElement | null {
        let targetNode: HTMLElement | null = null ;

        while (!targetNode && queryNode) {
            targetNode = props.targetGridName
                ? queryNode.querySelector(`.mx-name-${props.targetGridName}`) as HTMLElement
                : queryNode.querySelectorAll(`.mx-listview`)[0] as HTMLElement;

            if (targetNode) break;
            queryNode = queryNode.parentNode as HTMLElement;
        }

        return targetNode;
    }

    static itContains(array: string[] | string, element: string) {
        return array.indexOf(element) > -1;
    }
}
