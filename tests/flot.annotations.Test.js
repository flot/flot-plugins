describe('Flot annotations', function () {
    'use strict';
    var d1 = [];
    for (var i = 0; i < 14; i += 0.5) {
        d1.push([i, Math.sin(i)]);
    }

    var d2 = [[0, 3], [4, 8], [8, 5], [9, 13], [11, 3]];

    // A null signifies separate line segments

    var d3 = [[0, 12], [7, 12], null, [7, 2.5], [12, 2.5]];
    var plot;
    var placeholder;
    var ctx;
    beforeEach(function () {
        var fixture = setFixtures('<div id="demo-container" style="width: 800px;height: 600px">').find('#demo-container').get(0);

        placeholder = $('<div id="placeholder" style="width: 100%;height: 100%">');
        placeholder.appendTo(fixture);
        jasmine.clock().install();
    });

    afterEach(function () {
        if (plot) {
            plot.shutdown();
        }
        $('#placeholder').empty();
        jasmine.clock().uninstall();
    });

    it('should show annotations', function () {
        plot = $.plot(placeholder, [ d1, d2, d3 ], {
            series: {
                lines: { show: true },
                points: { show: true, symbol: 'square' }
            },
            annotations: [{
                show: true,
                x: 0.5,
                y: 0.5,
                label: 'hello world2<br>newline',
                arrowDirection: 'n',
                showArrow: true
            }]
        });
        ctx = placeholder.find('.flot-overlay')[0].getContext('2d');
        var spy1 = spyOn(ctx, 'moveTo').and.callThrough();
        var spy2 = spyOn(ctx, 'lineTo').and.callThrough();
        plot.triggerRedrawOverlay();
        jasmine.clock().tick(20);
        expect(spy1).toHaveBeenCalled();
        expect(spy2).toHaveBeenCalled();
    });
    it('should not show annotations when show is false', function () {
        plot = $.plot(placeholder, [ d1, d2, d3 ], {
            series: {
                lines: { show: true },
                points: { show: true, symbol: 'square' }
            },
            annotations: [{
                show: false,
                x: 0.5,
                y: 0.5,
                label: 'hello world',
                arrowDirection: 'n',
                showArrow: true
            }]
        });
        ctx = placeholder.find('.flot-overlay')[0].getContext('2d');
        var spy1 = spyOn(ctx, 'moveTo').and.callThrough();
        var spy2 = spyOn(ctx, 'lineTo').and.callThrough();
        plot.triggerRedrawOverlay();
        jasmine.clock().tick(20);
        expect(spy1).not.toHaveBeenCalled();
        expect(spy2).not.toHaveBeenCalled();
    });
    it('should call the formatter', function () {
        var formatterCalled = false;
        var formatter = function (c) {
            formatterCalled = true;
            return c;
        }
        plot = $.plot(placeholder, [ d1, d2, d3 ], {
            series: {
                lines: { show: true },
                points: { show: true, symbol: 'square' }
            },
            annotations: [{
                show: true,
                location: 'relative',
                x: 0.5,
                y: 0.5,
                label: 'hello world',
                arrowDirection: 'n',
                showArrow: true,
                contentFormatter: formatter
            }]
        });
        ctx = placeholder.find('.flot-overlay')[0].getContext('2d');
        plot.triggerRedrawOverlay();
        jasmine.clock().tick(20);
        expect(formatterCalled).toEqual(true);
    });
    it('should draw multi-line text', function () {
        plot = $.plot(placeholder, [ d1, d2, d3 ], {
            series: {
                lines: { show: true },
                points: { show: true, symbol: 'square' }
            },
            annotations: [{
                show: true,
                location: 'relative',
                x: 0.5,
                y: 0.5,
                label: 'hello world2<br>newline',
                arrowDirection: 'n',
                showArrow: true
            }]
        });
        ctx = placeholder.find('.flot-overlay')[0].getContext('2d');
        var spy1 = spyOn(ctx, 'fillText').and.callThrough();
        plot.triggerRedrawOverlay();
        jasmine.clock().tick(20);
        expect(spy1).toHaveBeenCalledTimes(2);
    });
    it('should be possible to position the annotation relative to any of the axes when having multiple ones', function () {
        plot = $.plot(placeholder, [
            { data: d2, xaxis: 1, yaxis: 1 },
            { data: d3, xaxis: 2, yaxis: 2 }
        ],
        {
            annotations: [
                {
                    show: true,
                    location: 'absolute',
                    x: 5,
                    y: 5,
                    label: 'hello world2<br>newline',
                    arrowDirection: 'n',
                    showArrow: false,
                    xaxis: 1,
                    yaxis: 1
                },
                {
                    show: true,
                    location: 'absolute',
                    x: 15,
                    y: 15,
                    label: 'hello world2<br>newline',
                    arrowDirection: 'n',
                    showArrow: false,
                    xaxis: 2,
                    yaxis: 2
                }
            ],
            xaxes: [
                { position: 'bottom', minimum: 0, maximum: 10 },
                { position: 'top', minimum: 10, maximum: 20 }
            ],
            yaxes: [
                { position: 'left', minimum: 0, maximum: 10 },
                { position: 'right', minimum: 10, maximum: 20 }
            ]
        });

        jasmine.clock().tick(20);

        var pos1 = plot.p2c({
            x1: 5,
            y1: 5
        });

        var pos2 = plot.p2c({
            x2: 15,
            y2: 15
        });

        var expectedX1 = pos1.left;
        var expectedY1 = pos1.top;
        var expectedX2 = pos2.left;
        var expectedY2 = pos2.top;
        ctx = placeholder.find('.flot-overlay')[0].getContext('2d');
        var spy1 = spyOn(ctx, 'fillRect').and.callThrough();
        plot.triggerRedrawOverlay();
        jasmine.clock().tick(20);
        let bounds = plot.getAnnotationBounds(0);
        expectedX1 = expectedX1 - (bounds.width * plot.width()) / 2;
        expectedY1 = expectedY1 - (bounds.height * plot.height());
        bounds = plot.getAnnotationBounds(1);
        expectedX2 = expectedX2 - (bounds.width * plot.width()) / 2;
        expectedY2 = expectedY2 - (bounds.height * plot.height());
        expect(spy1).toHaveBeenCalledTimes(2);
        expect(spy1).toHaveBeenCalledWith(expectedX1, expectedY1, jasmine.any(Number), jasmine.any(Number));
        expect(spy1).toHaveBeenCalledWith(expectedX2, expectedY2, jasmine.any(Number), jasmine.any(Number));
    });
    it('should add an annotation using the public api', function () {
        plot = $.plot(placeholder, [ d1, d2, d3 ], {
            series: {
                lines: { show: true },
                points: { show: true, symbol: 'square' }
            }
        });
        plot.addAnnotation({
            show: true,
            location: 'relative',
            x: 0.5,
            y: 0.5,
            label: 'hello world2<br>newline',
            arrowDirection: 'n',
            showArrow: true
        });
        ctx = placeholder.find('.flot-overlay')[0].getContext('2d');
        var spy1 = spyOn(ctx, 'fillText').and.callThrough();
        plot.triggerRedrawOverlay();
        jasmine.clock().tick(20);
        expect(spy1).toHaveBeenCalledTimes(2);
    });
    it('should remove an annotation using the public api', function () {
        plot = $.plot(placeholder, [ d1, d2, d3 ], {
            series: {
                lines: { show: true },
                points: { show: true, symbol: 'square' }
            },
            annotations: [{
                show: true,
                location: 'relative',
                x: 0.5,
                y: 0.5,
                label: 'hello world2<br>newline',
                arrowDirection: 'n',
                showArrow: true
            }]
        });
        plot.removeAnnotation({
            show: true,
            location: 'relative',
            x: 0.5,
            y: 0.5,
            label: 'hello world2<br>newline',
            arrowDirection: 'n',
            showArrow: true
        });
        ctx = placeholder.find('.flot-overlay')[0].getContext('2d');
        var spy1 = spyOn(ctx, 'fillText').and.callThrough();
        plot.triggerRedrawOverlay();
        jasmine.clock().tick(20);
        expect(spy1).not.toHaveBeenCalled();
    });
    it('should return an annotation using the public api', function () {
        let annotation = {
            show: true,
            location: 'relative',
            x: 0.5,
            y: 0.5,
            label: 'hello world2<br>newline',
            arrowDirection: 'n',
            showArrow: true
        };
        plot = $.plot(placeholder, [ d1, d2, d3 ], {
            series: {
                lines: { show: true },
                points: { show: true, symbol: 'square' }
            },
            annotations: [annotation]
        });
        jasmine.clock().tick(20);
        let annotations = plot.getAnnotations();
        let match = true;
        Object.keys(annotation).forEach((k) => {
            if (annotation[k] !== annotations[0][k]) {
                match = false;
            }
        });
        expect(match).toEqual(true);
    });
    it('should hit test an annotation using the public api', function () {
        let annotation1 = {
            show: true,
            location: 'absolute',
            x: 4,
            y: 8,
            label: 'hello world2<br>newline',
            arrowDirection: 'n',
            showArrow: true
        };
        let annotation2 = {
            show: true,
            location: 'absolute',
            x: 7,
            y: 12,
            label: 'hello world2<br>newline',
            arrowDirection: 'n',
            showArrow: true
        };
        plot = $.plot(placeholder, [ d1, d2, d3 ], {
            series: {
                lines: { show: true },
                points: { show: true, symbol: 'square' }
            },
            annotations: [annotation1, annotation2]
        });
        jasmine.clock().tick(20);
        var pos1 = plot.p2c({
            x1: 4,
            y1: 9
        });

        var x1 = pos1.left / plot.width();
        var y1 = pos1.top / plot.height();
        let annotations = plot.hitTestAnnotations(x1, y1);
        // the hit test found one annotation at index 0 in the list
        expect(annotations.length).toEqual(1);
        expect(annotations[0]).toEqual(0);
    });
    it('should return the bounds of an annotation using the public api', function () {
        let annotation1 = {
            show: true,
            location: 'absolute',
            x: 4,
            y: 8,
            label: 'hello world2<br>newline',
            arrowDirection: 'n',
            showArrow: false
        };
        let annotation2 = {
            show: true,
            location: 'absolute',
            x: 7,
            y: 12,
            label: 'hello world2<br>newline',
            arrowDirection: 'n',
            showArrow: false
        };
        plot = $.plot(placeholder, [ d1, d2, d3 ], {
            series: {
                lines: { show: true },
                points: { show: true, symbol: 'square' }
            },
            annotations: [annotation1, annotation2]
        });
        jasmine.clock().tick(20);
        var pos1 = plot.p2c({
            x1: 4,
            y1: 8
        });

        var x1 = pos1.left / plot.width();
        var y1 = pos1.top / plot.height();
        let bounds = plot.getAnnotationBounds(0);
        expect(bounds.x).toBeCloseTo(x1 - bounds.width / 2, 4);
        expect(bounds.y).toBeCloseTo(y1 - bounds.height, 4);
    });
    it('should draw the annotation in the correct place according to arrow direction', function () {
        let directions = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];
        let arrowLength = 50;
        let offsets = [[0, -1, -0.5, -1], [0, 1, -0.5, 0], [1, 0, 0, -0.5], [-1, 0, -1, -0.5], [1, -1, 0, -1], [-1, -1, -1, -1], [1, 1, 0, 0], [-1, 1, -1, 0]];
        let annotation1 = {
            show: true,
            location: 'absolute',
            x: 4,
            y: 8,
            label: 'hello world2<br>newline',
            showArrow: true,
            arrowLength: arrowLength
        };
        let annotations = [];
        for (let i = 0; i < directions.length; i++) {
            let annotation = {...annotation1};
            annotation.arrowDirection = directions[i];
            annotations.push(annotation);
        }
        plot = $.plot(placeholder, [ d1, d2, d3 ], {
            series: {
                lines: { show: true },
                points: { show: true, symbol: 'square' }
            },
            annotations: annotations
        });
        jasmine.clock().tick(20);
        var pos1 = plot.p2c({
            x1: 4,
            y1: 8
        });

        for (let i = 0; i < directions.length; i++) {
            let x1 = pos1.left / plot.width();
            let y1 = pos1.top / plot.height();
            let bounds = plot.getAnnotationBounds(i);
            x1 = x1 + (offsets[i][0] * arrowLength) / plot.width();
            y1 = y1 + (offsets[i][1] * arrowLength) / plot.height();
            x1 = x1 + (offsets[i][2] * bounds.width);
            y1 = y1 + (offsets[i][3] * bounds.height);
            expect(bounds.x).toBeCloseTo(x1, 4);
            expect(bounds.y).toBeCloseTo(y1, 4);
        }
    });
});
