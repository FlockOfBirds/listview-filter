import { ReactElement, createElement } from "react";
import { shallow } from "enzyme";

import { DropdownFilter, DropdownFilterProps, DropdownType } from "../DropdownFilter";
import { parseStyle } from "../../utils/ContainerUtils";

describe("DropdownFilter", () => {
    const renderDropdownFilter = (props: DropdownFilterProps) => shallow(createElement(DropdownFilter, props));
    const dropdownFilterProps: DropdownFilterProps = {
        className: "widget-dropdown-filter",
        defaultFilter: 1,
        filters: [ {
            attribute: "Code",
            attributeValue: "256",
            caption: "Country",
            constraint: "",
            filterBy: "attribute"
        } ],
        handleChange: jasmine.any(Function) as any,
        style: parseStyle("html{}")
    };
    const optionAttributes: DropdownType = {
        disabled: true,
        label: "Select...",
        value: "0"
    };
    const options: Array<ReactElement<{}>> = [
        createElement("option", optionAttributes),
        createElement("option", optionAttributes),
        createElement("option", optionAttributes)
     ];

    it("renders the structure correctly", () => {
        const dropdownFilter = renderDropdownFilter(dropdownFilterProps);

        expect(dropdownFilter).toBeElement(
            createElement("select", {
                className: "form-control",
                onChange: jasmine.any(Function) as any,
                value: "1"
            }, options)
            );
    });

    describe("select", () => {
        it("changes value", (done) => {
            const props: DropdownFilterProps = {
                className: "",
                defaultFilter: 1,
                filters: [ {
                    attribute: "Code",
                    attributeValue: "256",
                    caption: "Country",
                    constraint: "",
                    filterBy: "attribute"
                } ],
                handleChange: value => value
            };
            spyOn(props, "handleChange").and.callThrough();
            const wrapper = renderDropdownFilter(props);
            const select: any = wrapper.find("select");

            select.simulate("change", {
                currentTarget: {
                    selectedOptions: [
                        { getAttribute: (_attribute: string) => "Code" }
                    ],
                    value: "256"
                }
            });

            setTimeout(() => {
                expect(props.handleChange).toHaveBeenCalledWith(undefined);
                done();
            }, 1000);
        });

        it("updates when the select option changes", (done) => {
            const newValue = "Uganda";
            const props: DropdownFilterProps = {
                className: "",
                defaultFilter: 1,
                filters: [ {
                    attribute: "Code",
                    attributeValue: "256",
                    caption: "Country",
                    constraint: "",
                    filterBy: "attribute"
                } ],
                handleChange: value => value
            };
            spyOn(props, "handleChange").and.callThrough();
            const wrapper = renderDropdownFilter(props);
            const select: any = wrapper.find("select");

            select.simulate("change", {
                currentTarget: {
                    selectedOptions: [
                        { getAttribute: (_attribute: string) => "Code" }
                    ],
                    value: "256"
                }
            });

            setTimeout(() => {
                expect(props.handleChange).toHaveBeenCalledWith(undefined);

                select.simulate("change", {
                    currentTarget: {
                        selectedOptions: [
                            { getAttribute: (_attribute: string) => "Name" }
                        ],
                        value: newValue
                    }
                });

                setTimeout(() => {
                    expect(props.handleChange).toHaveBeenCalledWith(undefined);
                    done();
                }, 1000);
            }, 1000);
        });
    });
});
