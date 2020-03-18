// (C) 2020 GoodData Corporation
import { projectId } from "./fixtures";

export const MAPBOX_TOKEN = process.env.EXAMPLE_MAPBOX_ACCESS_TOKEN;
export const cityCoordinatesUri = `/gdc/md/${projectId}/obj/9459`; // attr dedicated to geo chart with textual and geo DF
export const populationUri = `/gdc/md/${projectId}/obj/9466`;
export const densityUri = `/gdc/md/${projectId}/obj/9467`;
export const stateNamesUri = `/gdc/md/${projectId}/obj/9462`;
export const stateNamesIdentifier = "label.uscities.state_name";
export const cityNamesUri = `/gdc/md/${projectId}/obj/9460`;
export const geoPushpinChartVisualizationIdentifier = "acebcI3fhaRI";
export const geoPushpinChartVisualizationUri = `/gdc/md/${projectId}/obj/9480`;
