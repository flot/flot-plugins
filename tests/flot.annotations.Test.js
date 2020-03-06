/* global $, describe, it, beforeEach, afterEach, expect, jasmine, spyOn */
/* jshint browser: true*/

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
                points: { show: true, symbol: 'square' },
                annotations: [{
                    show: true,
                    x: 0.5,
                    y: 0.5,
                    label: 'hello world2<br>newline',
                    arrowDirection: 'n',
                    showArrow: true
                }]
            }
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
                points: { show: true, symbol: 'square' },
                annotations: [{
                    show: false,
                    x: 0.5,
                    y: 0.5,
                    label: 'hello world',
                    arrowDirection: 'n',
                    showArrow: true
                }]
            }
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
                points: { show: true, symbol: 'square' },
                annotations: [{
                    show: true,
                    location: 'relative',
                    x: 0.5,
                    y: 0.5,
                    label: 'hello world',
                    arrowDirection: 'n',
                    showArrow: true,
                    contentFormatter: formatter,
                }]
            }
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
                points: { show: true, symbol: 'square' },
                annotations: [{
                    show: true,
                    location: 'relative',
                    x: 0.5,
                    y: 0.5,
                    label: 'hello world2<br>newline',
                    arrowDirection: 'n',
                    showArrow: true
                }]
            }
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
                    x: 7,
                    y: 12,
                    label: 'hello world2<br>newline',
                    arrowDirection: 'n',
                    showArrow: true,
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
            x2: 7,
            y2: 12
        });

        var expectedX1 = pos1.left;
        var expectedY1 = pos1.top;
        var spy1 = spyOn(ctx, 'fillRect').and.callThrough();
        plot.triggerRedrawOverlay();
        jasmine.clock().tick(20);
        expect(spy1).not.toHaveBeenCalledWith(expectedX1, expectedY1, jasmine.any(Number), jasmine.any(Number));
    });
    it('should add an annotation using the public api', function () {
        plot = $.plot(placeholder, [ d1, d2, d3 ], {
            series: {
                lines: { show: true },
                points: { show: true, symbol: 'square' },
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
                points: { show: true, symbol: 'square' },
                annotations: [{
                    show: true,
                    location: 'relative',
                    x: 0.5,
                    y: 0.5,
                    label: 'hello world2<br>newline',
                    arrowDirection: 'n',
                    showArrow: true
                }]
            }
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
                points: { show: true, symbol: 'square' },
                annotations: [annotation]
            }
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
                points: { show: true, symbol: 'square' },
                annotations: [annotation1, annotation2]
            }
        });
        jasmine.clock().tick(20);
        var pos1 = plot.p2c({
            x1: 4,
            y1: 9
        });

        var x1 = pos1.left / plot.width();
        var y1 = pos1.top / plot.height();
        let annotations = plot.hitTest(x1, y1);
        expect(annotations.length).toEqual(1);
        expect(annotations[0]).toEqual(0);
    });
    fit('should return the bounds of an annotation using the public api', function () {
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
                points: { show: true, symbol: 'square' },
                annotations: [annotation1, annotation2]
            }
        });
        jasmine.clock().tick(20);
        var pos1 = plot.p2c({
            x1: 4,
            y1: 8
        });

        var x1 = pos1.left / plot.width();
        var y1 = pos1.top / plot.height();
        let bounds = plot.getBounds(0);
        expect(bounds.x).toEqual(x1 -bounds.width / 2);
        expect(bounds.y).toEqual(y1 - bounds.height);
    });
});
