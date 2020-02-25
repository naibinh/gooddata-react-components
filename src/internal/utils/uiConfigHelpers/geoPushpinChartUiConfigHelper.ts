// (C) 2019-2020 GoodData Corporation
import { IntlShape } from "react-intl";
import cloneDeep = require("lodash/cloneDeep");
import set = require("lodash/set");
import get = require("lodash/get");

import { IExtendedReferencePoint } from "../../interfaces/Visualization";
import { UICONFIG, OPEN_AS_REPORT, SUPPORTED } from "../../constants/uiConfig";
import { BUCKETS } from "../../constants/bucket";
import { setBucketTitles } from "../bucketHelper";

import * as BucketNames from "../../../constants/bucketNames";
import * as geoPushPinBucketIcon from "../../assets/geoPushpin/bucket-icon.svg";

export function setGeoPushpinUiConfig(
    referencePoint: IExtendedReferencePoint,
    intl: IntlShape,
    visualizationType: string,
): IExtendedReferencePoint {
    const referencePointConfigured = cloneDeep(referencePoint);
    set(referencePointConfigured, UICONFIG, setBucketTitles(referencePoint, visualizationType, intl));
    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.LOCATION, "icon"], geoPushPinBucketIcon);
    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.SIZE, "icon"], geoPushPinBucketIcon);
    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.COLOR, "icon"], geoPushPinBucketIcon);
    set(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.SEGMENT, "icon"], geoPushPinBucketIcon);
    set(referencePointConfigured, [UICONFIG, OPEN_AS_REPORT, SUPPORTED], false);

    // only apply related bucket uiConfig
    set(referencePointConfigured, [UICONFIG, BUCKETS], {
        [BucketNames.LOCATION]: get(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.LOCATION]),
        [BucketNames.SIZE]: get(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.SIZE]),
        [BucketNames.COLOR]: get(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.COLOR]),
        [BucketNames.SEGMENT]: get(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.SEGMENT]),
        [BucketNames.FILTERS]: get(referencePointConfigured, [UICONFIG, BUCKETS, BucketNames.FILTERS]),
    });

    return referencePointConfigured;
}
