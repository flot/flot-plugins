/* global $, describe, it, xit, after, beforeEach, afterEach, expect, jasmine */
/* jshint browser: true*/

describe('Cursors Position', function () {
    'use strict';

    var sampledata = [[0, 1], [1, 1.1], [2, 1.2]];
    var sampledata2 = [[0, 2], [1, 2.1], [2, 2.2]];
    var sampledata3 = [[0, 20], [10, 19], [15, 18]];

    var plot;
    var placeholder;

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

    it('should be possible to position the vertical cursor relative to the canvas', function () {
        plot = $.plot("#placeholder", [sampledata2], {
            rangecursors: [
                {
                    name: 'Blue cursor',
                    orientation: 'vertical',
                    color: 'blue',
                    position: {
                        relativeXStart: 0.5,
                        relativeXEnd: 0.75
                    }
                }
            ]
        });

        jasmine.clock().tick(20);

        var cursors = plot.getRangeCursors();
        expect(cursors.length).toBe(1);
        expect(cursors[0].xstart).toBe(0.5 * plot.width());
        expect(cursors[0].xend).toBe(0.75 * plot.width());
    });

    it('should be possible to position the horizontal cursor relative to the canvas', function () {
        plot = $.plot("#placeholder", [sampledata2], {
            rangecursors: [
                {
                    name: 'Blue cursor',
                    orientation: 'horizontal',
                    color: 'blue',
                    position: {
                        relativeYStart: 0.5,
                        relativeYEnd: 0.75
                    }
                }
            ]
        });

        jasmine.clock().tick(20);

        var cursors = plot.getRangeCursors();
        expect(cursors.length).toBe(1);
        expect(cursors[0].ystart).toBe(0.5 * plot.height());
        expect(cursors[0].yend).toBe(0.75 * plot.height());
    });

    it('Cursors positioned relative to the canvas should be constrained by the canvas size', function () {
        plot = $.plot("#placeholder", [sampledata2], {
            rangecursors: [
                {
                    name: 'Blue cursor',
                    orientation: 'vertical',
                    color: 'blue',
                    position: {
                        relativeXStart: -30,
                        relativeXEnd: -40
                    }
                }
            ]
        });

        jasmine.clock().tick(20);
        var cursors = plot.getRangeCursors();
        expect(cursors.length).toBe(1);
        expect(cursors[0].xstart).toBe(0);
        expect(cursors[0].xend).toBe(plot.width());
    });

    it('should be possible to position the cursor relative to the axes', function () {
        plot = $.plot("#placeholder", [sampledata2], {
            rangecursors: [
                {
                    name: 'Blue cursor',
                    orientation: 'vertical',
                    color: 'blue',
                    position: {
                        xstart: 1,
                        xend: 2
                    }
                }
            ]
        });

        jasmine.clock().tick(20);

        var pos1 = plot.p2c({
            x: 1,
            y: 0
        });
        var pos2 = plot.p2c({
            x: 2,
            y: 0
        });
        var expectedStart = pos1.left;
        var expectedEnd = pos2.left;
        var cursors = plot.getRangeCursors();
        expect(cursors.length).toBe(1);
        expect(cursors[0].xstart).toBe(expectedStart);
        expect(cursors[0].xend).toBe(expectedEnd);
    });

    it('should be possible to position the cursor relative to any of the axes when having multiple ones', function () {
        plot = $.plot("#placeholder", [
            { data: sampledata, xaxis: 1, yaxis: 1 },
            { data: sampledata3, xaxis: 2, yaxis: 2 }
        ],
        {
            rangecursors: [
                {
                    name: 'Blue cursor',
                    orientation: 'vertical',
                    color: 'blue',
                    position: { xstart: 1, xend: 1.1 }
                },
                {
                    name: 'Red cursor',
                    orientation: 'horizontal',
                    color: 'red',
                    position: { ystart: 18.5, yend: 19.5 },
                    defaultxaxis: 2,
                    defaultyaxis: 2
                }
            ],
            xaxes: [
                { position: 'bottom' },
                { position: 'top' }
            ],
            yaxes: [
                { position: 'left' },
                { position: 'right' }
            ]
        });

        jasmine.clock().tick(20);

        var pos1a = plot.p2c({
            x: 1,
            y: 0
        });

        var pos1b = plot.p2c({
            x: 1.1,
            y: 0
        });

        var pos2a = plot.p2c({
            x2: 0,
            y2: 18.5
        });

        var pos2b = plot.p2c({
            x2: 0,
            y2: 19.5
        });

        var expectedStart1 = pos1a.left;
        var expectedEnd1 = pos1b.left;
        var expectedStart2 = pos2a.top;
        var expectedEnd2 = pos2b.top;
        var cursors = plot.getRangeCursors();
        expect(cursors.length).toBe(2);
        expect(cursors[0].xstart).toBe(expectedStart1);
        expect(cursors[0].xend).toBe(expectedEnd1);
        expect(cursors[1].ystart).toBe(expectedStart2);
        expect(cursors[1].yend).toBe(expectedEnd2);
    });

    it('should not change on plot zoom', function () {
        plot = $.plot("#placeholder", [sampledata2], {
            rangecursors: [
                {
                    name: 'Blue cursor',
                    orientation: 'vertical',
                    color: 'blue',
                    position: {
                        relativeXStart: 0.5,
                        relativeXEnd: 0.75
                    }
                }
            ]
        });

        var axesPosition1 = plot.c2p({
            left: 0.5 * plot.width(),
            top: 0
        });

        var axesPosition2 = plot.c2p({
            left: 0.75 * plot.width(),
            top: 0
        });

        jasmine.clock().tick(20);

        plot.zoom({ amount: 0.7, center: { left: plot.width() * 0.75, top: plot.height() * 0.75 } });

        jasmine.clock().tick(20);

        var pos1 = plot.p2c({
            x: axesPosition1.x,
            y: 0
        });
        var pos2 = plot.p2c({
            x: axesPosition2.x,
            y: 0
        });
        var expectedStart = pos1.left;
        var expectedEnd = pos2.left;
        var cursors = plot.getRangeCursors();
        expect(cursors.length).toBe(1);
        expect(cursors[0].xstart).toBe(expectedStart);
        expect(cursors[0].xend).toBe(expectedEnd);
    });

    it('should not change on plot pan', function () {
        plot = $.plot("#placeholder", [sampledata2], {
            rangecursors: [
                {
                    name: 'Blue cursor',
                    orientation: 'vertical',
                    color: 'blue',
                    position: {
                        relativeXStart: 0.5,
                        relativeXEnd: 0.75
                    }
                }
            ]
        });

        var axesPosition1 = plot.c2p({
            left: 0.5 * plot.width(),
            top: 0
        });

        var axesPosition2 = plot.c2p({
            top: 0,
            left: 0.75 * plot.width()
        });

        jasmine.clock().tick(20);

        plot.pan({ left: -50, top: 30 })

        jasmine.clock().tick(20);

        var pos1 = plot.p2c({
            x: axesPosition1.x,
            y: 0
        });
        var pos2 = plot.p2c({
            x: axesPosition2.x,
            y: 0
        });
        var expectedStart = pos1.left;
        var expectedEnd = pos2.left;
        var cursors = plot.getRangeCursors();
        expect(cursors.length).toBe(1);
        expect(cursors[0].xstart).toBe(expectedStart);
        expect(cursors[0].xend).toBe(expectedEnd);
    });
});
