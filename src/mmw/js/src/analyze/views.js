"use strict";

var _ = require('lodash'),
    $ = require('jquery'),
    L = require('leaflet'),
    Marionette = require('../../shim/backbone.marionette'),
    App = require('../app'),
    models = require('./models'),
    windowTmpl = require('./templates/window.ejs'),
    headerTmpl = require('./templates/header.ejs'),
    detailsTmpl = require('./templates/details.ejs'),
    tableTmpl = require('./templates/table.ejs'),
    tableRowTmpl = require('./templates/tableRow.ejs'),
    tabPanelTmpl = require('./templates/tabPanel.ejs'),
    tabContentTmpl = require('./templates/tabContent.ejs'),
    chartTmpl = require('./templates/chart.ejs');

var AnalyzeWindow = Marionette.LayoutView.extend({
    tagName: 'div',
    id: 'analyze-output-wrapper',
    template: windowTmpl,

    collectionEvents: {
        'reset': 'showRegions'
    },

    regions: {
        headerRegion: '#analyze-header-region',
        detailsRegion: '#analyze-details-region'
    },

    onShow: function() {
        this.collection.fetch({
                // TODO: This is just being passed along for
                // demonstration purposes. In the future,
                // the analysis should be customized for the
                // area of interest.
                data: {
                    areaOfInterest: App.map.get('areaOfInterest')
                },
                reset: true
        });
    },

    showRegions: function() {
        this.headerRegion.show(new HeaderView({
            model: new models.AnalyzeModel({})
        }));
        this.detailsRegion.show(new DetailsView({
            collection: this.collection
        }));
    }
});

var HeaderView = Marionette.ItemView.extend({
    template: headerTmpl
});

var DetailsView = Marionette.LayoutView.extend({
    template: detailsTmpl,
    regions: {
        panelsRegion: '.tab-panels-region',
        contentRegion: '.tab-contents-region'
    },

    onShow: function() {
        this.panelsRegion.show(new TabPanelsView({
            collection: this.collection
        }));

        this.contentRegion.show(new TabContentsView({
            collection: this.collection
        }));
    }
});

var TabPanelView = Marionette.ItemView.extend({
    tagName: 'li',
    template: tabPanelTmpl,
    attributes: {
        role: 'presentation'
    }
});

var TabPanelsView = Marionette.CollectionView.extend({
    tagName: 'ul',
    className: 'nav nav-tabs',
    attributes: {
        role: 'tablist'
    },
    childView: TabPanelView,
    onRender: function() {
        this.$el.find('li:first').addClass('active');
    }
});

var TabContentView = Marionette.LayoutView.extend({
    className: 'tab-pane',
    id: function() {
        return this.model.get('name');
    },
    template: tabContentTmpl,
    attributes: {
        role: 'tabpanel'
    },

    regions: {
        tableRegion: '.analyze-table-region',
        chartRegion: '.analyze-chart-region'
    },

    onShow: function() {
        var categories = new models.LayerCategoryCollection(
                this.model.get('categories')
            );

        this.tableRegion.show(new TableView({
            collection: categories
        }));
    }
});

var TabContentsView = Marionette.CollectionView.extend({
    className: 'tab-content',
    childView: TabContentView,
    onRender: function() {
        this.$el.find('.tab-pane:first').addClass('active');
    }
});

var TableRowView = Marionette.ItemView.extend({
    tagName: 'tr',
    template: tableRowTmpl
});

var TableView = Marionette.CompositeView.extend({
    childView: TableRowView,
    childViewContainer: 'tbody',
    template: tableTmpl,
});

var ChartView = Marionette.ItemView.extend({
    template: chartTmpl
});

module.exports = {
    AnalyzeWindow: AnalyzeWindow
};
