// (C) 2019-2020 GoodData Corporation
import * as React from "react";
import { render } from "react-dom";

import cloneDeep = require("lodash/cloneDeep");
import get = require("lodash/get");
import set = require("lodash/set");
import includes = require("lodash/includes");

import { VisualizationObject, AFM } from "@gooddata/typings";

import * as BucketNames from "../../../../constants/bucketNames";
import {
    IReferencePoint,
    IExtendedReferencePoint,
    IVisConstruct,
    IVisualizationProperties,
    IVisProps,
    IBucketItem,
    IBucket,
    IUiConfig,
} from "../../../interfaces/Visualization";
import { PluggableBaseChart } from "../baseChart/PluggableBaseChart";
import { BUCKETS, METRIC, ATTRIBUTE } from "../../../constants/bucket";
import { GEO_PUSHPIN_CHART_UICONFIG } from "../../../constants/uiConfig";
import {
    sanitizeFilters,
    getBucketItemsByType,
    getPreferredBucketItems,
    getMeasures,
    removeMeasuresShowOnSecondaryAxis,
} from "../../../utils/bucketHelper";
import { setGeoPushpinUiConfig } from "../../../utils/uiConfigHelpers/geoPushpinChartUiConfigHelper";
import { removeSort, createSorts } from "../../../utils/sort";
import { getReferencePointWithSupportedProperties } from "../../../utils/propertiesHelper";
import { VisualizationTypes } from "../../../../constants/visualizationTypes";

import UnsupportedConfigurationPanel from "../../configurationPanels/UnsupportedConfigurationPanel";
import { DASHBOARDS_ENVIRONMENT } from "../../../constants/properties";
import { GeoChart } from "../../../../components/core/GeoChart";
import { IGeoConfig } from "../../../../interfaces/GeoChart";

export class PluggableGeoPushpinChart extends PluggableBaseChart {
    private geoPushpinElement: string;

    constructor(props: IVisConstruct) {
        super(props);

        const { callbacks, element, visualizationProperties } = props;
        this.type = VisualizationTypes.PUSHPIN;
        this.supportedPropertiesList = [];
        this.callbacks = callbacks;
        this.geoPushpinElement = element;
        this.initializeProperties(visualizationProperties);
    }

    public getExtendedReferencePoint(referencePoint: IReferencePoint): Promise<IExtendedReferencePoint> {
        return super
            .getExtendedReferencePoint(referencePoint)
            .then((extendedReferencePoint: IExtendedReferencePoint) => {
                let newReferencePoint: IExtendedReferencePoint = setGeoPushpinUiConfig(
                    extendedReferencePoint,
                    this.intl,
                    this.type,
                );
                newReferencePoint = getReferencePointWithSupportedProperties(
                    newReferencePoint,
                    this.supportedPropertiesList,
                );
                newReferencePoint = removeSort(newReferencePoint);
                return Promise.resolve(sanitizeFilters(newReferencePoint));
            });
    }

    public getUiConfig(): IUiConfig {
        return cloneDeep(GEO_PUSHPIN_CHART_UICONFIG);
    }

    protected configureBuckets(extendedReferencePoint: IExtendedReferencePoint): IExtendedReferencePoint {
        const buckets: IBucket[] = get(extendedReferencePoint, BUCKETS, []);
        const allMeasures: IBucketItem[] = getMeasures(buckets);
        const primaryMeasures: IBucketItem[] = getPreferredBucketItems(
            buckets,
            [BucketNames.MEASURES, BucketNames.SIZE],
            [METRIC],
        );
        const secondaryMeasures: IBucketItem[] = getPreferredBucketItems(
            buckets,
            [BucketNames.SECONDARY_MEASURES, BucketNames.COLOR],
            [METRIC],
        );
        const sizeMeasures: IBucketItem[] =
            primaryMeasures.length > 0
                ? primaryMeasures.slice(0, 1)
                : allMeasures.filter(measure => !includes(secondaryMeasures, measure)).slice(0, 1);

        const colorMeasures: IBucketItem[] =
            secondaryMeasures.length > 0
                ? secondaryMeasures.slice(0, 1)
                : allMeasures.filter(measure => !includes(sizeMeasures, measure)).slice(0, 1);

        const segments = getPreferredBucketItems(
            buckets,
            [BucketNames.STACK, BucketNames.SEGMENT, BucketNames.COLUMNS],
            [ATTRIBUTE],
        );

        set(extendedReferencePoint, BUCKETS, [
            {
                localIdentifier: BucketNames.LOCATION,
                items: getBucketItemsByType(buckets, BucketNames.LOCATION, [ATTRIBUTE]),
            },
            {
                localIdentifier: BucketNames.SIZE,
                items: removeMeasuresShowOnSecondaryAxis(sizeMeasures),
            },
            {
                localIdentifier: BucketNames.COLOR,
                items: removeMeasuresShowOnSecondaryAxis(colorMeasures),
            },
            {
                localIdentifier: BucketNames.SEGMENT,
                items: segments,
            },
        ]);
        return extendedReferencePoint;
    }

    protected renderConfigurationPanel() {
        const configPanelElement = document.querySelector(this.configPanelElement);
        if (configPanelElement) {
            const properties: IVisualizationProperties = get(this, "visualizationProperties.properties", {});

            render(
                <UnsupportedConfigurationPanel
                    locale={this.locale}
                    pushData={this.callbacks.pushData}
                    properties={properties}
                />,
                configPanelElement,
            );
        }
    }

    protected renderVisualization(
        options: IVisProps,
        visualizationProperties: IVisualizationProperties,
        mdObject: VisualizationObject.IVisualizationObjectContent,
    ) {
        const { dataSource } = options;
        if (!dataSource) {
            return;
        }

        const { projectId, intl, geoPushpinElement } = this;
        const {
            dimensions: { height },
            custom: { drillableItems },
            locale,
            config,
        } = options;
        const {
            afterRender,
            onDrill,
            onFiredDrillEvent,
            onError,
            onExportReady,
            onLoadingChanged,
        } = this.callbacks;

        // keep height undef for AD; causes indigo-visualizations to pick default 100%
        const resultingHeight = this.environment === DASHBOARDS_ENVIRONMENT ? height : undefined;

        const resultSpec = this.getResultSpec(options, visualizationProperties, mdObject);

        const fullConfig = this.buildVisualizationConfig(mdObject, config, null);

        const geoPushpinProps = {
            projectId,
            drillableItems,
            config: fullConfig as IGeoConfig,
            height: resultingHeight,
            intl,
            locale,
            dataSource,
            resultSpec,
            pushData: this.handlePushData,
            afterRender,
            onDrill,
            onError,
            onExportReady,
            onLoadingChanged,
            onFiredDrillEvent,
            LoadingComponent: null as any,
            ErrorComponent: null as any,
        };

        render(<GeoChart {...geoPushpinProps} />, document.querySelector(geoPushpinElement));
    }

    private getResultSpec(
        options: IVisProps,
        visualizationProperties: IVisualizationProperties,
        mdObject: VisualizationObject.IVisualizationObjectContent,
    ): AFM.IResultSpec {
        const { resultSpec, dataSource } = options;

        const resultSpecWithDimensions: AFM.IResultSpec = {
            ...resultSpec,
            dimensions: this.getDimensions(mdObject),
        };

        const hasSizeMeasure = mdObject.buckets.some(bucket => bucket.localIdentifier === BucketNames.SIZE);

        const allProperties: IVisualizationProperties = get(visualizationProperties, "properties", {});

        // only DESC sort on Size measure to always lay smaller pushpins on top of bigger ones
        const sorts: AFM.SortItem[] = hasSizeMeasure
            ? createSorts(this.type, dataSource.getAfm(), resultSpecWithDimensions, allProperties)
            : [];

        return {
            ...resultSpecWithDimensions,
            sorts,
        };
    }
}
