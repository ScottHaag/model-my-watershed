"use strict";

var $ = require('jquery'),
    _ = require('lodash'),
    Marionette = require('../../../../shim/backbone.marionette'),
    chart = require('../../../core/chart.js'),
    barChartTmpl = require('../../../core/templates/barChart.html'),
    selectorTmpl = require('./templates/selector.html'),
    resultTmpl = require('./templates/result.html'),
    tableTmpl = require('./templates/table.html'),
    utils = require('../../../core/utils.js'),
    constants = require('./constants');

var runoffVars = [
        { name: 'AvPrecipitation', display: 'Precip' },
        { name: 'AvEvapoTrans', display: 'ET' },
        { name: 'AvRunoff', display: 'Surface Runoff' },
        { name: 'AvGroundWater', display: 'Subsurface Flow' },
        { name: 'AvPtSrcFlow', display: 'Point Src Flow' },
        { name: 'AvStreamFlow', display: 'Stream Flow' },
    ],
    monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

var ResultView = Marionette.LayoutView.extend({
    className: 'tab-pane',

    template: resultTmpl,

    regions: {
        selectorRegion: '.runoff-selector-region',
        chartRegion: '.runoff-chart-region',
        tableRegion: '.runoff-table-region'
    },

    ui: {
        downloadCSV: '[data-action="download-csv"]',
        tooltip: 'a.model-results-tooltip',
        table: '.runoff-table-region'
    },

    events: {
        'click @ui.downloadCSV': 'downloadCSV'
    },

    modelEvents: {
        'change': 'onShow'
    },

    initialize: function(options) {
        this.compareMode = options.compareMode;
        this.scenario = options.scenario;

        this.model.set('activeVar', runoffVars[0].name);
    },

    onShow: function() {
        this.selectorRegion.reset();
        this.tableRegion.reset();
        this.chartRegion.reset();
        this.activateTooltip();

        if (this.model.get('result')) {
            if (!this.compareMode) {
                this.tableRegion.show(new TableView({
                    model: this.model,
                }));
            }

            this.selectorRegion.show(new SelectorView({
                model: this.model
            }));

            this.chartRegion.show(new ChartView({
                model: this.model,
                scenario: this.scenario,
                compareMode: this.compareMode
            }));
        }
    },

    onRender: function() {
        this.activateTooltip();
    },

    downloadCSV: function() {
        var prefix = 'mapshed_hydrology_',
            timestamp = new Date().toISOString(),
            filename = prefix + timestamp;

        this.ui.table.tableExport({ type: 'csv', fileName: filename });
    },

    activateTooltip: function() {
        this.ui.tooltip.popover({
            placement: 'top',
            trigger: 'focus'
        });
    }
});

var SelectorView = Marionette.ItemView.extend({
    template: selectorTmpl,

    ui: {
        runoffVarSelector: 'select'
    },

    events: {
        'change @ui.runoffVarSelector': 'updateRunoffVar'
    },

    modelEvents: {
        'change:activeVar': 'render'
    },

    updateRunoffVar: function() {
        var activeRunoffVar = this.ui.runoffVarSelector.val();
        this.model.set('activeVar', activeRunoffVar);
    },

    templateHelpers: function() {
        return {
            runoffVars: runoffVars
        };
    }
});

var ChartView = Marionette.ItemView.extend({
    template: barChartTmpl,
    className: 'chart-container runoff-chart-container',

    initialize: function(options) {
        this.scenario = options.scenario;
        this.compareMode = options.compareMode;
    },

    onAttach: function() {
        this.addChart();
    },

    addChart: function() {
        var chartEl = this.$el.find('.bar-chart').get(0),
            result = this.model.get('result'),
            activeVar = this.model.get('activeVar');

        $(chartEl).empty();

        if (result) {
            var data = [
                    {
                        key: _.findWhere(runoffVars, {name: activeVar}).display,
                        values: _.map(result.monthly, function(monthResult, monthInd) {
                            return {
                                x: monthInd,
                                y: Number(monthResult[activeVar])
                            };
                        })
                    }
                ],
                chartOptions = {
                    yAxisLabel: 'Water Depth (cm)',
                    yAxisUnit: 'cm',
                    xAxisLabel: function(xValue) {
                        return monthNames[xValue];
                    },
                    xTickValues: _.range(12),
                    margin: this.compareMode ?
                        {top: 20, right: 120, bottom: 40, left: 60} :
                        {top: 20, right: 20, bottom: 40, left: 60}
                };

            chart.renderLineChart(chartEl, data, chartOptions);
        }
    }

});

function monthSorter(a, b) {
    if (a.month < b.month) {
        return -1;
    } else if (a.month > b.month) {
        return 1;
    }
    return 0;
}

window.monthSorter = monthSorter;

function SumFormatter(data) {
    var field = this.field,
        total = _.sum(_.map(data, function(row) {
            return parseFloat(row[field]);
        }));

    return total.toFixed(2);
}
window.sumFormatter = SumFormatter;

var TableView = Marionette.CompositeView.extend({
    template: tableTmpl,

    onAttach: function() {
        $('[data-toggle="table"]').bootstrapTable();
    },

    templateHelpers: function() {
        var columnNames = ['Month'].concat(_.map(runoffVars, function(runoffVar) {
                return runoffVar.display;
            })),
            rows = _.map(this.model.get('result').monthly, function(month, i) {
                return [i].concat(_.map(runoffVars, function(runoffVar) {
                    return Number(month[runoffVar.name]);
                }));
            });

        return {
            columnNames: columnNames,
            rows: rows,
            monthNames: monthNames,
        };
    }
});

module.exports = {
    ResultView: ResultView
};
