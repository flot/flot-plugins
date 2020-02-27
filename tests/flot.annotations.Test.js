/* global $, describe, it, beforeEach, afterEach, expect, jasmine, spyOn */
/* jshint browser: true*/

fdescribe('Flot annotations', function () {
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
        let bg = '#009900';
        let bc = '#FF0000';
        let font = '12pt';
        let color =  '#440056';
        plot = $.plot(placeholder, [ d1, d2, d3 ], {
            series: {
                lines: { show: true },
                points: { show: true, symbol: 'square' },
                annotations: {
                    show: true,
                    location: 'relative',
                    content: [
                        {x: 0.5, y: 0.5, label: 'hello world2\nnewline', arrowDirection: 'n', showArrow: true},
                        {x: 0.5, y: 0.5, label: 'hello world2\nnewline', arrowDirection: 's', showArrow: true},
                        {x: 0.5, y: 0.5, label: 'hello world3\nnewline', arrowDirection: 'e', showArrow: true},
                        {x: 0.5, y: 0.5, label: 'hello world4\nnewline', arrowDirection: 'w', showArrow: true},
                        {x: 0.5, y: 0.5, label: 'hello world5\nnewline', arrowDirection: 'ne', showArrow: true},
                        {x: 0.5, y: 0.5, label: 'hello world6\nnewline', arrowDirection: 'nw', showArrow: true},
                        {x: 0.5, y: 0.5, label: 'hello world7\nnewline', arrowDirection: 'sw', showArrow: true},
                        {x: 0.5, y: 0.5, label: 'hello world8\nnewline', arrowDirection: 'se', showArrow: true}
                    ],
                    contentFormatter: c => c,
                    borderColor: bc,
                    borderThickness: 1,
                    backgroundColor: bg,
                    lineWidth: 2,
                    font: font,
                    color: color,
                    textAlign: 'center',
                    arrowLength: 50,
                }
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
    it('should not fhow annotations when show is false', function () {
        let bg = '#009900';
        let bc = '#FF0000';
        let font = '12pt';
        let color =  '#440056';
        plot = $.plot(placeholder, [ d1, d2, d3 ], {
            series: {
                lines: { show: true },
                points: { show: true, symbol: 'square' },
                annotations: {
                    show: false,
                    location: 'relative',
                    content: [
                        {x: 0.5, y: 0.5, label: 'hello world2\nnewline', arrowDirection: 'n', showArrow: true},
                        {x: 0.5, y: 0.5, label: 'hello world2\nnewline', arrowDirection: 's', showArrow: true},
                        {x: 0.5, y: 0.5, label: 'hello world3\nnewline', arrowDirection: 'e', showArrow: true},
                        {x: 0.5, y: 0.5, label: 'hello world4\nnewline', arrowDirection: 'w', showArrow: true},
                        {x: 0.5, y: 0.5, label: 'hello world5\nnewline', arrowDirection: 'ne', showArrow: true},
                        {x: 0.5, y: 0.5, label: 'hello world6\nnewline', arrowDirection: 'nw', showArrow: true},
                        {x: 0.5, y: 0.5, label: 'hello world7\nnewline', arrowDirection: 'sw', showArrow: true},
                        {x: 0.5, y: 0.5, label: 'hello world8\nnewline', arrowDirection: 'se', showArrow: true}
                    ],
                    contentFormatter: c => c,
                    borderColor: bc,
                    borderThickness: 1,
                    backgroundColor: bg,
                    lineWidth: 2,
                    font: font,
                    color: color,
                    textAlign: 'center',
                    arrowLength: 50,
                }
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
                annotations: {
                    show: true,
                    location: 'relative',
                    content: [
                        {x: 0.5, y: 0.5, label: 'hello world2\nnewline', arrowDirection: 'n', showArrow: true},
                        {x: 0.5, y: 0.5, label: 'hello world2\nnewline', arrowDirection: 's', showArrow: true},
                        {x: 0.5, y: 0.5, label: 'hello world3\nnewline', arrowDirection: 'e', showArrow: true},
                        {x: 0.5, y: 0.5, label: 'hello world4\nnewline', arrowDirection: 'w', showArrow: true},
                        {x: 0.5, y: 0.5, label: 'hello world5\nnewline', arrowDirection: 'ne', showArrow: true},
                        {x: 0.5, y: 0.5, label: 'hello world6\nnewline', arrowDirection: 'nw', showArrow: true},
                        {x: 0.5, y: 0.5, label: 'hello world7\nnewline', arrowDirection: 'sw', showArrow: true},
                        {x: 0.5, y: 0.5, label: 'hello world8\nnewline', arrowDirection: 'se', showArrow: true}
                    ],
                    contentFormatter: formatter,
                    borderColor: '#FF0000',
                    borderThickness: 1,
                    backgroundColor: '#009900',
                    lineWidth: 2,
                    font: '12pt',
                    color: '#440056',
                    textAlign: 'center',
                    arrowLength: 50,
                }
            }
        });
        ctx = placeholder.find('.flot-overlay')[0].getContext('2d');
        plot.triggerRedrawOverlay();
        jasmine.clock().tick(20);
        expect(formatterCalled).toEqual(true);
    });
});
