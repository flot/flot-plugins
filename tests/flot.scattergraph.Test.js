/* eslint-disable */
/* global $, describe, it, xit, xdescribe, after, afterEach, expect*/

describe('A scatter graph', function () {
    'use strict';
    var minx = 0, maxx = 200, miny = 0, maxy = 100,
    series, ctx, plotWidth, plotHeight, plotOffset, placeholder, options;

    beforeEach(function () {
        placeholder = setFixtures('<div id="test-container" style="width: 200px;height: 100px;border-style: solid;border-width: 1px"><canvas id="theCanvas" style="width: 100%; height: 100%" /></div>')
        ctx = placeholder.find('#theCanvas')[0].getContext('2d');
        plotWidth = 200;
        plotHeight = 100;
        plotOffset = { top: 0, left: 0 };
        options = {
            grid: {show: false},
            xaxis: {show: false},
            yaxis: {show: false},
            series: {
                scattergraph: {
                    show: true
                }
            },
        };
        series = {
            xaxis: {
                min: minx,
                max: maxx,
                p2c: function(p) { return p; }
            },
            yaxis: {
                min: miny,
                max: maxy,
                p2c: function(p) { return p; }
            }
        };

    });

    it('should draw nothing when the graph is empty', function () {
        var plot = $.plot(placeholder, [[]], options);

        series.data = [];

        spyOn(ctx, 'moveTo').and.callThrough();
        spyOn(ctx, 'arc').and.callThrough();

        plot.hooks.processRawData.forEach(function (hook) {
            hook(plot, {points: [], xaxis: {options: {}}, yaxis: {options: {}}}, series.data, {points: []});
        });
        plot.hooks.drawSeries.forEach(function (hook) {
            hook(plot, ctx, series);
        });

        expect(ctx.moveTo).not.toHaveBeenCalled();
        expect(ctx.arc).not.toHaveBeenCalled();
    });
    it('should draw points for arrays of objects', function () {
        var plot = $.plot(placeholder, [[]], options);

        series.data = [[{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}, {x: 4, y: 5}, {x: 5, y: 6}]];

        spyOn(ctx, 'moveTo').and.callThrough();
        spyOn(ctx, 'arc').and.callThrough();

        plot.hooks.processRawData.forEach(function (hook) {
            hook(plot, {points: [], xaxis: {options: {}}, yaxis: {options: {}}}, series.data, {points: []});
        });
        plot.hooks.drawSeries.forEach(function (hook) {
            hook(plot, ctx, series);
        });

        expect(ctx.moveTo).toHaveBeenCalled();
        expect(ctx.arc).toHaveBeenCalled();
    });
    it('should draw lines & points for arrays of objects when drawLine is true', function () {
        options.series.scattergraph.drawLines = true;
        var plot = $.plot(placeholder, [[]], options);

        series.data = [[{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}, {x: 4, y: 5}, {x: 5, y: 6}]];

        spyOn(ctx, 'moveTo').and.callThrough();
        spyOn(ctx, 'lineTo').and.callThrough();
        spyOn(ctx, 'arc').and.callThrough();

        plot.hooks.processRawData.forEach(function (hook) {
            hook(plot, {points: [], xaxis: {options: {}}, yaxis: {options: {}}}, series.data, {points: []});
        });
        plot.hooks.drawSeries.forEach(function (hook) {
            hook(plot, ctx, series);
        });

        expect(ctx.moveTo).toHaveBeenCalled();
        expect(ctx.arc).toHaveBeenCalled();
    });
    it('should draw points for arrays of arrays', function () {
        var plot = $.plot(placeholder, [[]], options);

        series.data =[[[0,1], [1,2], [2,3], [3,4], [4,5], [5,6]]];

        spyOn(ctx, 'moveTo').and.callThrough();
        spyOn(ctx, 'arc').and.callThrough();

        plot.hooks.processRawData.forEach(function (hook) {
            hook(plot, {points: [], xaxis: {options: {}}, yaxis: {options: {}}}, series.data, {points: []});
        });
        plot.hooks.drawSeries.forEach(function (hook) {
            hook(plot, ctx, series);
        });

        expect(ctx.moveTo).toHaveBeenCalled();
        expect(ctx.arc).toHaveBeenCalled();
    });
    it('should draw points for object of arrays', function () {
        var plot = $.plot(placeholder, [[]], options);

        series.data = [{x: [0,1,2,3,4,5], y: [1,2,3,4,5,6]}];

        spyOn(ctx, 'moveTo').and.callThrough();
        spyOn(ctx, 'arc').and.callThrough();

        plot.hooks.processRawData.forEach(function (hook) {
            hook(plot, {points: [], xaxis: {options: {}}, yaxis: {options: {}}}, series.data, {points: []});
        });
        plot.hooks.drawSeries.forEach(function (hook) {
            hook(plot, ctx, series);
        });

        expect(ctx.moveTo).toHaveBeenCalled();
        expect(ctx.arc).toHaveBeenCalled();
    });
    it('should draw points for multiple series', function () {
        var plot = $.plot(placeholder, [[]], options);

        series.data = [{x: [0,1,2,3,4,5], y: [1,2,3,4,5,6]}];

        spyOn(ctx, 'moveTo').and.callThrough();
        spyOn(ctx, 'arc').and.callThrough();

        plot.hooks.processRawData.forEach(function (hook) {
            hook(plot, {points: [], xaxis: {options: {}}, yaxis: {options: {}}}, series.data, {points: []});
        });
        plot.hooks.drawSeries.forEach(function (hook) {
            hook(plot, ctx, series);
        });

        expect(ctx.moveTo.calls.count()).toEqual(6);
        expect(ctx.arc.calls.count()).toEqual(6);

        var plot = $.plot(placeholder, [[]], options);

        series.data = [{x: [0,1,2,3,4,5,6], y: [1,2,3,4,5,6,7]}, {x: [10,11,12,13,14,15], y: [11,12,13,14,15,16]}];

        plot.hooks.processRawData.forEach(function (hook) {
            hook(plot, {points: [], xaxis: {options: {}}, yaxis: {options: {}}}, series.data, {points: []});
        });
        plot.hooks.drawSeries.forEach(function (hook) {
            hook(plot, ctx, series);
        });

        expect(ctx.moveTo.calls.count()).toEqual(19);
        expect(ctx.arc.calls.count()).toEqual(19);
    });
    it('should not draw points for multiple series when show is false', function () {
        var plot = $.plot(placeholder, [[]], options);

        series.data = [{x: [0,1,2,3,4,5], y: [1,2,3,4,5,6]}, {x: [10,11,12,13,14,15], y: [11,12,13,14,15,16]}];
        series.scattergraph = {};
        series.scattergraph.show = false;

        spyOn(ctx, 'moveTo').and.callThrough();
        spyOn(ctx, 'arc').and.callThrough();

        plot.hooks.processRawData.forEach(function (hook) {
            hook(plot, {points: [], xaxis: {options: {}}, yaxis: {options: {}}}, series.data, {points: []});
        });
        plot.hooks.drawSeries.forEach(function (hook) {
            hook(plot, ctx, series);
        });

        expect(ctx.moveTo).not.toHaveBeenCalled();
        expect(ctx.arc).not.toHaveBeenCalled();
    });
    it('should draw points with colors for arrays of objects containing colors when lookup tables are not set', function () {
        var plot = $.plot(placeholder, [[]], options);

        series.data = [[{x: 1, y: 2, color: 1}, {x: 2, y: 3, color: 2}, {x: 3, y: 4, color: 3}, {x: 4, y: 5, color: 4}, {x: 5, y: 6, color: 5}]];

        spyOn(ctx, 'moveTo').and.callThrough();
        spyOn(ctx, 'arc').and.callThrough();
        const spy = spyOnProperty(ctx, 'strokeStyle', 'set');
        plot.hooks.processRawData.forEach(function (hook) {
            hook(plot, {points: [], xaxis: {options: {}}, yaxis: {options: {}}}, series.data, {points: []});
        });
        plot.hooks.drawSeries.forEach(function (hook) {
            hook(plot, ctx, series);
        });

        expect(ctx.moveTo).toHaveBeenCalled();
        expect(ctx.arc).toHaveBeenCalled();
        expect(spy).toHaveBeenCalled();
        expect(spy.calls.argsFor(0)).toEqual(['green']);
    });
    it('should draw points with colors for arrays of objects containing colors and shapes when lookup tables are not set', function () {
        var plot = $.plot(placeholder, [[]], options);

        series.data = [[{x: 1, y: 2, color: 1, shape: 1}, {x: 2, y: 3, color: 2, shape: 2}, {x: 3, y: 4, color: 3, shape: 3}, {x: 4, y: 5, color: 4, shape: 4}, {x: 5, y: 6, color: 5, shape: 5}]];

        spyOn(ctx, 'moveTo').and.callThrough();
        spyOn(ctx, 'lineTo').and.callThrough();
        spyOn(ctx, 'strokeRect').and.callThrough();
        spyOn(ctx, 'arc').and.callThrough();
        const spy = spyOnProperty(ctx, 'strokeStyle', 'set');
        plot.hooks.processRawData.forEach(function (hook) {
            hook(plot, {points: [], xaxis: {options: {}}, yaxis: {options: {}}}, series.data, {points: []});
        });
        plot.hooks.drawSeries.forEach(function (hook) {
            hook(plot, ctx, series);
        });

        expect(ctx.moveTo).toHaveBeenCalled();
        expect(ctx.lineTo).toHaveBeenCalled();
        expect(ctx.strokeRect).toHaveBeenCalled();
        expect(ctx.arc).not.toHaveBeenCalled();
        expect(spy).toHaveBeenCalled();
        expect(spy.calls.argsFor(0)).toEqual(['green']);
    });
    it('should fill points with colors for arrays of objects containing colors and shapes when lookup tables are not set', function () {
        options.series.scattergraph.filled = true;
        var plot = $.plot(placeholder, [[]], options);

        series.data = [[{x: 1, y: 2, color: 1, shape: 1}, {x: 2, y: 3, color: 2, shape: 2}, {x: 3, y: 4, color: 3, shape: 3}, {x: 4, y: 5, color: 4, shape: 4}, {x: 5, y: 6, color: 5, shape: 5}]];

        spyOn(ctx, 'moveTo').and.callThrough();
        spyOn(ctx, 'lineTo').and.callThrough();
        spyOn(ctx, 'fillRect').and.callThrough();
        spyOn(ctx, 'arc').and.callThrough();
        const spy = spyOnProperty(ctx, 'strokeStyle', 'set');
        plot.hooks.processRawData.forEach(function (hook) {
            hook(plot, {points: [], xaxis: {options: {}}, yaxis: {options: {}}}, series.data, {points: []});
        });
        plot.hooks.drawSeries.forEach(function (hook) {
            hook(plot, ctx, series);
        });

        expect(ctx.moveTo).toHaveBeenCalled();
        expect(ctx.lineTo).toHaveBeenCalled();
        expect(ctx.fillRect).toHaveBeenCalled();
        expect(ctx.arc).not.toHaveBeenCalled();
        expect(spy).toHaveBeenCalled();
        expect(spy.calls.argsFor(0)).toEqual(['green']);
    });
    it('should draw points with colors for arrays of objects containing colors, shapes & sizes when lookup tables are not set', function () {
        var plot = $.plot(placeholder, [[]], options);

        series.data = [[{x: 1, y: 2, color: 1, shape: 1, size: 2}, {x: 2, y: 3, color: 2, shape: 2, size: 3}, {x: 3, y: 4, color: 3, shape: 3, size: 4}, {x: 4, y: 5, color: 4, shape: 4, size: 5}, {x: 5, y: 6, color: 5, shape: 5, size: 6}]];

        spyOn(ctx, 'moveTo').and.callThrough();
        spyOn(ctx, 'lineTo').and.callThrough();
        spyOn(ctx, 'strokeRect').and.callThrough();
        spyOn(ctx, 'arc').and.callThrough();
        const spy = spyOnProperty(ctx, 'strokeStyle', 'set');
        plot.hooks.processRawData.forEach(function (hook) {
            hook(plot, {points: [], xaxis: {options: {}}, yaxis: {options: {}}}, series.data, {points: []});
        });
        plot.hooks.drawSeries.forEach(function (hook) {
            hook(plot, ctx, series);
        });

        expect(ctx.moveTo).toHaveBeenCalled();
        expect(ctx.lineTo).toHaveBeenCalled();
        expect(ctx.strokeRect).toHaveBeenCalledWith(-0.5, 0.5, 3, 3);
        expect(ctx.arc).not.toHaveBeenCalled();
        expect(spy).toHaveBeenCalled();
        expect(spy.calls.argsFor(0)).toEqual(['green']);
    });
    it('should draw points with colors for arrays of objects containing colors from a lookup table', function () {
        options.series.scattergraph.colors = JSON.stringify([
            {value: 1, color: 'red', visible: true},
            {value: 2, color: 'green', visible: true},
            {value: 3, color: 'blue', visible: true},
            {value: 4, color: 'cyan', visible: true},
            {value: 5, color: 'yellow', visible: true}
        ]);
        var plot = $.plot(placeholder, [[]], options);
        series.data = [[{x: 1, y: 2, color: 1}, {x: 2, y: 3, color: 2}, {x: 3, y: 4, color: 3}, {x: 4, y: 5, color: 4}, {x: 5, y: 6, color: 5}]];

        spyOn(ctx, 'moveTo').and.callThrough();
        spyOn(ctx, 'arc').and.callThrough();
        const spy = spyOnProperty(ctx, 'strokeStyle', 'set');
        plot.hooks.processRawData.forEach(function (hook) {
            hook(plot, {points: [], xaxis: {options: {}}, yaxis: {options: {}}}, series.data, {points: []});
        });
        plot.hooks.drawSeries.forEach(function (hook) {
            hook(plot, ctx, series);
        });

        expect(ctx.moveTo).toHaveBeenCalled();
        expect(ctx.arc).toHaveBeenCalled();
        expect(spy).toHaveBeenCalled();
        expect(spy.calls.argsFor(0)).toEqual(['red']);
        expect(spy.calls.argsFor(1)).toEqual(['green']);
        expect(spy.calls.argsFor(2)).toEqual(['blue']);
        expect(spy.calls.argsFor(3)).toEqual(['cyan']);
        expect(spy.calls.argsFor(4)).toEqual(['yellow']);
    });
    it('should draw points with colors and shapes for arrays of objects containing colors and shapes from lookup tables', function () {
        options.series.scattergraph.colors = JSON.stringify([
            {value: 1, color: 'red', visible: true},
            {value: 2, color: 'green', visible: true},
            {value: 3, color: 'blue', visible: true},
            {value: 4, color: 'cyan', visible: true},
            {value: 5, color: 'yellow', visible: true}
        ]);
        options.series.scattergraph.shapes = JSON.stringify([
            {value: 1, shape: 'triangle_n', visible: true},
            {value: 2, shape: 'triangle_e', visible: true},
            {value: 3, shape: 'diamond', visible: true},
            {value: 4, shape: 'asterisk', visible: true},
            {value: 5, shape: 'cross_v', visible: true}
        ]);
        var plot = $.plot(placeholder, [[]], options);
        series.data = [[{x: 1, y: 2, color: 1, shape: 1}, {x: 2, y: 3, color: 2, shape: 2}, {x: 3, y: 4, color: 3, shape: 3}, {x: 4, y: 5, color: 4, shape: 4}, {x: 5, y: 6, color: 5, shape: 5}]];

        spyOn(ctx, 'moveTo').and.callThrough();
        spyOn(ctx, 'lineTo').and.callThrough();
        spyOn(ctx, 'arc').and.callThrough();
        const spy = spyOnProperty(ctx, 'strokeStyle', 'set');
        plot.hooks.processRawData.forEach(function (hook) {
            hook(plot, {points: [], xaxis: {options: {}}, yaxis: {options: {}}}, series.data, {points: []});
        });
        plot.hooks.drawSeries.forEach(function (hook) {
            hook(plot, ctx, series);
        });

        expect(ctx.moveTo).toHaveBeenCalledWith(1, -0.16506350946109638);
        expect(ctx.lineTo).toHaveBeenCalledWith(-1.5, 4.165063509461096);
        expect(ctx.lineTo).toHaveBeenCalledWith(3.5, 4.165063509461096);
        expect(ctx.lineTo).toHaveBeenCalledWith(1, -0.16506350946109638);
        expect(ctx.arc).not.toHaveBeenCalled();
        expect(spy).toHaveBeenCalled();
    });
    it('should draw points with colors, shapes and sizes for arrays of objects containing colors, shapes and sizes from lookup tables', function () {
        options.series.scattergraph.colors = JSON.stringify([
            {value: 1, color: 'red', visible: true},
            {value: 2, color: 'green', visible: true},
            {value: 3, color: 'blue', visible: true},
            {value: 4, color: 'cyan', visible: true},
            {value: 5, color: 'yellow', visible: true}
        ]);
        options.series.scattergraph.shapes = JSON.stringify([
            {value: 1, shape: 'triangle_n', visible: true},
            {value: 2, shape: 'triangle_e', visible: true},
            {value: 3, shape: 'diamond', visible: true},
            {value: 4, shape: 'asterisk', visible: true},
            {value: 5, shape: 'cross_v', visible: true}
        ]);
        options.series.scattergraph.sizes = JSON.stringify([
            {value: 1, size: 80, visible: true},
            {value: 2, size: 81, visible: true},
            {value: 3, size: 82, visible: true},
            {value: 4, size: 83, visible: true},
            {value: 5, size: 84, visible: true}
        ]);
        var plot = $.plot(placeholder, [[]], options);
        series.data = [[{x: 1, y: 2, color: 1, shape: 1, size: 2}, {x: 2, y: 3, color: 2, shape: 2, size: 3}, {x: 3, y: 4, color: 3, shape: 3, size: 4}, {x: 4, y: 5, color: 4, shape: 4, size: 5}, {x: 5, y: 6, color: 5, shape: 5, size: 6}]];

        spyOn(ctx, 'moveTo').and.callThrough();
        spyOn(ctx, 'lineTo').and.callThrough();
        spyOn(ctx, 'arc').and.callThrough();
        const spy = spyOnProperty(ctx, 'strokeStyle', 'set');
        plot.hooks.processRawData.forEach(function (hook) {
            hook(plot, {points: [], xaxis: {options: {}}, yaxis: {options: {}}}, series.data, {points: []});
        });
        plot.hooks.drawSeries.forEach(function (hook) {
            hook(plot, ctx, series);
        });

        expect(ctx.moveTo).toHaveBeenCalledWith(1, 2);
        expect(ctx.lineTo).toHaveBeenCalledWith(-39.5, 37.074028853269766);
        expect(ctx.lineTo).toHaveBeenCalledWith(41.5, 37.074028853269766);
        expect(ctx.lineTo).toHaveBeenCalledWith(1, -33.074028853269766);
        expect(ctx.arc).not.toHaveBeenCalled();
        expect(spy).toHaveBeenCalled();
    });
    it('should draw points with colors for arrays of objects containing colors from a lookup function', function () {
        var usageObj = {
            colorLookupFunc: function (value) {
                var ret = 'red';
                switch (value) {
                    case 1:
                        ret = '#123456';
                        break;
                    case 2:
                        ret = '#234567';
                        break;
                    case 3:
                        ret = '#345678';
                        break;
                    case 4:
                        ret = '#456789';
                        break;
                    case 5:
                        ret = '#567890';
                        break;
                }

                return ret;
            }
        };

        options.series.scattergraph.colors = spyOn(usageObj, 'colorLookupFunc').and.callThrough();
        var plot = $.plot(placeholder, [[]], options);
        series.data = [[{x: 1, y: 2, color: 1}, {x: 2, y: 3, color: 2}, {x: 3, y: 4, color: 3}, {x: 4, y: 5, color: 4}, {x: 5, y: 6, color: 5}]];
        plot.hooks.processRawData.forEach(function (hook) {
            hook(plot, {points: [], xaxis: {options: {}}, yaxis: {options: {}}}, series.data, {points: []});
        });
        plot.hooks.drawSeries.forEach(function (hook) {
            hook(plot, ctx, series);
        });

        expect(usageObj.colorLookupFunc).toHaveBeenCalledWith(1);
        expect(usageObj.colorLookupFunc).toHaveBeenCalledWith(2);
        expect(usageObj.colorLookupFunc).toHaveBeenCalledWith(3);
        expect(usageObj.colorLookupFunc).toHaveBeenCalledWith(4);
        expect(usageObj.colorLookupFunc).toHaveBeenCalledWith(5);
    });
    it('should draw points with shapes for arrays of objects containing shapes from a lookup function', function () {
        var usageObj = {
            shapeLookupFunc: function (value) {
                var ret = {color: 'circle', visible: true};
                switch (value) {
                    case 1:
                        ret = 'square';
                        break;
                    case 2:
                        ret = 'diamond';
                        break;
                    case 3:
                        ret = 'asterisk';
                        break;
                    case 4:
                        ret = 'cross_v';
                        break;
                    case 5:
                        ret = 'cross_d';
                        break;
                }

                return ret;
            }
        };

        options.series.scattergraph.shapes = spyOn(usageObj, 'shapeLookupFunc').and.callThrough();;
        var plot = $.plot(placeholder, [[]], options);
        series.data = [[{x: 1, y: 2, color: 1, shape: 1}, {x: 2, y: 3, color: 2, shape: 2}, {x: 3, y: 4, color: 3, shape: 3}, {x: 4, y: 5, color: 4, shape: 4}, {x: 5, y: 6, color: 5, shape: 5}]];

        plot.hooks.processRawData.forEach(function (hook) {
            hook(plot, {points: [], xaxis: {options: {}}, yaxis: {options: {}}}, series.data, {points: []});
        });
        plot.hooks.drawSeries.forEach(function (hook) {
            hook(plot, ctx, series);
        });

        expect(usageObj.shapeLookupFunc).toHaveBeenCalledWith(1);
        expect(usageObj.shapeLookupFunc).toHaveBeenCalledWith(2);
        expect(usageObj.shapeLookupFunc).toHaveBeenCalledWith(3);
        expect(usageObj.shapeLookupFunc).toHaveBeenCalledWith(4);
        expect(usageObj.shapeLookupFunc).toHaveBeenCalledWith(5);
    });
    it('should draw points with sizes for arrays of objects containing sizes from a lookup function', function () {
        var usageObj = {
            sizeLookupFunc: function (value) {
                var ret = 1;
                switch (value) {
                    case 1:
                        ret = 2;
                        break;
                    case 2:
                        ret = 3;
                        break;
                    case 3:
                        ret = 4;
                        break;
                    case 4:
                        ret = 5;
                        break;
                    case 5:
                        ret = 6;
                        break;
                }

                return ret;
            }
        };

        options.series.scattergraph.sizes = spyOn(usageObj, 'sizeLookupFunc').and.callThrough();;
        var plot = $.plot(placeholder, [[]], options);
        series.data = [[{x: 1, y: 2, color: 1, shape: 1, size: 2}, {x: 2, y: 3, color: 2, shape: 2, size: 3}, {x: 3, y: 4, color: 3, shape: 3, size: 4}, {x: 4, y: 5, color: 4, shape: 4, size: 5}, {x: 5, y: 6, color: 5, shape: 5, size: 6}]];

        plot.hooks.processRawData.forEach(function (hook) {
            hook(plot, {points: [], xaxis: {options: {}}, yaxis: {options: {}}}, series.data, {points: []});
        });
        plot.hooks.drawSeries.forEach(function (hook) {
            hook(plot, ctx, series);
        });

        expect(usageObj.sizeLookupFunc).toHaveBeenCalledWith(2);
        expect(usageObj.sizeLookupFunc).toHaveBeenCalledWith(3);
        expect(usageObj.sizeLookupFunc).toHaveBeenCalledWith(4);
        expect(usageObj.sizeLookupFunc).toHaveBeenCalledWith(5);
        expect(usageObj.sizeLookupFunc).toHaveBeenCalledWith(6);
    });
    it('should find nearby items', () => {
        var items = [];
        var plot = $.plot(placeholder, [[]], options);

        series.data = [[{x: 1, y: 2, color: 1, shape: 1, size: 2}, {x: 2, y: 3, color: 2, shape: 2, size: 3}, {x: 2.3, y: 3.3, color: 2, shape: 2, size: 3}, {x: 3, y: 4, color: 3, shape: 3, size: 4}, {x: 4, y: 5, color: 4, shape: 4, size: 5}, {x: 5, y: 6, color: 5, shape: 5, size: 6}]];
        series.datapoints =  {};
        plot.hooks.processRawData.forEach(function (hook) {
            hook(plot, {points: [], xaxis: {options: {}}, yaxis: {options: {}}}, series.data, series.datapoints);
        });
        plot.hooks.findNearbyItems.forEach(function (hook) {
            hook(plot, 2, 3, [series], 0, 1, undefined, items);
        });
        expect(items.length).toEqual(2);
        let index = series.data[0].findIndex((i) => {
            return i.x == items[0].datapoint[0] && i.y === items[0].datapoint[1];
        });
        expect(index).toEqual(1);
        index = series.data[0].findIndex((i) => {
            return i.x == items[1].datapoint[0] && i.y === items[1].datapoint[1];
        });
        expect(index).toEqual(2);
    });
    it('should clip points on axis min and max', function() {
        var plot = $.plot(placeholder, [[]], options);

        series.data = [[{x: 1, y: 2}, {x: 2, y: 3}, {x: 3, y: 4}, {x: 4, y: 5}, {x: 5, y: 6}]];

        spyOn(ctx, 'rect').and.callThrough();
        spyOn(ctx, 'clip').and.callThrough();

        plot.hooks.processRawData.forEach(function (hook) {
            hook(plot, {points: [], xaxis: {options: {}}, yaxis: {options: {}}}, series.data, {points: []});
        });
        plot.hooks.drawSeries.forEach(function (hook) {
            hook(plot, ctx, series);
        });

        expect(ctx.rect).toHaveBeenCalled();
        expect(ctx.clip).toHaveBeenCalled();
    });
});