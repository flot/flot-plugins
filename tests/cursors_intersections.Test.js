describe("Cursors intersections", function () {
    'use strict';

    var sampledata = [
        [0, 1],
        [1, 1.1],
        [2, 1.2]
    ];
    var sampledata2 = [
        [0, 2],
        [1, 2.1],
        [2, 2.2]
    ];

    var plot;
    var placeholder

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

    it('should find intersections with a plot', function () {
        plot = $.plot("#placeholder", [sampledata], {
            cursors: [{
                name: 'Blue cursor',
                color: 'blue',
                position: {
                    x: 1,
                    y: 0
                },
                snapToPlot: 0
            }]
        });

        jasmine.clock().tick(20);

        var cursors = plot.getCursors();
        var intersections = plot.getIntersections(cursors[0]);

        expect(intersections.points.length).toBe(1);
        expect(intersections.points[0].x).toBe(1);
        expect(intersections.points[0].y).toBe(sampledata[1][1]);
    });

    it('should find intersections with a plot even when hidden', function () {
        plot = $.plot("#placeholder", [sampledata], {
            cursors: [{
                name: 'Blue cursor',
                color: 'blue',
                position: {
                    x: 1,
                    y: 0
                },
                show: false,
                snapToPlot: 0
            }]
        });

        jasmine.clock().tick(20);

        var cursors = plot.getCursors();
        var intersections = plot.getIntersections(cursors[0]);

        expect(intersections.points.length).toBe(1);
        expect(intersections.points[0].x).toBe(1);
        expect(intersections.points[0].y).toBe(sampledata[1][1]);
    });

    it('should find intersections when only some are shown', function () {
        function spyOnFillText() {
            var overlay = $('.flot-overlay')[0];
            var octx = overlay.getContext("2d");
            return spyOn(octx, 'fillText').and.callThrough();
        }

        plot = $.plot("#placeholder", [sampledata, sampledata2], {
            cursors: [{
                name: 'Blue cursor',
                color: 'blue',
                position: {
                    x: 1,
                    y: 0
                },
                showIntersections: [0],
                snapToPlot: 0
            }]
        });

        var spy = spyOnFillText();
        jasmine.clock().tick(20);

        var cursors = plot.getCursors();
        var intersections = plot.getIntersections(cursors[0]);

        // finds all intersections
        expect(intersections.points.length).toBe(1);
        expect(intersections.points[0].x).toBe(sampledata[1][0]);
        expect(intersections.points[0].y).toBe(sampledata[1][1]);

        // only shows intersection with series zero
        expect(spy).toHaveBeenCalledWith('1.10', jasmine.any(Number), jasmine.any(Number));
        expect(spy).not.toHaveBeenCalledWith('2.10', jasmine.any(Number), jasmine.any(Number));
    });

    it('should recompute intersections on data update', function () {
        plot = $.plot("#placeholder", [
            [
                [0, 1],
                [1, 5]
            ]
        ], {
            cursors: [{
                name: 'Blue cursor',
                color: 'blue',
                position: {
                    x: 0.5,
                    y: 0
                },
                snapToPlot: 0
            }]
        });

        var updateChart = function () {
            plot.setData([
                [
                    [0, 5],
                    [1, 7]
                ]
            ]);
            plot.setupGrid();
            plot.draw();
        };

        jasmine.clock().tick(20);

        var cursors = plot.getCursors();
        var intersections = plot.getIntersections(cursors[0]);

        expect(intersections.points[0].x).toBe(plot.getData()[0].datapoints.points[0]);
        expect(intersections.points[0].y).toBe(plot.getData()[0].datapoints.points[1]);
        updateChart();

        jasmine.clock().tick(20);

        intersections = plot.getIntersections(cursors[0]);

        expect(intersections.points[0].x).toBe(plot.getData()[0].datapoints.points[0]);
        expect(intersections.points[0].y).toBe(plot.getData()[0].datapoints.points[1]);
    });

    it('should interpolate the intersections properly with linear scales', function () {
        plot = $.plot("#placeholder", [sampledata], {
            cursors: [{
                name: 'Blue cursor',
                color: 'blue',
                snapToPlot: -1,
                position: {
                    x: 0.5,
                    y: 1.0
                },
                interpolate: true
            }]
        });

        jasmine.clock().tick(20);

        var cursors = plot.getCursors();
        var intersections = plot.getIntersections(cursors[0]);
        var expectedY = sampledata[0][1] + (sampledata[1][1] - sampledata[0][1]) / 2;

        expect(intersections.points[0].x).toBe(0.5);
        expect(intersections.points[0].y).toBe(expectedY);
    });

    it('should not return any point of interpolation if it does not snap to any existing plots', function () {
        plot = $.plot("#placeholder", [sampledata], {
            cursors: [{
                name: 'Blue cursor',
                color: 'blue',
                snapToPlot: 2,
                position: {
                    x: 0.5,
                    y: 0
                },
                interpolate: true
            }]
        });

        jasmine.clock().tick(20);

        var cursors = plot.getCursors();
        var intersections = plot.getIntersections(cursors[0]);

        expect(intersections.points.length).toBe(0);
    });
});
