/* global $, describe, it, xit, after, beforeEach, afterEach, expect, jasmine */
/* jshint browser: true*/

describe("Cursors snapping", function () {
    'use strict';

    var sampledata = [[0, 1], [1, 1.1], [2, 1.2]];
    var sampledata2 = [[0, 2], [1, 2.1], [2, 2.2]];
    var sampledatav2 = [[0, 1], [1, 2.1], [2, 1.2]];
    var sampledata2v2 = [[0, 2], [1, 0.9], [2, 2.2]];
    var outOfViewData = [[-2, -11], [-1, -10]];
    var outOfViewDatav2 = [[12, 11], [11, 10]];

    var plot;
    var placeholder;

    beforeAll(function () {
        loadDragSimulators();
    });

    beforeEach(function () {
        var fixture = setFixtures('<div id="demo-container" style="width: 800px;height: 600px">').find('#demo-container').get(0);

        placeholder = $('<div id="placeholder" style="width: 100%;height: 100%">');
        placeholder.appendTo(fixture);
        jasmine.clock().install();
    });

    afterEach(function () {
        plot.shutdown();
        $('#placeholder').empty();
        jasmine.clock().uninstall();
    });

    it('should not snap to a plot by default', function () {
        plot = $.plot("#placeholder", [sampledata], {
            xaxis: { autoScale: 'none', min: 0, max: 2 },
            yaxis: { autoScale: 'none', min: 0, max: 2 },
            cursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue',
                    position: { x: 1, y: 1 }
                }
            ]
        });

        jasmine.clock().tick(20);

        var cursor = plot.getCursors()[0];
        var pos = plot.p2c({ x: 1, y: 1 });

        expect(cursor.x).toBe(pos.left);
        expect(cursor.y).toBe(pos.top);
        expect(cursor.position.relativeX).toBeCloseTo(pos.left / plot.width());
        expect(cursor.position.relativeY).toBeCloseTo(pos.top / plot.height());
    });

    it('should be able to snap to a plot', function () {
        plot = $.plot("#placeholder", [sampledata], {
            cursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue',
                    position: { x: 1, y: 0 },
                    snapToPlot: 0
                }
            ]
        });

        jasmine.clock().tick(20);

        var cursor = plot.getCursors()[0];
        var pos = plot.p2c({ x: 1, y: 1.1 });

        expect(cursor.x).toBe(pos.left);
        expect(cursor.y).toBe(pos.top);
        expect(cursor.position.relativeX).toBeCloseTo(pos.left / plot.width());
        expect(cursor.position.relativeY).toBeCloseTo(pos.top / plot.height());
    });

    it('should be able to snap to a specific plot', function () {
        plot = $.plot("#placeholder", [sampledata, sampledata2], {
            cursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue',
                    position: { x: 1, y: 0 },
                    snapToPlot: 1
                }
            ]
        });

        jasmine.clock().tick(20);

        var cursor = plot.getCursors()[0];
        var pos = plot.p2c({ x: 1, y: 2.1 });

        expect(cursor.x).toBe(pos.left);
        expect(cursor.y).toBe(pos.top);
    });

    it('should be able to snap to a dynamic plot', function () {
        plot = $.plot("#placeholder", [sampledata], {
            cursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue',
                    position: { x: 1, y: 0 },
                    snapToPlot: 0
                }
            ]
        });

        var updateChart = function () {
            plot.setData([sampledata2]);
            plot.setupGrid();
            plot.draw();
        };

        jasmine.clock().tick(20);

        var cursor = plot.getCursors()[0];
        var pos = plot.p2c({ x: 1, y: 1.1 });

        expect(cursor.x).toBe(pos.left);
        expect(cursor.y).toBe(pos.top);

        updateChart();
        jasmine.clock().tick(20);

        pos = plot.p2c({ x: 1, y: 2.1 });

        expect(cursor.x).toBe(pos.left);
        expect(cursor.y).toBe(pos.top);
    });

    it('should not limit the snap to range of the plot area', function () {
        plot = $.plot("#placeholder", [outOfViewData], {
            cursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue',
                    position: { x: 5, y: 5 },
                    snapToPlot: 0
                }
            ],
            xaxis: { autoScale: 'none', min: 0, max: 10 },
            yaxis: { autoScale: 'none', min: 0, max: 10 }
        });

        var updateChart = function () {
            plot.setData([outOfViewDatav2]);
            plot.setupGrid();
            plot.draw();
        };

        jasmine.clock().tick(20);

        var cursor = plot.getCursors()[0];
        var pos = plot.p2c({ x: -1, y: -10 });

        expect(cursor.x).toBe(pos.left);
        expect(cursor.y).toBe(pos.top);

        updateChart();
        jasmine.clock().tick(20);

        pos = plot.p2c({ x: 11, y: 10 });

        expect(cursor.x).toBe(pos.left);
        expect(cursor.y).toBe(pos.top);
    });

    it('should not snap when there is no data', function () {
        plot = $.plot("#placeholder", [[]], {
            cursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue',
                    position: { x: 5, y: 5 },
                    snapToPlot: -1
                }
            ],
            xaxis: { autoScale: 'none', min: 0, max: 10 },
            yaxis: { autoScale: 'none', min: 0, max: 10 }
        });

        jasmine.clock().tick(20);

        var cursor = plot.getCursors()[0];
        var pos = plot.p2c({ x: 5, y: 5 });

        expect(cursor.x).toBe(pos.left);
        expect(cursor.y).toBe(pos.top);
    });

    it('should use the default x and y axes when there is no data to snap to', function () {
        plot = $.plot("#placeholder", [[]], {
            cursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue',
                    position: { relativeX: 0.5, relativeY: 0.5 },
                    snapToPlot: -1,
                    defaultxaxis: 2,
                    defaultyaxis: 2
                }
            ],
            xaxes: [
                { autoScale: 'none', min: 0, max: 10 },
                { autoScale: 'none', min: 0, max: 100, show: true }
            ],
            yaxes: [
                { autoScale: 'none', min: 0, max: 10 },
                { autoScale: 'none', min: 0, max: 100, show: true }
            ]
        });

        jasmine.clock().tick(20);

        var cursor = plot.getCursors()[0];

        expect(cursor.x).toBeCloseTo(plot.getXAxes()[1].p2c(50), 2);
        expect(cursor.y).toBeCloseTo(plot.getYAxes()[1].p2c(50), 2);
    });

    it('should not snap when there is no data and requested to snap to a specific plot', function () {
        plot = $.plot("#placeholder", [[]], {
            cursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue',
                    position: { relativeX: 0.5, relativeY: 0.6 },
                    snapToPlot: 0,
                    defaultxaxis: 2,
                    defaultyaxis: 2
                }
            ],
            xaxes: [
                { autoScale: 'none', min: 0, max: 10 },
                { autoScale: 'none', min: 0, max: 100, show: true }
            ],
            yaxes: [
                { autoScale: 'none', min: 0, max: 10 },
                { autoScale: 'none', min: 0, max: 100, show: true }
            ]
        });

        jasmine.clock().tick(20);

        var cursor = plot.getCursors()[0];

        expect(cursor.x).toBeCloseTo(plot.getXAxes()[1].p2c(50), 2);
        expect(cursor.y).toBeCloseTo(plot.getYAxes()[1].p2c(40), 2);
    });

    [undefined, NaN, -2].forEach(function (value) {
        it('should not snap when snapToPlot is ' + value, function () {
            plot = $.plot("#placeholder", [sampledata], {
                cursors: [
                    {
                        name: 'Blue cursor',
                        color: 'blue',
                        position: { relativeX: 0.5, relativeY: 0.5 },
                        snapToPlot: value
                    }
                ],
                xaxis: { autoScale: 'none', min: 0, max: 10 },
                yaxis: { autoScale: 'none', min: 0, max: 10 }
            });

            jasmine.clock().tick(20);

            var cursor = plot.getCursors()[0];

            expect(cursor.x).toBeCloseTo(plot.getXAxes()[0].p2c(5), 2);
            expect(cursor.y).toBeCloseTo(plot.getYAxes()[0].p2c(5), 2);
        });
    });

    it('should be able to snap to any plot when the cursor is created with coords relative to canvas', function () {
        plot = $.plot("#placeholder", [sampledata, sampledata2], {
            cursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue',
                    position: {
                        relativeX: 0.5,
                        relativeY: 0.75
                    },
                    snapToPlot: -1
                }
            ]
        });
        jasmine.clock().tick(20);

        var cursor = plot.getCursors()[0];
        var pos = plot.p2c({ x: 1, y: 1.1 });
        expect(cursor.x).toBe(pos.left);
        expect(cursor.y).toBe(pos.top);

        plot.setData([sampledatav2, sampledata2v2]);
        plot.setupGrid();
        plot.draw();

        jasmine.clock().tick(20);
        pos = plot.p2c({ x: 1, y: 0.9 });
        expect(cursor.x).toBeCloseTo(pos.left, 2);
        expect(cursor.y).toBeCloseTo(pos.top, 2);
        expect(cursor.position.x).toBeCloseTo(1);
        expect(cursor.position.y).toBeCloseTo(0.9);
    });

    it('should be able to snap to any plot when the cursor is created with coords relative to axes', function () {
        plot = $.plot("#placeholder", [sampledata, sampledata2], {
            cursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue',
                    position: { x: 1, y: 1 },
                    snapToPlot: -1
                }
            ]
        });
        jasmine.clock().tick(20);

        var cursor = plot.getCursors()[0];
        var pos = plot.p2c({ x: 1, y: 1.1 });
        expect(cursor.x).toBe(pos.left);
        expect(cursor.y).toBe(pos.top);

        plot.setData([sampledatav2, sampledata2v2]);
        plot.setupGrid();
        plot.draw();

        jasmine.clock().tick(20);
        pos = plot.p2c({ x: 1, y: 0.9 });
        expect(cursor.x).toBeCloseTo(pos.left, 2);
        expect(cursor.y).toBeCloseTo(pos.top, 2);
        expect(cursor.position.relativeX).toBeCloseTo(pos.left / plot.width());
        expect(cursor.position.relativeY).toBeCloseTo(pos.top / plot.height());
    });

    it('should be possible to change it to snap to a different plot', function () {
        plot = $.plot("#placeholder", [sampledata, sampledata2], {
            cursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue',
                    position: { x: 1, y: 0 },
                    snapToPlot: 0
                }
            ]
        });

        jasmine.clock().tick(20);

        var cursor = plot.getCursors()[0];
        var pos = plot.p2c({ x: 1, y: 1.1 });

        expect(cursor.x).toBe(pos.left);
        expect(cursor.y).toBe(pos.top);

        plot.setCursor(cursor, {
            snapToPlot: 1
        });

        jasmine.clock().tick(20);

        pos = plot.p2c({ x: 1, y: 2.1 });

        expect(cursor.x).toBe(pos.left);
        expect(cursor.y).toBe(pos.top);
    });

    it('should stay at the set position when no data is available at the requested x position', function () {
        plot = $.plot("#placeholder", [sampledata, sampledata2], {
            cursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue',
                    position: { x: 1, y: 0 },
                    snapToPlot: 1
                }
            ]
        });

        jasmine.clock().tick(20);

        var cursor = plot.getCursors()[0];
        var pos = plot.p2c({ x: 1, y: 2.1 });

        expect(cursor.x).toBe(pos.left);
        expect(cursor.y).toBe(pos.top);

        plot.setCursor(cursor, { snapToPlot: 0 });

        jasmine.clock().tick(20);

        pos = plot.p2c({ x: 1, y: 1.1 });

        expect(cursor.x).toBe(pos.left);
        expect(cursor.y).toBe(pos.top);
    });

    it('should snap on the closest position on mouse up', function() {
        plot = $.plot("#placeholder", [sampledata], {
            cursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue',
                    position: { relativeX: 0.2, relativeY: 0.1 }
                }
            ]
        });

        var plotOffset = plot.getPlotOffset(),
            cursorX = plotOffset.left + plot.width() * 0.5,
            cursorY = plotOffset.top + plot.height() * 0.6,
            cursor = plot.getCursors()[0];

        cursor.selected = true;
        cursor.dragmode = 'xy';

        jasmine.clock().tick(20);

        var options = { mouseX: cursorX, mouseY: cursorY };
        $('.flot-overlay').simulate("flotdragstart", options);
        $('.flot-overlay').simulate("flotdragend", options);

        expect(cursor.x).toBeCloseTo(0.5 * plot.width(), -1);
        expect(cursor.y).toBeCloseTo(0.6 * plot.height(), -1);
    });
});
