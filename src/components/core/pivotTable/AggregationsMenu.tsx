// (C) 2019-2020 GoodData Corporation
import { Header, Item, ItemsWrapper } from "@gooddata/goodstrap/lib/List/MenuList";
import { AFM, Execution } from "@gooddata/typings";
import * as classNames from "classnames";
import * as React from "react";
import { IntlShape } from "react-intl";
import BubbleHoverTrigger from "@gooddata/goodstrap/lib/Bubble/BubbleHoverTrigger";
import Bubble from "@gooddata/goodstrap/lib/Bubble/Bubble";
import noop = require("lodash/noop");

import {
    getNthAttributeHeader,
    getNthAttributeLocalIdentifier,
    getNthDimensionHeaders,
} from "../../../helpers/executionResultHelper";
import Menu from "../../menu/Menu";
import { getParsedFields } from "./agGridUtils";
import { IMenuAggregationClickConfig } from "../../../interfaces/PivotTable";
import { IOnOpenedChangeParams } from "../../menu/MenuSharedTypes";
import { AVAILABLE_TOTALS } from "../../visualizations/table/totals/utils";
import AggregationsSubMenu from "./AggregationsSubMenu";
import menuHelper from "./aggregationsMenuHelper";
import { FIELD_TYPE_ATTRIBUTE } from "./agGridConst";
import { SHOW_DELAY_DEFAULT, HIDE_DELAY_DEFAULT } from "../../../internal/constants/bubble";

const NATIVE_TOTAL = "nat";

export interface IColumnTotal {
    type: AFM.TotalType;
    attributes: string[];
}

export interface IAggregationsMenuProps {
    intl: IntlShape;
    isMenuOpened: boolean;
    isMenuButtonVisible: boolean;
    showSubmenu: boolean;
    colId: string;
    getExecutionResponse: () => Execution.IExecutionResponse;
    getTotals: () => AFM.ITotalItem[];
    getAfmFilters: () => AFM.CompatibilityFilter[];
    onAggregationSelect: (clickConfig: IMenuAggregationClickConfig) => void;
    onMenuOpenedChange: ({ opened, source }: IOnOpenedChangeParams) => void;
}

export default class AggregationsMenu extends React.Component<IAggregationsMenuProps> {
    public render() {
        const { intl, colId, getExecutionResponse, isMenuOpened, onMenuOpenedChange } = this.props;

        // Because of Ag-grid react wrapper does not rerender the component when we pass
        // new gridOptions we need to pull the data manually on each render
        const executionResponse: Execution.IExecutionResponse = getExecutionResponse();
        if (!executionResponse) {
            return null;
        }

        const rowAttributeHeaders = getNthDimensionHeaders(
            executionResponse,
            0,
        ) as Execution.IAttributeHeader[];
        const isOneRowTable = rowAttributeHeaders.length === 0;
        if (isOneRowTable) {
            return null;
        }

        const dimensionHeader = getNthDimensionHeaders(executionResponse, 1);
        if (!dimensionHeader) {
            return null;
        }

        const measureGroupHeader = dimensionHeader[
            dimensionHeader.length - 1
        ] as Execution.IMeasureGroupHeader;
        if (!measureGroupHeader || !Execution.isMeasureGroupHeader(measureGroupHeader)) {
            return null;
        }

        const fields = getParsedFields(colId);
        const [lastFieldType, lastFieldId, lastFieldValueId = null] = fields[fields.length - 1];

        const isAttributeHeader = lastFieldType === FIELD_TYPE_ATTRIBUTE;
        const isColumnAttribute = lastFieldValueId === null;
        if (isAttributeHeader && isColumnAttribute) {
            return null;
        }

        const measureLocalIdentifiers = menuHelper.getHeaderMeasureLocalIdentifiers(
            measureGroupHeader.measureGroupHeader.items,
            lastFieldType,
            lastFieldId,
        );

        const totalsForHeader = this.getColumnTotals(measureLocalIdentifiers, isAttributeHeader);

        return (
            <Menu
                toggler={<div className="menu-icon" />}
                togglerWrapperClassName={this.getTogglerClassNames()}
                opened={isMenuOpened}
                onOpenedChange={onMenuOpenedChange}
                openAction={"click"}
            >
                <ItemsWrapper>
                    <div className="s-table-header-menu-content">
                        <Header>{intl.formatMessage({ id: "visualizations.menu.aggregations" })}</Header>
                        {this.renderMainMenuItems(
                            totalsForHeader,
                            measureLocalIdentifiers,
                            rowAttributeHeaders,
                        )}
                    </div>
                </ItemsWrapper>
            </Menu>
        );
    }

    private getColumnTotals(measureLocalIdentifiers: string[], isAttributeHeader: boolean): IColumnTotal[] {
        const columnTotals = this.props.getTotals() || [];

        if (isAttributeHeader) {
            return menuHelper.getTotalsForAttributeHeader(columnTotals, measureLocalIdentifiers);
        }

        return menuHelper.getTotalsForMeasureHeader(columnTotals, measureLocalIdentifiers[0]);
    }

    private getTogglerClassNames() {
        const { isMenuButtonVisible, isMenuOpened } = this.props;

        return classNames("s-table-header-menu", "gd-pivot-table-header-menu", {
            "gd-pivot-table-header-menu--show": isMenuButtonVisible,
            "gd-pivot-table-header-menu--hide": !isMenuButtonVisible,
            "gd-pivot-table-header-menu--open": isMenuOpened,
        });
    }

    private renderMenuItemContent(
        totalType: AFM.TotalType,
        onClick: () => void,
        isSelected: boolean,
        hasSubMenu: boolean,
        isEnabled: boolean,
    ) {
        const { intl } = this.props;
        const onClickHandler = isEnabled ? onClick : noop;
        const itemElement = (
            <Item checked={isSelected} subMenu={hasSubMenu} disabled={!isEnabled}>
                <div
                    onClick={onClickHandler}
                    className="gd-aggregation-menu-item-inner s-menu-aggregation-inner"
                >
                    {intl.formatMessage({
                        id: `visualizations.totals.dropdown.title.${totalType}`,
                    })}
                </div>
            </Item>
        );
        return isEnabled ? (
            itemElement
        ) : (
            <BubbleHoverTrigger showDelay={SHOW_DELAY_DEFAULT} hideDelay={HIDE_DELAY_DEFAULT}>
                {itemElement}
                <Bubble className="bubble-primary" alignPoints={[{ align: "bc tc" }]}>
                    {intl.formatMessage({
                        id: "visualizations.totals.dropdown.title.nat.disabled.tooltip",
                    })}
                </Bubble>
            </BubbleHoverTrigger>
        );
    }

    private getItemClassNames(totalType: AFM.TotalType): string {
        return classNames(
            "gd-aggregation-menu-item",
            "s-menu-aggregation",
            `s-menu-aggregation-${totalType}`,
        );
    }

    private renderMainMenuItems(
        columnTotals: IColumnTotal[],
        measureLocalIdentifiers: string[],
        rowAttributeHeaders: Execution.IAttributeHeader[],
    ) {
        const { intl, onAggregationSelect, showSubmenu, getAfmFilters } = this.props;
        const firstAttributeIdentifier = getNthAttributeLocalIdentifier(rowAttributeHeaders, 0);
        const afmFilters = getAfmFilters();

        return AVAILABLE_TOTALS.map((totalType: AFM.TotalType) => {
            const isSelected = menuHelper.isTotalEnabledForAttribute(
                firstAttributeIdentifier,
                totalType,
                columnTotals,
            );
            const attributeHeader = getNthAttributeHeader(rowAttributeHeaders, 0);
            const onClick = () =>
                this.props.onAggregationSelect({
                    type: totalType,
                    measureIdentifiers: measureLocalIdentifiers,
                    include: !isSelected,
                    attributeIdentifier: attributeHeader.localIdentifier,
                });
            const itemClassNames = this.getItemClassNames(totalType);
            const isEnabled = totalType !== NATIVE_TOTAL || !afmFilters.find(AFM.isMeasureValueFilter);
            const renderSubmenu = isEnabled && showSubmenu && rowAttributeHeaders.length > 0;
            const toggler = this.renderMenuItemContent(
                totalType,
                onClick,
                isSelected,
                renderSubmenu,
                isEnabled,
            );

            return (
                <div className={itemClassNames} key={totalType}>
                    {renderSubmenu ? (
                        <AggregationsSubMenu
                            intl={intl}
                            totalType={totalType}
                            rowAttributeHeaders={rowAttributeHeaders}
                            columnTotals={columnTotals}
                            measureLocalIdentifiers={measureLocalIdentifiers}
                            onAggregationSelect={onAggregationSelect}
                            toggler={toggler}
                        />
                    ) : (
                        toggler
                    )}
                </div>
            );
        });
    }
}
