import defaultFilter from "./pages/default.page";

const dropdownTestValue = "Uganda";
const dropdownTestValue1 = "Netherlands";
const dropdownSelect = "#mxui_widget_ReactCustomWidgetWrapper_0 > select";
const dropdownSelectText = "European countries";
describe("DropdownFilter", () => {
    it("when dropdown filter is rendered the list view should filter african countries by default", () => {
        defaultFilter.open();
        defaultFilter.dropdownFilter.waitForVisible();
        defaultFilter.listViewFirstItem.waitForVisible();

        const itemValue = defaultFilter.listViewFirstItem.getHTML();
        expect(itemValue).toContain(dropdownTestValue);
    });

    it("filters a list view by the option selected", () => {
        defaultFilter.open();
        defaultFilter.dropdownFilter.waitForVisible();
        defaultFilter.dropdownFilter.click();
        browser.selectByVisibleText(dropdownSelect, dropdownSelectText);

        const itemValue = defaultFilter.listViewFirstItem.getHTML();
        expect(itemValue).toContain(dropdownTestValue1);
    });
});
