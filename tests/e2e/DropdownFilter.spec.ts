import homePage from "./pages/home.page";
import defaultFilter from "./pages/default.page";

const dropdownValue = "Uganda";

describe("DropdownFilter", () => {
    it("when dropdown filter is rendered the list view should filter african countries by default", () => {
        defaultFilter.open();
        defaultFilter.dropdownFilter.waitForVisible();
        defaultFilter.listViewFirstItem.waitForVisible();

        const itemValue = defaultFilter.listViewFirstItem.getHTML();
        expect(itemValue).toContain(dropdownValue);
    });
});
