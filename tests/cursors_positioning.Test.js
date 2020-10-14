/*globals HistoryBuffer*/

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

    it('default should be in middle, relative to canvas.', function () {
        plot = $.plot("#placeholder", [sampledata2], {
            cursors: [
                {
                    name: 'Blue cursor',
                    mode: 'xy',
                    color: 'blue'
                }
            ]
        });

        jasmine.clock().tick(20);

        var cursors = plot.getCursors();
        expect(cursors.length).toBe(1);
        expect(cursors[0].position.relativeX).toBe(0.5);
        expect(cursors[0].position.relativeY).toBe(0.5);
    });

    it('should be possible to position the cursor relative to the canvas', function () {
        plot = $.plot("#placeholder", [sampledata2], {
            cursors: [
                {
                    name: 'Blue cursor',
                    mode: 'xy',
                    color: 'blue',
                    position: {
                        relativeX: 0.5,
                        relativeY: 0.75
                    }
                }
            ]
        });

        jasmine.clock().tick(20);

        var cursors = plot.getCursors();
        expect(cursors.length).toBe(1);
        expect(cursors[0].x).toBe(0.5 * plot.width());
        expect(cursors[0].y).toBe(0.75 * plot.height());

        var pos = plot.c2p({
            left: 0.5 * plot.width(),
            top: 0.75 * plot.height()
        });
        expect(cursors[0].position.x).toBeCloseTo(pos.x);
        expect(cursors[0].position.y).toBeCloseTo(pos.y);
    });

    it('should be possible to position the cursor relative to the axes', function () {
        plot = $.plot("#placeholder", [sampledata2], {
            cursors: [
                {
                    name: 'Blue cursor',
                    mode: 'xy',
                    color: 'blue',
                    position: {
                        x: 1,
                        y: 2
                    }
                }
            ]
        });

        jasmine.clock().tick(20);

        var pos = plot.p2c({
            x: 1,
            y: 2
        });
        var expectedX = pos.left;
        var expectedY = pos.top;
        var cursors = plot.getCursors();
        expect(cursors.length).toBe(1);
        expect(cursors[0].x).toBe(expectedX);
        expect(cursors[0].y).toBe(expectedY);
        expect(cursors[0].position.relativeX).toBeCloseTo(expectedX / plot.width());
        expect(cursors[0].position.relativeY).toBeCloseTo(expectedY / plot.height());
    });

    it('should be possible to position the cursor relative to any of the axes when having multiple ones', function () {
        plot = $.plot("#placeholder", [
            { data: sampledata, xaxis: 1, yaxis: 1 },
            { data: sampledata3, xaxis: 2, yaxis: 2 }
        ],
        {
            cursors: [
                {
                    name: 'Blue cursor',
                    mode: 'xy',
                    color: 'blue',
                    position: { x: 1, y: 1.1 }
                },
                {
                    name: 'Red cursor',
                    mode: 'xy',
                    color: 'red',
                    position: { x: 11, y: 20 },
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

        var pos1 = plot.p2c({
            x: 1,
            y: 1.1
        });

        var pos2 = plot.p2c({
            x2: 11,
            y2: 20
        });

        var expectedX1 = pos1.left;
        var expectedY1 = pos1.top;
        var expectedX2 = pos2.left;
        var expectedY2 = pos2.top;
        var cursors = plot.getCursors();
        expect(cursors.length).toBe(2);
        expect(cursors[0].x).toBe(expectedX1);
        expect(cursors[0].y).toBe(expectedY1);
        expect(cursors[1].x).toBe(expectedX2);
        expect(cursors[1].y).toBe(expectedY2);
    });

    it('should not change on plot zoom', function () {
        plot = $.plot("#placeholder", [sampledata2], {
            cursors: [
                {
                    name: 'Blue cursor',
                    mode: 'xy',
                    color: 'blue',
                    position: {
                        relativeX: 0.5,
                        relativeY: 0.75
                    }
                }
            ]
        });

        var axesPosition = plot.c2p({
            left: 0.5 * plot.width(),
            top: 0.75 * plot.height()
        });

        jasmine.clock().tick(20);

        plot.zoom({ amount: 0.7, center: { left: plot.width() * 0.75, top: plot.height() * 0.75 } });

        jasmine.clock().tick(20);

        var pos = plot.p2c({
            x: axesPosition.x,
            y: axesPosition.y
        });
        var expectedX = pos.left;
        var expectedY = pos.top;
        var cursors = plot.getCursors();
        expect(cursors.length).toBe(1);
        expect(cursors[0].x).toBe(expectedX);
        expect(cursors[0].y).toBe(expectedY);
    });

    it('should not change on plot pan', function () {
        plot = $.plot("#placeholder", [sampledata2], {
            cursors: [
                {
                    name: 'Blue cursor',
                    mode: 'xy',
                    color: 'blue',
                    position: {
                        relativeX: 0.5,
                        relativeY: 0.75
                    }
                }
            ]
        });

        var axesPosition = plot.c2p({
            left: 0.5 * plot.width(),
            top: 0.75 * plot.height()
        });

        jasmine.clock().tick(20);

        plot.pan({ left: -50, top: 30 })

        jasmine.clock().tick(20);

        var pos = plot.p2c({
            x: axesPosition.x,
            y: axesPosition.y
        });
        var expectedX = pos.left;
        var expectedY = pos.top;
        var cursors = plot.getCursors();
        expect(cursors.length).toBe(1);
        expect(cursors[0].x).toBe(expectedX);
        expect(cursors[0].y).toBe(expectedY);
        expect(cursors[0].position.relativeX).not.toBeCloseTo(0.5);
        expect(cursors[0].position.relativeY).not.toBeCloseTo(0.75);
        expect(cursors[0].position.relativeX).not.toBe(undefined);
        expect(cursors[0].position.relativeY).not.toBe(undefined);
    });

    it('should switch position modes on chart update and pan', function () {
        var hb = new HistoryBuffer(10, 1);

        hb.appendArray([33, 34, 35, 36, 37]);

        plot = $.plot("#placeholder", [{}], {
            series: {
                historyBuffer: hb
            },
            cursors: [
                {
                    name: 'Blue cursor',
                    mode: 'xy',
                    color: 'blue',
                    position: {
                        relativeX: 0.5,
                        relativeY: 0.5
                    }
                }
            ]
        });

        var cursors = plot.getCursors();
        expect(cursors.length).toBe(1);
        expect(cursors[0].position.relativeX).toBe(0.5);
        expect(cursors[0].position.relativeY).toBe(0.5);

        plot.smartPan({
            x: 0,
            y: 10
        }, plot.navigationState());
        jasmine.clock().tick(20);

        expect(cursors[0].position.x).not.toBeUndefined();
        expect(cursors[0].position.y).not.toBeUndefined();
        expect(cursors[0].position.x).not.toBeNaN();
        expect(cursors[0].position.y).not.toBeNaN();
    });
});
