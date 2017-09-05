import { Component, createElement } from "react";

import { DropdownFilterContainerProps, ListView } from "../components/DropdownFilterContainer";
import { Alert } from "../components/Alert";

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
            message: this.props.validate ? ValidateConfigs.validate(this.props) : ""
        });
    }

    static validate(props: ValidateConfigProps): string {
        if (!props.filterNode) {
            return `${widgetName}: unable to find listview with the name "${props.targetListViewName}"`;
        }
        if (props.inWebModeler) {
            return "";
        }
        if (!(props.targetListView && props.targetListView.declaredClass === "mxui.widget.ListView")) {
            return `${widgetName}: supplied target name "${props.targetListViewName}" is not of the type list view`;
        }
        if (!ValidateConfigs.isCompatible(props.targetListView)) {
            return `${widgetName}: this Mendix version is incompatible with the offline search widget`;
        }
        props.filters.forEach(filterAttribute => {
            if (!props.entity && !ValidateConfigs.isValidAttribute(props.targetListView._datasource._entity, props)) {
                return `${widgetName}: supplied attribute name "${filterAttribute.attribute}" does not belong to list view`;
            }
        });
        if (props.entity && !ValidateConfigs.itContains(props.entity, "/")) {
            if (props.entity !== props.targetListView._datasource._entity) {
                return `${widgetName}: supplied entity "${props.entity}" does not belong to list view data source`;
            }
        }
        if (props.entity && ValidateConfigs.itContains(props.entity, "/") && !ValidateConfigs.getRelatedEntity(props)) {
            return `${widgetName}: supplied entity "${props.entity}" does not belong to list view data source reference`;
        }
        if (props.entity && ValidateConfigs.itContains(props.entity, "/")) {
            const entityPath = ValidateConfigs.getRelatedEntity(props);
            props.filters.forEach(filterAttribute => {
                if (props.entity && !ValidateConfigs.isValidAttribute(entityPath, props)) {
                    return `${widgetName}: supplied attribute name "${filterAttribute.attribute}" does not belong to list view data source reference`;
                }
            });
        }

        return "";
    }

    static getRelatedEntity(props: ValidateConfigProps): string {
        if (props.targetListView) {
            const dataSourceEntity = window.mx.meta.getEntity(props.targetListView._datasource._entity);
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

    static isValidAttribute(entity: string, props: ValidateConfigProps): boolean {
        if (props.targetListView) {
            const dataSourceEntity: mendix.lib.MxMetaObject = window.mx.meta.getEntity(entity);
            const dataAttributes: string[] = dataSourceEntity.getAttributes();
            props.filters.forEach(filterAttribute => {
                if (ValidateConfigs.itContains(dataAttributes, filterAttribute.attribute)) {
                    return true;
                }
            });
        }

        return false;
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
