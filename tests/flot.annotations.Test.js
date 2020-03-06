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
        placeholder = setFixtures('<div id="test-container" style="width: 200px;height: 100px;border-style: solid;border-width: 1px"></div>')
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
        let annotations = plot.getAnnotations();
        let match = true;
        Object.keys(annotation).forEach((k) => {
            if (annotation[k] !== annotations[0][k]) {
                match = false;
            }
        });
        expect(match).toEqual(true);
    });
});
