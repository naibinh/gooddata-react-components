// (C) 2007-2018 GoodData Corporation
export function groupCategoriesWrapper(Highcharts: any) {

    const wrap = Highcharts.wrap;

    wrap(Highcharts.Axis.prototype, 'render', function(proceed: any) {

        // default behaviour
        proceed.apply(this, Array.prototype.slice.call(arguments, 1));

        if (this.labelsGrid) {
            // hide the grid (or border) that covers X axis
            this.labelsGrid.hide();
        }
    });

    wrap(Highcharts.Tick.prototype, 'addGroupedLabels', function(proceed: any) {

        // default behaviour
        proceed.apply(this, Array.prototype.slice.call(arguments, 1));

        if (this.parent) {
            // highcharts applies font-weight to first-level label under the hood, so it needs to be reset to 'normal'
            this.label.css({
                fontWeight: 'normal'
            });
            // should only apply font-weight to parent label
            this.parent.label.css({
                fontWeight: 'bold'
            });
        }
    });
}
