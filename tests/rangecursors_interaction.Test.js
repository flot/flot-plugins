/* global $, describe, it, xit, after, beforeEach, afterEach, expect, jasmine */
/* jshint browser: true*/

describe("Cursors interaction", function () {
    'use strict';

    var sampledata = [[0, 1], [1, 1.1], [2, 1.2]];
    var placeholder, plot, cursor, cursorX, cursorY, simulate = window.simulate;

    beforeAll(function () {
        loadDragSimulators();
    });

    beforeEach(function () {
        var fixture = setFixtures('<div id="demo-container" style="width: 800px;height: 600px">').find('#demo-container').get(0);

        placeholder = $('<div id="placeholder" style="width: 100%;height: 100%">');
        placeholder.appendTo(fixture);

        jasmine.addMatchers({
            toBeAnyOf: function (util, customEqualityTesters) {
                return {
                    compare: function (actual, expected) {
                        var res = false;
                        for (var i = 0, l = expected.length; i < l; i++) {
                            if (actual === expected[i]) {
                                res = true;
                                break;
                            }
                        }
                        return {
                            pass: res
                        };
                    }
                };
            }
        });

        jasmine.clock().install();
    });

    afterEach(function () {
        plot.shutdown();
        $('#placeholder').empty();
        jasmine.clock().uninstall();
    });

    it('should become selected on mouse down on cursor and unselected on mouseup', function () {
        plot = $.plot("#placeholder", [sampledata], {
            pan: {
                interactive: true
            },
            rangecursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue',
                    position: { relativeStart: 0.5, relativeEnd: 0.6 }
                }
            ]
        });
        jasmine.clock().tick(20);

        cursor = plot.getRangeCursors()[0];
        var options = { mouseX: plot.getPlotOffset().left + plot.width() * 0.5,
            mouseY: plot.getPlotOffset().top + plot.height() * 0.6 };
        $('.flot-overlay').simulate("flotdragstart", options);
        jasmine.clock().tick(20);
        expect(cursor.selected).toBe(true);

        $('.flot-overlay').simulate("flotdragend", options);
        jasmine.clock().tick(20);
        expect(cursor.selected).toBe(false);
    });

    it('should not become selected on mouse down if not visible', function () {
        plot = $.plot("#placeholder", [sampledata], {
            rangecursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue',
                    position: { relativeStart: 0.5, relativeEnd: 0.6 },
                    show: false
                }
            ]
        });
        jasmine.clock().tick(20);

        cursor = plot.getRangeCursors()[0];
        var options = {
            mouseX: plot.getPlotOffset().left + plot.width() * 0.5,
            mouseY: plot.getPlotOffset().top + plot.height() * 0.6
        };
        $('.flot-overlay').simulate("flotdragstart", options);
        expect(cursor.selected).not.toBe(true);
        $('.flot-overlay').simulate("flotdragend", options);
    });

    it('should become selected on mouse down on cursor between lines and unselected on mouseup', function () {
        plot = $.plot("#placeholder", [sampledata], {
            rangecursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue',
                    position: {
                        relativeStart: 0.5,
                        relativeEnd: 0.6
                    }
                }
            ]
        });
        jasmine.clock().tick(20);

        cursor = plot.getRangeCursors()[0];
        cursorX = plot.getPlotOffset().left + plot.width() * 0.5 + 20;
        cursorY = plot.getPlotOffset().top + plot.height() * 0.2;
        var options = { mouseX: cursorX,
            mouseY: cursorY };

        $('.flot-overlay').simulate("flotdragstart", options);
        expect(cursor.selected).toBe(true);

        $('.flot-overlay').simulate("flotdragend", options);
        expect(cursor.selected).toBe(false);
    });

    it('should become selected on mouse down on cursor horizontal line and unselected on mouseup', function () {
        plot = $.plot("#placeholder", [sampledata], {
            rangecursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue',
                    orientation: 'horizontal',
                    position: { relativeStart: 0.5, relativeEnd: 0.6 }
                }
            ]
        });
        jasmine.clock().tick(20);

        cursor = plot.getRangeCursors()[0];
        cursorX = plot.getPlotOffset().left + plot.width() * 0.3;
        cursorY = plot.getPlotOffset().top + plot.height() * 0.5 + 20;
        var options = { mouseX: cursorX, mouseY: cursorY };

        $('.flot-overlay').simulate("flotdragstart", options);
        expect(cursor.selected).toBe(true);

        $('.flot-overlay').simulate("flotdragend", options);
        expect(cursor.selected).toBe(false);
    });

    it('should not be possible to move a cursor with movable set to false', function () {
        plot = $.plot("#placeholder", [sampledata], {
            rangecursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue',
                    position: { relativeStart: 0.5, relativeEnd: 0.6 },
                    movable: false
                }
            ]
        });

        jasmine.clock().tick(20);

        var plotOffset = plot.getPlotOffset();
        var cursorX = plotOffset.left + plot.width() * 0.5 + 20;
        var cursorY = plotOffset.top + plot.height() * 0.6;

        var options = { mouseX: cursorX, mouseY: cursorY, dx: 13, dy: 5 };
        $('.flot-overlay').simulate("flotdrag", options);

        var cursor = plot.getRangeCursors()[0];
        expect(cursor.start).toBeCloseTo(plot.width() * 0.5, -1);
        expect(cursor.end).toBeCloseTo(plot.width() * 0.6, -1);
    });

    it('should not be possible to move a cursor that is not visible', function () {
        plot = $.plot("#placeholder", [sampledata], {
            rangecursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue',
                    position: {
                        relativeStart: 0.5,
                        relativeEnd: 0.6
                    },
                    show: false
                }
            ]
        });

        jasmine.clock().tick(20);

        var cursorX = plot.offset().left + plot.width() * 0.5 + 20;
        var cursorY = plot.offset().top + plot.height() * 0.6;

        var options = { mouseX: cursorX,
            mouseY: cursorY,
            dx: 13,
            dy: 5 };
        $('.flot-overlay').simulate("flotdrag", options);

        var cursor = plot.getRangeCursors()[0];
        expect(cursor.start).toBeCloseTo(plot.width() * 0.5, 0);
        expect(cursor.end).toBeCloseTo(plot.width() * 0.6, 0);
    });

    it('should be constrained on the right side by the chart margin when dragging', function () {
        plot = $.plot("#placeholder", [sampledata], {
            rangecursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue',
                    position: { relativeStart: 0.5, relativeEnd: 0.6 }
                }
            ],
            yaxes: [ { position: 'right' } ]
        });

        var plotOffset = plot.getPlotOffset();
        var dragX = plot.width() * 0.5 + 5;

        var cursorX = plotOffset.left + plot.width() * 0.5 + 20;
        var cursorY = plotOffset.top + plot.height() * 0.5;

        jasmine.clock().tick(20);

        var options = { mouseX: cursorX,
            mouseY: cursorY,
            dx: dragX };
        $('.flot-overlay').simulate("flotdrag", options);

        jasmine.clock().tick(20);
        var cursor = plot.getRangeCursors()[0];
        expect(cursor.start).toBeCloseTo(plot.width() * 0.9, 1);
        expect(cursor.end).toBeCloseTo(plot.width(), -1);
    });

    it('should not be constrained on the right side by the chart margin when dragging if constrainToEdge is false', function () {
        plot = $.plot("#placeholder", [sampledata], {
            rangecursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue',
                    constrainToEdge: false,
                    position: { relativeStart: 0.5, relativeEnd: 0.6 }
                }
            ],
            yaxes: [ { position: 'right' } ]
        });

        var plotOffset = plot.getPlotOffset();
        var dragX = plot.width() * 0.5 + 5;

        var cursorX = plotOffset.left + plot.width() * 0.5 + 20;
        var cursorY = plotOffset.top + plot.height() * 0.5;

        jasmine.clock().tick(20);

        var options = { mouseX: cursorX,
            mouseY: cursorY,
            dx: dragX };
        $('.flot-overlay').simulate("flotdrag", options);

        jasmine.clock().tick(20);
        var cursor = plot.getRangeCursors()[0];
        expect(cursor.start).not.toBeCloseTo(plot.width() * 0.9, 1);
        expect(cursor.end).not.toBeCloseTo(plot.width(), -1);
    });

    it('should be constrained on the top side by the chart margin when dragging', function () {
        plot = $.plot("#placeholder", [sampledata], {
            rangecursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue',
                    orientation: 'horizontal',
                    position: { relativeStart: 0.5, relativeEnd: 0.6 }
                }
            ],
            xaxes: [ { position: 'top' } ]
        });

        jasmine.clock().tick(20);

        var plotOffset = plot.getPlotOffset();
        var cursorX = plotOffset.left + plot.width() * 0.5;
        var cursorY = plotOffset.top + plot.height() * 0.5 + 20;

        var dragY = -(plot.height() * 0.6 + 5);
        var options = { mouseX: cursorX,
            mouseY: cursorY,
            dy: dragY };
        $('.flot-overlay').simulate("flotdrag", options);

        jasmine.clock().tick(20);
        var cursor = plot.getRangeCursors()[0];
        expect(cursor.start).toBe(0);
        expect(cursor.end).toBeCloseTo(plot.height() * 0.1);
    });

    it('should not be constrained on the top side by the chart margin when dragging when constrainToEdge is false', function () {
        plot = $.plot("#placeholder", [sampledata], {
            rangecursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue',
                    constrainToEdge: false,
                    orientation: 'horizontal',
                    position: { relativeStart: 0.5, relativeEnd: 0.6 }
                }
            ],
            xaxes: [ { position: 'top' } ]
        });

        jasmine.clock().tick(20);

        var plotOffset = plot.getPlotOffset();
        var cursorX = plotOffset.left + plot.width() * 0.5;
        var cursorY = plotOffset.top + plot.height() * 0.5 + 20;

        var dragY = -(plot.height() * 0.6 + 5);
        var options = { mouseX: cursorX,
            mouseY: cursorY,
            dy: dragY };
        $('.flot-overlay').simulate("flotdrag", options);

        jasmine.clock().tick(20);
        var cursor = plot.getRangeCursors()[0];
        expect(cursor.start).not.toBe(0);
        expect(cursor.end).not.toBeCloseTo(plot.height() * 0.1);
    });

    it('should be constrained on the bottom side by the chart margin when dragging', function () {
        plot = $.plot("#placeholder", [sampledata], {
            rangecursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue',
                    orientation: 'horizontal',
                    position: { relativeStart: 0.5, relativeEnd: 0.6 }
                }
            ]
        });

        jasmine.clock().tick(20);

        var plotOffset = plot.getPlotOffset();
        var cursorX = plotOffset.left + plot.width() * 0.5;
        var cursorY = plotOffset.top + plot.height() * 0.5 + 20;

        var dragY = plot.height() * 0.4 + 5;
        var options = { mouseX: cursorX,
            mouseY: cursorY,
            dy: dragY };
        $('.flot-overlay').simulate("flotdrag", options);

        jasmine.clock().tick(20);
        var cursor = plot.getRangeCursors()[0];
        expect(cursor.start).toBeCloseTo(plot.height() * 0.9);
        expect(cursor.end).toBe(plot.height());
    });

    it('should not be constrained on the bottom side by the chart margin when dragging if constrainToEdge is false', function () {
        plot = $.plot("#placeholder", [sampledata], {
            rangecursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue',
                    constrainToEdge: false,
                    orientation: 'horizontal',
                    position: { relativeStart: 0.5, relativeEnd: 0.6 }
                }
            ]
        });

        jasmine.clock().tick(20);

        var plotOffset = plot.getPlotOffset();
        var cursorX = plotOffset.left + plot.width() * 0.5;
        var cursorY = plotOffset.top + plot.height() * 0.5 + 20;

        var dragY = plot.height() * 0.4 + 5;
        var options = { mouseX: cursorX,
            mouseY: cursorY,
            dy: dragY };
        $('.flot-overlay').simulate("flotdrag", options);

        jasmine.clock().tick(20);
        var cursor = plot.getRangeCursors()[0];
        expect(cursor.start).not.toBeCloseTo(plot.height() * 0.9);
        expect(cursor.end).not.toBe(plot.height());
    });

    it('should only move the start edge when the mouse is dragging the start edge', function () {
        plot = $.plot("#placeholder", [sampledata], {
            rangecursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue',
                    position: { relativeStart: 0.5, relativeEnd: 0.6 }
                }
            ]
        });

        jasmine.clock().tick(20);

        var plotOffset = plot.getPlotOffset();
        var cursorX = plotOffset.left + plot.width() * 0.5;
        var cursorY = plotOffset.top + plot.height() * 0.6;

        var options = { mouseX: cursorX, mouseY: cursorY, dx: -13, dy: 0 };
        $('.flot-overlay').simulate("flotdrag", options);

        jasmine.clock().tick(20);
        var cursor = plot.getRangeCursors()[0];
        expect(cursor.start).toBeCloseTo(plot.width() * 0.5 - 13);
        expect(cursor.end).toBeCloseTo(plot.width() * 0.6);
    });

    it('should only move the end edge when the mouse is dragging the end edge', function () {
        plot = $.plot("#placeholder", [sampledata], {
            rangecursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue',
                    position: { relativeStart: 0.5, relativeEnd: 0.6 }
                }
            ]
        });

        jasmine.clock().tick(20);

        var plotOffset = plot.getPlotOffset();
        var cursorX = plotOffset.left + plot.width() * 0.6;
        var cursorY = plotOffset.top + plot.height() * 0.6;

        var options = { mouseX: cursorX, mouseY: cursorY, dx: 13, dy: 0 };
        $('.flot-overlay').simulate("flotdrag", options);

        jasmine.clock().tick(20);
        var cursor = plot.getRangeCursors()[0];
        expect(cursor.start).toBeCloseTo(plot.width() * 0.5);
        expect(cursor.end).toBeCloseTo(Math.floor(plot.width() * 0.6 + 13));
    });

    it('should be possible to drag cursors with the mouse from the vertical line if the cursor is positioned relative to axes', function () {
        plot = $.plot("#placeholder", [sampledata], {
            rangecursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue',
                    position: { start: 0, end: 1 }
                }
            ]
        });

        var plotOffset = plot.getPlotOffset();
        var cursorX = plotOffset.left + 20;
        var cursorY = plotOffset.top + plot.height() - 20;

        jasmine.clock().tick(20);

        var dragX = 13;
        var options = { mouseX: cursorX,
            mouseY: cursorY,
            dx: dragX };
        $('.flot-overlay').simulate("flotdrag", options);

        jasmine.clock().tick(20);

        var cursor = plot.getRangeCursors()[0];
        expect(cursor.start).toBeCloseTo(dragX, 0);
    });

    it('should be possible to drag cursors with the mouse from the horizontal line if the cursor is positioned relative to axes', function () {
        plot = $.plot("#placeholder", [sampledata], {
            rangecursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue',
                    orientation: 'horizontal',
                    position: { start: 1.23, end: 1.13 }
                }
            ]
        });

        var plotOffset = plot.getPlotOffset();
        var cursorX = plotOffset.left + 20;
        var cursorY = plotOffset.top + 20;

        jasmine.clock().tick(20);

        var dragY = 13;
        var options = { mouseX: cursorX,
            mouseY: cursorY,
            dy: dragY };
        $('.flot-overlay').simulate("flotdrag", options);

        jasmine.clock().tick(20);

        var cursor = plot.getRangeCursors()[0];
        expect(cursor.start).toBeCloseTo(dragY, -1);
    });

    it('should prevent default action of the event when moving a cursor', function () {
        plot = $.plot("#placeholder", [sampledata], {
            rangecursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue',
                    position: { relativeStart: 0.5, relativeEnd: 0.6 }
                }
            ]
        });

        var plotOffset = plot.getPlotOffset();
        var cursorX = plotOffset.left + plot.width() * 0.5;
        var cursorY = plotOffset.top + plot.height() * 0.6;

        jasmine.clock().tick(20);

        var eventHolder = plot.getEventHolder();
        var event = simulate.mouseDown(eventHolder, cursorX, cursorY);
        jasmine.clock().tick(20);
        expect(event.defaultPrevented).toBeTruthy();

        cursorX += 13;
        cursorY += 5;

        event = simulate.mouseMove(eventHolder, cursorX, cursorY);
        jasmine.clock().tick(20);
        // The native mouseMove event can't be default prevented

        event = simulate.mouseUp(eventHolder, cursorX, cursorY);
        jasmine.clock().tick(20);
        expect(event.defaultPrevented).toBeTruthy();
    });

    it('should not move the cursor anymore after the mouse button was released outside the plot area', function () {
        plot = $.plot("#placeholder", [sampledata], {
            rangecursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue',
                    position: { relativeStart: 0.5, relativeEnd: 0.6 }
                }
            ]
        });

        var cursorX = plot.offset().left + plot.width() * 0.5;
        var cursorY = plot.offset().top + plot.height() * 0.6;

        jasmine.clock().tick(20);

        var eventHolder = $('#placeholder').find('.flot-overlay');
        eventHolder.trigger(new $.Event('mousedown', { pageX: cursorX, pageY: cursorY }));
        jasmine.clock().tick(20);
        eventHolder.trigger(new $.Event('mousemove', { pageX: cursorX + 10000, pageY: cursorY + 10000 }));
        jasmine.clock().tick(20);
        $(document).trigger(new $.Event('mouseup', { pageX: cursorX + 10000, pageY: cursorY + 10000 }));
        jasmine.clock().tick(20);
        eventHolder.trigger(new $.Event('mousemove', { pageX: cursorX + 13, pageY: cursorY + 5, buttons: 0 }));
        jasmine.clock().tick(20);

        var cursor = plot.getRangeCursors()[0];
        expect(cursor.selected).toBe(false);
        expect(cursor.start).not.toBe(plot.height() * 0.5 + 13);
        expect(cursor.end).not.toBe(plot.height() * 0.6 + 5);
    });

    it('should not pan the graph when dragging the cursor outside the plot area', function () {
        plot = $.plot("#placeholder", [sampledata], {
            pan: {
                interactive: true
            },
            rangecursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue',
                    position: { relativeStart: 0.5, relativeEnd: 0.6 }
                }
            ]
        });

        var cursorX = plot.offset().left + plot.width() * 0.5 + 20;
        var cursorY = plot.offset().top + plot.height() * 0.5;

        jasmine.clock().tick(20);

        var xAxes = plot.getXAxes();
        var xMin = xAxes[0].min;
        var xMax = xAxes[0].max;
        var eventHolder = $('#placeholder').find('.flot-overlay');
        eventHolder.trigger(new $.Event('mousedown', { pageX: cursorX, pageY: cursorY, clientX: cursorX, clientY: cursorY, which: 1, button: 0 }));
        jasmine.clock().tick(20);
        $(document).trigger(new $.Event('mousemove', { pageX: cursorX, pageY: cursorY, clientX: cursorX, clientY: cursorY, which: 1, button: 0 }));
        jasmine.clock().tick(20);
        $(document).trigger(new $.Event('mousemove', { pageX: cursorX + 1010, pageY: cursorY + 1010, clientX: cursorX + 1010, clientY: cursorY, which: 1, button: 0 }));
        jasmine.clock().tick(20);
        $(document).trigger(new $.Event('mouseup', { pageX: cursorX + 1010, pageY: cursorY + 1010, clientX: cursorX + 1010, clientY: cursorY, which: 1, button: 0 }));
        jasmine.clock().tick(20);

        expect(xAxes[0].min).toEqual(xMin);
        expect(xAxes[0].max).toEqual(xMax);
    });

    describe('Mouse pointer', function () {
        it('should change the mouse pointer on mouse over the cursor vertical line', function () {
            plot = $.plot("#placeholder", [sampledata], {
                rangecursors: [
                    {
                        name: 'Blue cursor',
                        color: 'blue',
                        position: { relativeStart: 0.5, relativeEnd: 0.6 }
                    }
                ]
            });

            var plotOffset = plot.getPlotOffset();
            var cursorX = plotOffset.left + plot.width() * 0.5;
            var cursorY = plotOffset.top + plot.height() * 0.6 / 2;

            jasmine.clock().tick(20);

            var eventHolder = plot.getEventHolder();
            simulate.mouseMove(eventHolder, cursorX, cursorY);

            expect($('#placeholder').css('cursor')).toBe('col-resize');
        });

        it('shouldn\'t change the mouse pointer when the mouse is at the same x but the cursor doesn\'t have a vertical line', function () {
            plot = $.plot("#placeholder", [sampledata], {
                rangecursors: [
                    {
                        name: 'Blue cursor',
                        orientation: 'horizontal',
                        color: 'blue',
                        position: { relativeStart: 0.5, relativeEnd: 0.6 }
                    }
                ]
            });

            var plotOffset = plot.getPlotOffset();
            var cursorX = plotOffset.left + plot.width() * 0.5;
            var cursorY = plotOffset.top + plot.height() * 0.6 / 2;

            jasmine.clock().tick(20);

            var eventHolder = plot.getEventHolder();
            simulate.mouseMove(eventHolder, cursorX, cursorY);

            expect($('#placeholder').css('cursor')).toBeAnyOf(['auto', 'default']);
        });

        it('should change the mouse pointer on mouse over the cursor horizontal line', function () {
            plot = $.plot("#placeholder", [sampledata], {
                rangecursors: [
                    {
                        name: 'Blue cursor',
                        color: 'blue',
                        orientation: 'horizontal',
                        position: { relativeStart: 0.5, relativeEnd: 0.6 }
                    }
                ]
            });

            var plotOffset = plot.getPlotOffset();
            var cursorX = plotOffset.left + plot.width() * 0.5 / 2;
            var cursorY = plotOffset.top + plot.height() * 0.6;

            jasmine.clock().tick(20);

            var eventHolder = plot.getEventHolder();
            simulate.mouseMove(eventHolder, cursorX, cursorY);

            expect($('#placeholder').css('cursor')).toBe('row-resize');
        });

        it('should set the mouse pointer of the holder div to default on chart shutdown', function () {
            plot = $.plot("#placeholder", [sampledata], {
                rangecursors: [
                    {
                        name: 'Blue cursor',
                        color: 'blue',
                        position: { relativeStart: 0.5, relativeEnd: 0.6 }
                    }
                ]
            });

            var plotOffset = plot.getPlotOffset();
            var cursorX = plotOffset.left + plot.width() * 0.5;
            var cursorY = plotOffset.top + plot.height() * 0.6;

            jasmine.clock().tick(20);

            var eventHolder = plot.getEventHolder();
            simulate.mouseMove(eventHolder, cursorX, cursorY);

            expect($('#placeholder').css('cursor')).toBe('col-resize');

            plot.shutdown();

            expect($('#placeholder').css('cursor')).toBeAnyOf(['auto', 'default']);
        });
    });
});
