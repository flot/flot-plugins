/* global $, describe, it, beforeEach, afterEach, expect, jasmine, spyOn */
/* jshint browser: true*/

describe('Flot cursors', function () {
    'use strict';

    var sampledata = [[0, 1], [1, 1.1], [2, 1.2]];
    var plot;
    var placeholder;

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

    it('should be possible to specify a cursor when creating the plot', function () {
        plot = $.plot("#placeholder", [sampledata], {
            rangecursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue'
                }
            ]
        });

        var firstCursor = plot.getRangeCursors()[0];
        expect(plot.getRangeCursors().length).toBe(1);
        expect(firstCursor.name).toBe('Blue cursor');
    });

    it('should be possible to specify zero cursors when creating the plot', function () {
        plot = $.plot("#placeholder", [sampledata], {
            rangecursors: []
        });

        expect(plot.getRangeCursors().length).toBe(0);
    });

    it('should be possible to specify multiple cursors when creating the plot', function () {
        plot = $.plot("#placeholder", [sampledata], {
            rangecursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue'
                },
                {
                    name: 'Red cursor',
                    color: 'red'
                }
            ]
        });

        var firstCursor = plot.getRangeCursors()[0];
        var secondCursor = plot.getRangeCursors()[1];
        expect(plot.getRangeCursors().length).toBe(2);
        expect(firstCursor.name).toBe('Blue cursor');
        expect(secondCursor.name).toBe('Red cursor');
    });

    it('should have orientation vertical by default', function () {
        plot = $.plot("#placeholder", [sampledata], {
            rangecursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue'
                }
            ]
        });

        var firstCursor = plot.getRangeCursors()[0];
        expect(firstCursor.orientation).toBe('vertical');
    });

    it('should be visible by default', function () {
        plot = $.plot("#placeholder", [sampledata], {
            rangecursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue'
                }
            ]
        });

        var firstCursor = plot.getRangeCursors()[0];
        expect(firstCursor.show).toBe(true);
    });

    it('should have a lineWidth of 1 by default', function () {
        plot = $.plot("#placeholder", [sampledata], {
            rangecursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue'
                }
            ]
        });

        var firstCursor = plot.getRangeCursors()[0];
        expect(firstCursor.lineWidth).toBe(1);
    });

    it('should be possible to create a cursor at runtime', function () {
        plot = $.plot("#placeholder", [sampledata], {
            rangecursors: []
        });

        expect(plot.getRangeCursors().length).toBe(0);

        plot.addRangeCursor({
            name: 'Blue cursor',
            mode: 'xy',
            color: 'blue',
            position: {
                relativeXStart: 0.7,
                relativeXEnd: 0.71
            }
        });

        var firstCursor = plot.getRangeCursors()[0];

        expect(plot.getRangeCursors().length).toBe(1);
        expect(firstCursor.name).toBe('Blue cursor');
    });

    it('should be possible to remove a cursor at runtime', function () {
        plot = $.plot("#placeholder", [sampledata], {
            rangecursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue',
                    xstart: 3,
                    xend: 1.5
                }
            ]
        });

        var firstCursor = plot.getRangeCursors()[0];
        expect(plot.getRangeCursors().length).toBe(1);

        plot.removeRangeCursor(firstCursor);

        expect(plot.getRangeCursors().length).toBe(0);
    });

    it('should be possible to change a cursor name at runtime', function () {
        plot = $.plot("#placeholder", [sampledata], {
            rangecursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue'
                }
            ]
        });

        var firstCursor = plot.getRangeCursors()[0];
        expect(plot.getRangeCursors().length).toBe(1);
        expect(firstCursor.name).toBe('Blue cursor');

        plot.setRangeCursor(firstCursor, {
            name: 'Red Cursor'
        });

        expect(plot.getRangeCursors().length).toBe(1);
        expect(firstCursor.name).toBe('Red Cursor');
    });

    it('should be possible to change a cursor label visibility at runtime', function () {
        plot = $.plot("#placeholder", [sampledata], {
            rangecursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue'
                }
            ]
        });

        var firstCursor = plot.getRangeCursors()[0];
        expect(plot.getRangeCursors().length).toBe(1);
        expect(firstCursor.showLabel).toBe(false);

        plot.setRangeCursor(firstCursor, {
            showLabel: true
        });

        expect(plot.getRangeCursors().length).toBe(1);
        expect(firstCursor.showLabel).toBe(true);
    });

    it('should be possible to change a cursor orientation at runtime', function () {
        plot = $.plot("#placeholder", [sampledata], {
            rangecursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue'
                }
            ]
        });

        var firstCursor = plot.getRangeCursors()[0];
        expect(plot.getRangeCursors().length).toBe(1);
        expect(firstCursor.orientation).toBe('vertical');

        plot.setRangeCursor(firstCursor, {
            orientation: 'horizontal'
        });

        expect(plot.getRangeCursors().length).toBe(1);
        expect(firstCursor.orientation).toBe('horizontal');
    });

    it('should be possible to change the cursor color at runtime', function () {
        plot = $.plot("#placeholder", [sampledata], {
            rangecursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue'
                }
            ]
        });

        var firstCursor = plot.getRangeCursors()[0];
        var initialColor = firstCursor.color;
        plot.setRangeCursor(firstCursor, {
            color: 'red'
        });

        expect(initialColor).toBe('blue');
        expect(firstCursor.color).toBe('red');
    });

    it('should be possible to change the cursor lineWidth at runtime', function () {
        plot = $.plot("#placeholder", [sampledata], {
            rangecursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue',
                    lineWidth: 2
                }
            ]
        });

        var firstCursor = plot.getRangeCursors()[0];
        var initialLineWidth = firstCursor.lineWidth;

        plot.setRangeCursor(firstCursor, {
            lineWidth: 3
        });

        expect(initialLineWidth).toBe(2);
        expect(firstCursor.lineWidth).toBe(3);
    });

    it('should be possible to change the cursor visibility at runtime', function () {
        plot = $.plot("#placeholder", [sampledata], {
            rangecursors: [{
                name: 'Blue cursor',
                color: 'blue',
                show: true
            }]
        });

        var firstCursor = plot.getRangeCursors()[0];
        var initialVisibility = firstCursor.show;

        plot.setRangeCursor(firstCursor, {
            show: false
        });

        expect(initialVisibility).toBe(true);
        expect(firstCursor.show).toBe(false);
    });

    // we expect more lines to be drawn when we have more dashes
    it('should be possible to make a dashed line', function() {
        function spyOnLineTo() {
            var overlay = $('.flot-overlay')[0];
            var octx = overlay.getContext("2d");
            return spyOn(octx, 'setLineDash').and.callThrough();
        }

        plot = $.plot("#placeholder", [sampledata], {
            rangecursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue',
                    dashes: [1, 1]
                }
            ]
        });

        var spy = spyOnLineTo();
        jasmine.clock().tick(20);

        spy.calls.reset();

        plot = $.plot("#placeholder", [sampledata], {
            rangecursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue',
                    dashes: [5, 5]
                }
            ]
        });

        jasmine.clock().tick(20);

        var dashCallCount = spy.calls.count();
        expect(1).toEqual(dashCallCount);
    });

    describe('Labels', function () {
        function spyOnFillText() {
            var overlay = $('.flot-overlay')[0];
            var octx = overlay.getContext("2d");
            return spyOn(octx, 'fillText').and.callThrough();
        }

        it('should display the cursor label when told so', function () {
            plot = $.plot("#placeholder", [sampledata], {
                rangecursors: [
                    {
                        name: 'Blue cursor',
                        color: 'blue',
                        position: {
                            xstart: 1,
                            xend: 1.15
                        },
                        showLabel: true
                    } ]
            });

            var spy = spyOnFillText();
            jasmine.clock().tick(20);

            expect(spy).toHaveBeenCalledWith('Blue cursor', jasmine.any(Number), jasmine.any(Number));
        });

        it('should not display the cursor label when told not to', function () {
            plot = $.plot("#placeholder", [sampledata], {
                rangecursors: [
                    {
                        name: 'Blue cursor',
                        color: 'blue',
                        position: {
                            xstart: 1,
                            xend: 1.15
                        },
                        showLabel: false
                    } ]
            });

            var spy = spyOnFillText();
            jasmine.clock().tick(20);

            expect(spy).not.toHaveBeenCalledWith('Blue cursor', jasmine.any(Number), jasmine.any(Number));
        });

        it('should display the cursor values relative to a plot when told so', function () {
            plot = $.plot("#placeholder", [sampledata], {
                rangecursors: [
                    {
                        name: 'Blue cursor',
                        color: 'blue',
                        showLabel: true,
                        position: {
                            xstart: 1.0,
                            xend: 1.15
                        }
                    }
                ]
            });

            var spy = spyOnFillText();
            jasmine.clock().tick(20);

            expect(spy).toHaveBeenCalledWith('Blue cursor', jasmine.any(Number), jasmine.any(Number));
        });

        it('should not display the cursor values relative to a plot when told not to', function () {
            plot = $.plot("#placeholder", [sampledata], {
                rangecursors: [
                    {
                        name: 'Blue cursor',
                        color: 'blue',
                        showLabel: true,
                        position: {
                            xstart: 1,
                            xend: 1.15
                        }
                    }
                ]
            });

            var spy = spyOnFillText();
            jasmine.clock().tick(20);

            expect(spy).toHaveBeenCalled();
        });

        it('should display both the cursor label and value when told so', function () {
            plot = $.plot("#placeholder", [sampledata], {
                rangecursors: [{
                    name: 'Blue cursor',
                    color: 'blue',
                    position: {
                        xstart: 1,
                        xend: 1.15
                    },
                    showLabel: true,
                    showValue: true
                }],
                xaxes: [{
                    min: 0,
                    max: 10,
                    ticks: 10,
                    autoScale: "none"
                }],
                yaxes: [{
                    min: 1,
                    max: 1.2,
                    ticks: 10,
                    autoScale: "none"
                }]
            });

            var spy = spyOnFillText();
            jasmine.clock().tick(20);

            expect(spy).toHaveBeenCalledWith('Blue cursor', jasmine.any(Number), jasmine.any(Number));
            expect(spy).toHaveBeenCalledWith('Blue cursor', jasmine.any(Number), jasmine.any(Number));
        });

        it('should display the cursor label in the same format as axis', function () {
            plot = $.plot("#placeholder", [sampledata], {
                rangecursors: [{
                    name: 'Blue cursor',
                    color: 'blue',
                    position: { relativeXStart: 0.5, relativeXEnd: 0.6 },
                    showLabel: true,
                    showValue: true,
                    defaultxaxis: 1,
                    defaultyaxis: 2
                }],
                xaxes: [
                    { min: 0, max: 10, autoScale: "none", tickFormatter: function(val) { return '<' + val + '>'; } }
                ],
                yaxes: [
                    { min: 100, max: 110, autoScale: "none", tickFormatter: function(val) { return '(' + val + ')'; } },
                    { min: 100, max: 110, autoScale: "none", tickFormatter: function(val) { return '{' + val + '}'; } }
                ]
            });

            var spy = spyOnFillText();
            jasmine.clock().tick(20);

            expect(spy).toHaveBeenCalledWith('Blue cursor', jasmine.any(Number), jasmine.any(Number));
        });
    });

    describe('Names', function () {
        it('should give the cursors default names if not specified', function () {
            plot = $.plot("#placeholder", [sampledata], {
                rangecursors: [
                    {
                        color: 'blue'
                    }
                ]
            });

            var firstCursor = plot.getRangeCursors()[0];

            expect(firstCursor.name).toEqual(jasmine.any(String));
            expect(firstCursor.name.length).toBeGreaterThan(0);
        });

        it('should give the cursors unique names');
        it('should give the cursors created at runtime unique names');
    });

    describe('Precision', function () {
        function spyOnFillText() {
            var overlay = $('.flot-overlay')[0];
            var octx = overlay.getContext("2d");
            return spyOn(octx, 'fillText').and.callThrough();
        }

        it('should give the cursors a higher precision in a big graph', function () {
            var fixture = setFixtures('<div id="demo-container" style="width: 1000px;height: 1000px">').find('#demo-container').get(0);

            placeholder = $('<div id="placeholder" style="width: 100%;height: 100%">');
            placeholder.appendTo(fixture);
            plot = $.plot("#placeholder", [sampledata], {
                rangecursors: [
                    {
                        name: 'Blue cursor',
                        color: 'blue',
                        position: {
                            xstart: 1,
                            xend: 1.15
                        },
                        showValue: true
                    }
                ]
            });

            var spy = spyOnFillText();
            jasmine.clock().tick(20);

            expect(spy).toHaveBeenCalledWith('0.150', jasmine.any(Number), jasmine.any(Number));
        });

        it('should give the cursors a smaller precision in a litle graph', function () {
            var fixture = setFixtures('<div id="demo-container" style="width: 100px;height: 100px">').find('#demo-container').get(0);

            placeholder = $('<div id="placeholder" style="width: 100%;height: 100%">');
            placeholder.appendTo(fixture);
            plot = $.plot("#placeholder", [sampledata], {
                rangecursors: [
                    {
                        name: 'Blue cursor',
                        color: 'blue',
                        position: {
                            xstart: 1,
                            xend: 1.15
                        },
                        showValue: true
                    }
                ]
            });

            var spy = spyOnFillText();
            jasmine.clock().tick(20);

            expect(spy).toHaveBeenCalledWith('0.15', jasmine.any(Number), jasmine.any(Number));
        });
    });
});
