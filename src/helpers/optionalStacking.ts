// (C) 2007-2018 GoodData Corporation
import isArray = require('lodash/isArray');
import { VisualizationObject } from '@gooddata/typings';
import { VIEW_BY_ATTRIBUTES_LIMIT } from '../components/visualizations/chart/constants';

export function getViewByTwoAttributes(
    viewBy: VisualizationObject.IVisualizationAttribute | VisualizationObject.IVisualizationAttribute[]
) {
    // only get first two attributes
    return viewBy ? (isArray(viewBy) ? viewBy.slice(0, VIEW_BY_ATTRIBUTES_LIMIT) : [viewBy]) : [];
}
