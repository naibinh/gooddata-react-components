// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { screenshotWrap } from '@gooddata/test-storybook';
import { Visualization } from '../../src/components/visualizations/Visualization';
import { wrap } from '../utils/wrap';
import '../../styles/scss/charts.scss';
import { barChartWith4MetricsAndViewBy2Attribute } from '../test_data/fixtures';
import { IChartConfig, VisualizationTypes } from '../../src';
import { supportedStackingAttributesChartTypes } from '../../src/components/visualizations/chart/chartOptionsBuilder';

const renderSupportedCharts = (
    config: IChartConfig = {}
) => (
        <div>
            {supportedStackingAttributesChartTypes.map((type) => {
                const newConfig: IChartConfig = {
                    type,
                    legend: {
                        enabled: true,
                        position: 'top'
                    },
                    ...config
                };

                if (type === VisualizationTypes.BAR) {
                    newConfig.xaxis = config.yaxis;
                    newConfig.yaxis = config.xaxis;
                    newConfig.secondary_xaxis = config.secondary_yaxis;
                    newConfig.dataLabels = {
                        visible: false // disable data label on bar chart to make test stable
                    };
                }

                return (
                    wrap(
                        <div>
                            <Visualization config={newConfig} {...barChartWith4MetricsAndViewBy2Attribute}/>
                        </div>
                    )
                );
            })}
        </div>
    );

const DUAL_AXIS_CONFIG = {
    secondary_yaxis: {
        measures: ['3b4fc6113ff9452da677ef7842e2302c', '26843260d95c4c9fa0aecc996ffd7829']
    }
};

storiesOf('Internal/OptionalStacking', module)
    .add('Charts with viewBy 2 attributes', () => {
        return screenshotWrap(
            <div>
                {renderSupportedCharts()}
            </div>
        );
    })
    .add('Charts with viewBy 2 attributes and 60 degree label rotation', () => {
        const config = {
            xaxis: {
                rotation: '60'
            }
        };
        return screenshotWrap(
            <div>
                {renderSupportedCharts(config)}
            </div>
        );
    })
    .add('Charts with viewBy 2 attributes and \'Stack Measures\' enabled', () => {
        const config = {
            stackMeasures: true
        };
        return screenshotWrap(
            <div>
                {renderSupportedCharts(config)}
            </div>
        );
    })
    .add('Charts with viewBy 2 attributes and \'Stack Measures\' enabled with min/max setting', () => {
        const config = {
            stackMeasures: true,
            yaxis: {
                min: '50000',
                max: '100000'
            }
        };
        return screenshotWrap(
            <div>
                {renderSupportedCharts(config)}
            </div>
        );
    })
    .add('Charts with viewBy 2 attributes and \'Stack to 100%\' enabled', () => {
        const config = {
            stackMeasuresToPercent: true
        };
        return screenshotWrap(
            <div>
                {renderSupportedCharts(config)}
            </div>
        );
    })
    .add('Charts with viewBy 2 attributes and \'Stack to 100%\' enabled with min/max setting', () => {
        const config = {
            stackMeasuresToPercent: true,
            yaxis: {
                min: '0.2',
                max: '0.8'
            }
        };
        return screenshotWrap(
            <div>
                {renderSupportedCharts(config)}
            </div>
        );
    })
    .add('Dual axis charts with viewBy 2 attributes', () => {
        return screenshotWrap(
            <div>
                {renderSupportedCharts(DUAL_AXIS_CONFIG)}
            </div>
        );
    })
    .add('Dual axis charts with viewBy 2 attributes and 60 degree label rotation', () => {
        const config = {
            xaxis: {
                rotation: '60'
            },
            ...DUAL_AXIS_CONFIG
        };
        return screenshotWrap(
            <div>
                {renderSupportedCharts(config)}
            </div>
        );
    })
    .add('Dual axis charts with viewBy 2 attributes and \'Stack Measures\' enabled', () => {
        const config = {
            stackMeasures: true,
            ...DUAL_AXIS_CONFIG
        };
        return screenshotWrap(
            <div>
                {renderSupportedCharts(config)}
            </div>
        );
    })
    .add('Dual axis charts with viewBy 2 attributes and \'Stack Measures\' enabled with min/max setting', () => {
        const config = {
            stackMeasures: true,
            yaxis: {
                min: '20000',
                max: '80000'
            },
            secondary_yaxis: {
                min: '10000',
                max: '70000',
                ...DUAL_AXIS_CONFIG.secondary_yaxis
            }
        };
        return screenshotWrap(
            <div>
                {renderSupportedCharts(config)}
            </div>
        );
    })
    .add('Dual axis charts with viewBy 2 attributes and \'Stack to 100%\' enabled', () => {
        const config = {
            stackMeasuresToPercent: true,
            ...DUAL_AXIS_CONFIG
        };
        return screenshotWrap(
            <div>
                {renderSupportedCharts(config)}
            </div>
        );
    })
    .add('Dual axis charts with viewBy 2 attributes and \'Stack to 100%\' enabled with min/max setting', () => {
        const config = {
            stackMeasuresToPercent: true,
            yaxis: {
                min: '0.2',
                max: '0.8'
            },
            secondary_yaxis: {
                min: '10000',
                max: '70000',
                ...DUAL_AXIS_CONFIG.secondary_yaxis
            }
        };
        return screenshotWrap(
            <div>
                {renderSupportedCharts(config)}
            </div>
        );
    });
