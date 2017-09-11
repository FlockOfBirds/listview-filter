// import { Component, createElement } from "react";
// import { findDOMNode } from "react-dom";

// import { DropdownFilter } from "./components/DropdownFilter";
// import { ContainerProps, DropdownFilterState } from "./components/DropdownFilterContainer";
// import { Utils } from "./utils/ContainerUtils";

// // tslint:disable-next-line class-name
// export class preview extends Component<ContainerProps, DropdownFilterState> {
//     constructor(props: ContainerProps) {
//         super(props);

//         this.state = { widgetAvailable: true };
//     }

//     render() {
//         return createElement("div", { className: "widget-dropdown-filter" },
//             createElement(ValidateConfigs, {
//                 ...this.props as ContainerProps,
//                 filterNode: this.state.targetNode,
//                 filters: this.props.filters,
//                 targetListView: this.state.targetListView,
//                 targetListViewName: this.props.targetListViewName,
//                 validate: !this.state.widgetAvailable
//             }),
//             createElement(DropdownFilter, {
//                 filters: this.props.filters,
//                 handleChange: () => { return; }
//             })
//         );
//     }

//     componentDidMount() {
//         this.validateConfigs(this.props);
//     }

//     componentWillReceiveProps(newProps: ContainerProps) {
//         this.validateConfigs(newProps);
//     }

//     private validateConfigs(props: ContainerProps) {
//         // validate filter values if filterby is attribute, then value should not be empty or "" or " ".
//         const routeNode = findDOMNode(this) as HTMLElement;
//         const targetNode = ValidateConfigs.findTargetNode(props, routeNode);

//         if (targetNode) {
//             this.setState({ targetNode });
//         }
//         this.setState({ widgetAvailable: true });
//     }
// }

// export function getVisibleProperties(valueMap: ContainerProps, visibilityMap: any) {
//     valueMap.filters.forEach(filterAttribute => {
//         if (filterAttribute.filterBy === "attribute") {
//             visibilityMap.filters.attribute = true;
//             visibilityMap.filters.filterBy = true;
//             visibilityMap.filters.value = true;
//             visibilityMap.filters.constraint = false;
//         } else if (filterAttribute.filterBy === "XPath") {
//             visibilityMap.filters.attribute = false;
//             visibilityMap.filters.filterBy = false;
//             visibilityMap.filters.value = false;
//             visibilityMap.filters.constraint = true;
//         }
//     });

//     return visibilityMap;
// }
