import { Component, createElement } from "react";
import { findDOMNode } from "react-dom";
import * as dijitRegistry from "dijit/registry";

import { DropdownFilter } from "./DropdownFilter";
import { ValidateConfigs } from "./ValidateConfigs";

export interface DropdownFilterContainerProps {
    filterEntity: string;
    caption: string;
    filterSourceType: filterSourceTypeOptions;
    searchAttribute: string;
    filterValue: string;
    entityConstraint: string;
    filterListValue: string;
    options: Array<{ filterOptionAttribute: string, filterOptionValue: string}>;
    searchMethod: SearchMethodOptions;
    showEmptyOption: boolean;
    targetGridName: string;
}

type HybridConstraint = Array<{ attribute: string; operator: string; value: string; path?: string; }>;

export interface ListView extends mxui.widget._WidgetBase {
    _datasource: {
        _constraints: HybridConstraint | string;
        _entity: string;
        _setSize: number;
        atEnd: () => boolean;
        _pageSize: number;
    };
    _loadMore: () => void;
    _onLoad: () => void;
    _renderData: () => void;
    update: () => void;
}

interface DropdownFilterState {
    findingWidget: boolean;
    targetGrid?: ListView;
    targetNode?: HTMLElement;
    validationPassed?: boolean;
}

type SearchMethodOptions = "equals" | "contains";
type filterSourceTypeOptions = "static" | "xpath";

export default class DropdownFilterContainer extends Component<DropdownFilterContainerProps, DropdownFilterState> {

    constructor(props: DropdownFilterContainerProps) {
        super(props);

        this.state = { findingWidget: true };
        this.updateConstraints = this.updateConstraints.bind(this);
        this.fetchFromXpath = this.fetchFromXpath.bind(this);
    }

    render() {
        return createElement(DropdownFilter, {
            caption: this.props.caption,
            getFilterValue: this.updateConstraints,
            options: this.props.options,
            value: this.props.filterValue
        });
    }

    componentDidMount() {
        const queryNode = findDOMNode(this).parentNode as HTMLElement;
        const targetNode = ValidateConfigs.findTargetNode(this.props, queryNode);
        let targetGrid: ListView | null = null;

        if (targetNode) {
            this.setState({ targetNode });
            targetGrid = dijitRegistry.byNode(targetNode);
            if (targetGrid) {
                this.setState({ targetGrid });
            }
        }
        const validateMessage = ValidateConfigs.validate({
            ...this.props as DropdownFilterContainerProps,
            queryNode: targetNode,
            targetGrid,
            targetGridName: this.props.targetGridName,
            validate: true
        });
        this.setState({ findingWidget: false, validationPassed: !validateMessage });
    }

    private fetchFromXpath(mxObject: mendix.lib.MxObject) {
        const xpath = "//" + this.props.filterEntity +
            this.props.entityConstraint.replace(/\[\%CurrentObject\%\]/gi, mxObject.getGuid());
        mx.data.get({
            callback: object => {
                alert(object);
            },
            error: error => window.mx.ui.error(`${error.message}`),
            filter: {
                sort: [ this.props.searchAttribute, "asc" ]
            },
            xpath
        });
    }

    private updateConstraints(query: string) {
        let constraints: HybridConstraint | string = [];

        if (this.state.targetGrid && this.state.targetGrid._datasource) {
            const datasource = this.state.targetGrid._datasource;
            if (window.device) {
                constraints.push({
                    attribute: this.props.searchAttribute,
                    operator: this.props.searchMethod,
                    path: this.props.filterEntity,
                    value: query
                });
                datasource._constraints = query ? constraints : [];
            } else {
                constraints = this.props.filterEntity && ValidateConfigs.itContains(this.props.filterEntity, "/")
                    ? `${this.props.filterEntity}[${this.props.searchMethod}(${this.props.searchAttribute},'${query}')]`
                    : `${this.props.searchMethod}(${this.props.searchAttribute},'${query}')`;
                datasource._constraints = query ? "[" + constraints + "]" : "";
            }

            this.state.targetGrid.update();
        }
    }
}
