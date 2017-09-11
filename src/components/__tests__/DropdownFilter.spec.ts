// import { ReactElement, createElement } from "react";
// import { shallow } from "enzyme";

// import { DropdownFilter, DropdownFilterProps } from "../DropdownFilter";
// import { DropdownType } from "../../utils/ContainerUtils";

// describe("DropdownFilter", () => {
//     const renderDropdownFilter = (props: DropdownFilterProps) => shallow(createElement(DropdownFilter, props));
//     const dropdownFilterProps: DropdownFilterProps = {
//         className: "widget-dropdown-filter",
//         filters: [ {
//             attribute: "Code",
//             caption: "Country",
//             constraint: "",
//             filterBy: "attribute",
//             isDefaultOption: true,
//             value: "256"
//         } ],
//         handleChange: jasmine.any(Function) as any
//     };
//     const createOptions = (props: DropdownFilterProps) => {
//         const foundDefaultFilterOption = false;
//         const optionElements: Array<ReactElement<{}>> = [];
//         optionElements.push(createElement("option", {
//             className: "",
//             label: "",
//             value: ""
//         }));
//         props.filters.map((optionObject) => {
//             const { value, caption, attribute, filterBy, constraint, isDefaultOption } = optionObject;
//             const optionValue: DropdownType = {
//                 "data-attribute": attribute,
//                 "data-constraint": constraint,
//                 "data-filterBy": filterBy,
//                 "label": caption,
//                 "selected": isDefaultOption && !foundDefaultFilterOption,
//                 value
//             };
//             optionElements.push(createElement("option", optionValue));
//         });
//         return optionElements;
//     };

//     it("renders the structure correctly", () => {
//         const dropdownFilter = renderDropdownFilter(dropdownFilterProps);

//         expect(dropdownFilter).toBeElement(
//             createElement("div", {
//                 className: "widget-dropdown-filter"
//             },
//                 createElement("select", {
//                     className: "form-control",
//                     onChange: jasmine.any(Function) as any
//                 }, createOptions(dropdownFilterProps))
//             )
//         );
//     });

//     describe("select", () => {
//         it("changes value", (done) => {
//             const props: DropdownFilterProps = {
//                 className: "",
//                 filters: [ {
//                     caption: "Country code"
//                 } ],
//                 handleChange: value => value
//             };
//             spyOn(props, "handleChange").and.callThrough();
//             const wrapper = renderDropdownFilter(props);
//             const select: any = wrapper.find("select");

//             select.simulate("change", {
//                 currentTarget: {
//                     selectedOptions: [
//                         { getAttribute: (_attribute: string) => "Code" }
//                     ],
//                     value: "256"
//                 }
//             });

//             setTimeout(() => {
//                 expect(props.handleChange).toHaveBeenCalledWith("256", "Code", "Code", "Code", "");
//                 done();
//             }, 1000);
//         });

//         it("updates when the select option changes", (done) => {
//             const newValue = "Uganda";
//             const props: DropdownFilterProps = {
//                 className: "",
//                 filters: [ {
//                     caption: "Country code"
//                 } ],
//                 handleChange: value => value
//             };
//             spyOn(props, "handleChange").and.callThrough();
//             const wrapper = renderDropdownFilter(props);
//             const select: any = wrapper.find("select");

//             select.simulate("change", {
//                 currentTarget: {
//                     selectedOptions: [
//                         { getAttribute: (_attribute: string) => "Code" }
//                     ],
//                     value: "256"
//                 }
//             });

//             setTimeout(() => {
//                 expect(props.handleChange).toHaveBeenCalledWith("256", "Code", "Code", "Code", "");

//                 select.simulate("change", {
//                     currentTarget: {
//                         selectedOptions: [
//                             { getAttribute: (_attribute: string) => "Name" }
//                         ],
//                         value: newValue
//                     }
//                 });

//                 setTimeout(() => {
//                     expect(props.handleChange).toHaveBeenCalledWith(newValue, "Name", "Name", "Name", "");
//                     done();
//                 }, 1000);
//             }, 1000);
//         });
//     });
// });
