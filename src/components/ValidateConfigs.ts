// import { Component, createElement } from "react";

// import { Alert } from "../components/Alert";
// import { ContainerProps, ListView } from "./DropdownFilterContainer";

// export interface ValidateConfigProps extends ContainerProps {
//     inWebModeler?: boolean;
//     filterNode?: HTMLElement;
//     targetListView?: ListView;
//     targetListViewName: string;
//     validate: boolean;
// }

// const widgetName = "dropdown filter widget";

// export class ValidateConfigs extends Component<ValidateConfigProps, {}> {
//     render() {
//         if (ValidateConfigs.validate(this.props)) {
//             return createElement(Alert, {
//                 bootstrapStyle: "danger",
//                 className: "widget-dropdown-filter-alert",
//                 message: this.props.validate ? ValidateConfigs.validate(this.props) : null
//             });
//         } else {
//             return null;
//         }
//     }

//     static validate(props: ValidateConfigProps): string {
//         // validate filter values if filterby = attribute, then value should not be empty or "" or " ".
//         if (!props.filterNode) {
//             return `${widgetName}: unable to find a listview with to attach to`;
//         }

//         if (!ValidateConfigs.isCompatible(props.targetListView)) {
//             return `${widgetName}: this Mendix version is incompatible`;
//         }

//         if (props.entity && !ValidateConfigs.itContains(props.entity, "/")) {
//             if (props.entity !== props.targetListView._datasource._entity) {
//                 return `${widgetName}: supplied entity "${props.entity}" does not belong to list view data source`;
//             }
//         }

//         if (props.filters && props.filters.length) {
//             return `${widgetName}: should have atleast one filter`;
//         }

//         if (props.filters) {
//             const errorMessage: string[] = [];
//             props.filters.forEach((filter, index) => {
//                 if (filter.filterBy === "XPath" && !filter.constraint) {
//                     errorMessage.push(`Filter position: {${index + 1 }} is missing XPath constraint`);
//                 }
//                 if (filter.filterBy === "attribute" && !filter.attributeValue) {
//                     errorMessage.push(`Filter position: {${index + 1 }} is missing a Value constraint`);
//                 }
//             });
//             if (errorMessage.length) {
//                  return `${widgetName} : ${errorMessage.join(", ")}`;
//             }
//         }

//         if (!isNaN(props.defaultFilter) && props.defaultFilter >= 0 && props.defaultFilter > props.filters.length) {
//             return `${widgetName}: Default value must be a number not more number of filters`;
//         }

//         return "";
//     }

//     static isCompatible(targetListView: ListView): boolean {
//         return !!(targetListView && targetListView._datasource);
//     }

//     static findTargetNode(props: ContainerProps, filterNode: HTMLElement): HTMLElement | null {
//         let targetNode: HTMLElement | null = null ;

//         while (!targetNode && filterNode) {
//             targetNode = props.targetListViewName
//                 ? filterNode.querySelector(`.mx-name-${props.targetListViewName}`) as HTMLElement
//                 : filterNode.querySelectorAll(`.mx-listview`)[0] as HTMLElement;

//             if (targetNode || filterNode.classList.contains("mx-incubator")
//                 || filterNode.classList.contains("mx-offscreen")) {
//                     break;
//                 }
//             filterNode = filterNode.parentNode as HTMLElement;
//         }

//         return targetNode;
//     }

//     static itContains(array: string[] | string, element: string) {
//         return array.indexOf(element) > -1;
//     }
// }
