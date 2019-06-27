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

    it('should become selected on mouse down on cursor manipulator and unselected on mouseup', function () {
        plot = $.plot("#placeholder", [sampledata], {
            pan: {
                interactive: true
            },
            cursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue',
                    position: { relativeX: 0.5, relativeY: 0.6 }
                }
            ]
        });
        jasmine.clock().tick(20);

        cursor = plot.getCursors()[0];
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
            cursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue',
                    position: { relativeX: 0.5, relativeY: 0.6 },
                    show: false
                }
            ]
        });
        jasmine.clock().tick(20);

        cursor = plot.getCursors()[0];
        var options = {
            mouseX: plot.getPlotOffset().left + plot.width() * 0.5,
            mouseY: plot.getPlotOffset().top + plot.height() * 0.6
        };
        $('.flot-overlay').simulate("flotdragstart", options);
        expect(cursor.selected).not.toBe(true);
        $('.flot-overlay').simulate("flotdragend", options);
    });

    it('should become selected on mouse down on cursor vertical line and unselected on mouseup', function () {
        plot = $.plot("#placeholder", [sampledata], {
            cursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue',
                    position: {
                        relativeX: 0.5,
                        relativeY: 0.6
                    }
                }
            ]
        });
        jasmine.clock().tick(20);

        cursor = plot.getCursors()[0];
        cursorX = plot.getPlotOffset().left + plot.width() * 0.5;
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
            cursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue',
                    position: { relativeX: 0.5, relativeY: 0.6 }
                }
            ]
        });
        jasmine.clock().tick(20);

        cursor = plot.getCursors()[0];
        cursorX = plot.getPlotOffset().left + plot.width() * 0.3;
        cursorY = plot.getPlotOffset().top + plot.height() * 0.6;
        var options = { mouseX: cursorX, mouseY: cursorY };

        $('.flot-overlay').simulate("flotdragstart", options);
        expect(cursor.selected).toBe(true);

        $('.flot-overlay').simulate("flotdragend", options);
        expect(cursor.selected).toBe(false);
    });

    it('should be possible to drag cursors with the mouse from the cursor manipulator', function () {
        plot = $.plot("#placeholder", [sampledata], {
            cursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue',
                    position: { relativeX: 0.5, relativeY: 0.6 }
                }
            ]
        });

        var plotOffset = plot.getPlotOffset();
        var cursorX = plotOffset.left + plot.width() * 0.5;
        var cursorY = plotOffset.top + plot.height() * 0.6;

        jasmine.clock().tick(20);

        var options = { mouseX: cursorX, mouseY: cursorY, dx: 13, dy: 5 };
        $('.flot-overlay').simulate("flotdrag", options);

        var cursor = plot.getCursors()[0];
        expect(cursor.x).toBeCloseTo(plot.width() * 0.5 + 13, -1);
        expect(cursor.y).toBeCloseTo(plot.height() * 0.6 + 5, -1);
    });

    it('should not be possible to move a cursor with movable set to false', function () {
        plot = $.plot("#placeholder", [sampledata], {
            cursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue',
                    position: { relativeX: 0.5, relativeY: 0.6 },
                    movable: false
                }
            ]
        });

        jasmine.clock().tick(20);

        var plotOffset = plot.getPlotOffset();
        var cursorX = plotOffset.left + plot.width() * 0.5;
        var cursorY = plotOffset.top + plot.height() * 0.6;

        var options = { mouseX: cursorX, mouseY: cursorY, dx: 13, dy: 5 };
        $('.flot-overlay').simulate("flotdrag", options);

        var cursor = plot.getCursors()[0];
        expect(cursor.x).toBeCloseTo(plot.width() * 0.5, -1);
        expect(cursor.y).toBeCloseTo(plot.height() * 0.6, -1);
    });

    it('should not be possible to move a cursor that is not visible', function () {
        plot = $.plot("#placeholder", [sampledata], {
            cursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue',
                    position: {
                        relativeX: 0.5,
                        relativeY: 0.6
                    },
                    show: false
                }
            ]
        });

        jasmine.clock().tick(20);

        var cursorX = plot.offset().left + plot.width() * 0.5;
        var cursorY = plot.offset().top + plot.height() * 0.6;

        var options = { mouseX: cursorX,
            mouseY: cursorY,
            dx: 13,
            dy: 5 };
        $('.flot-overlay').simulate("flotdrag", options);

        var cursor = plot.getCursors()[0];
        expect(cursor.x).toBeCloseTo(plot.width() * 0.5, 0);
        expect(cursor.y).toBeCloseTo(plot.height() * 0.6, 0);
    });

    it('should be constrained on the right side by the chart margin when dragging', function () {
        plot = $.plot("#placeholder", [sampledata], {
            cursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue',
                    position: { relativeX: 0.5, relativeY: 0.6 }
                }
            ],
            yaxes: [ { position: 'right' } ]
        });

        var plotOffset = plot.getPlotOffset();
        var dragX = plot.width() * 0.5 + 5;

        var cursorX = plotOffset.left + plot.width() * 0.5;
        var cursorY = plotOffset.top + plot.height() * 0.6;

        jasmine.clock().tick(20);

        var options = { mouseX: cursorX,
            mouseY: cursorY,
            dx: dragX };
        $('.flot-overlay').simulate("flotdrag", options);

        var cursor = plot.getCursors()[0];
        expect(cursor.x).toBeCloseTo(plot.width(), 1);
        expect(cursor.y).toBeCloseTo(plot.height() * 0.6, -1);
    });

    it('should be constrained on the top side by the chart margin when dragging', function () {
        plot = $.plot("#placeholder", [sampledata], {
            cursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue',
                    position: { relativeX: 0.5, relativeY: 0.6 }
                }
            ],
            xaxes: [ { position: 'top' } ]
        });

        jasmine.clock().tick(20);

        var plotOffset = plot.getPlotOffset();
        var cursorX = plotOffset.left + plot.width() * 0.5;
        var cursorY = plotOffset.top + plot.height() * 0.6;

        var dragY = -(plot.height() * 0.6 + 5);
        var options = { mouseX: cursorX,
            mouseY: cursorY,
            dy: dragY };
        $('.flot-overlay').simulate("flotdrag", options);

        var cursor = plot.getCursors()[0];
        expect(cursor.x).toBe(plot.width() * 0.5);
        expect(cursor.y).toBe(0);
    });

    it('should be constrained on the bottom side by the chart margin when dragging', function () {
        plot = $.plot("#placeholder", [sampledata], {
            cursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue',
                    position: { relativeX: 0.5, relativeY: 0.6 }
                }
            ]
        });

        jasmine.clock().tick(20);

        var plotOffset = plot.getPlotOffset();
        var cursorX = plotOffset.left + plot.width() * 0.5;
        var cursorY = plotOffset.top + plot.height() * 0.6;

        var dragY = plot.height() * 0.4 + 5;
        var options = { mouseX: cursorX,
            mouseY: cursorY,
            dy: dragY };
        $('.flot-overlay').simulate("flotdrag", options);

        var cursor = plot.getCursors()[0];
        expect(cursor.x).toBe(plot.width() * 0.5);
        expect(cursor.y).toBe(plot.height());
    });

    [
        { mode: 'horizontal', thumbLocation: 't', edge: 'topleft' },
        { mode: 'horizontal', thumbLocation: 't', edge: 'topright' },
        { mode: 'horizontal', thumbLocation: 'b', edge: 'bottomleft' },
        { mode: 'horizontal', thumbLocation: 'b', edge: 'bottomright' },
        { mode: 'vertical', thumbLocation: 'l', edge: 'topleft' },
        { mode: 'vertical', thumbLocation: 'l', edge: 'bottomleft' },
        { mode: 'vertical', thumbLocation: 'r', edge: 'topright' },
        { mode: 'vertical', thumbLocation: 'r', edge: 'bottomright' }
    ].forEach((data) => {
        it(`should fire thumbOutOfRange event exactly when moving a ${data.mode} cursor off the graph at ${data.edge} side`, () => {
            plot = $.plot("#placeholder", [sampledata], {
                cursors: [
                    {
                        name: 'Blue cursor',
                        color: 'blue',
                        position: data.mode === 'horizontal' ? { relativeX: 0.5 } : { relativeY: 0.5 },
                        mode: data.mode === 'horizontal' ? 'x' : 'y',
                        showThumbs: data.thumbLocation
                    }
                ]
            });

            plot.setPlotPositionConstrain((mouseX, mouseY) => {
                const offset = plot.offset();
                // expand 1 pixel at all directions
                return [
                    Math.max(-1, Math.min(mouseX - offset.left, plot.width() + 1)),
                    Math.max(-1, Math.min(mouseY - offset.top, plot.height() + 1))
                ];
            });

            jasmine.clock().tick(20);

            const thumbOutOfRangeHandler = jasmine.createSpy('thumbOutOfRange');
            plot.getEventHolder().addEventListener('thumbOutOfRange', thumbOutOfRangeHandler);

            const plotOffset = plot.getPlotOffset();
            const cursorX = plotOffset.left + plot.width() * 0.5;
            const cursorY = plotOffset.top + plot.height() * 0.5;
            const getDelta = () => {
                if (data.mode === 'horizontal' && data.edge.includes('left')) {
                    return { x: -(plot.width() * 0.5 + 5), y: 0 }
                } else if (data.mode === 'horizontal' && data.edge.includes('right')) {
                    return { x: plot.width() * 0.5 + 5, y: 0 };
                } else if (data.mode === 'vertical' && data.edge.includes('top')) {
                    return { x: 0, y: -(plot.height() + 5) };
                } else if (data.mode === 'vertical' && data.edge.includes('bottom')) {
                    return { x: 0, y: plot.height() + 5 };
                }
            };
            const delta = getDelta();
            const options = {
                mouseX: cursorX,
                mouseY: cursorY,
                dx: delta.x,
                dy: delta.y
            };
            $('.flot-overlay').simulate("flotdrag", options);

            jasmine.clock().tick(20);

            expect(thumbOutOfRangeHandler).toHaveBeenCalledTimes(1);
            const eventObject = thumbOutOfRangeHandler.calls.argsFor(0)[0];
            const cursor = plot.getCursors()[0];
            expect(eventObject.detail.orientation).toBe(data.mode);
            expect(eventObject.detail.edge).toBe(data.edge);
            expect(eventObject.detail.target).toBe(cursor.thumbs[0]);
        });
    });

    [
        { mode: 'horizontal', thumbLocation: 't', edge: 'topleft' },
        { mode: 'horizontal', thumbLocation: 't', edge: 'topright' },
        { mode: 'horizontal', thumbLocation: 'b', edge: 'bottomleft' },
        { mode: 'horizontal', thumbLocation: 'b', edge: 'bottomright' },
        { mode: 'vertical', thumbLocation: 'l', edge: 'topleft' },
        { mode: 'vertical', thumbLocation: 'l', edge: 'bottomleft' },
        { mode: 'vertical', thumbLocation: 'r', edge: 'topright' },
        { mode: 'vertical', thumbLocation: 'r', edge: 'bottomright' }
    ].forEach((data) => {
        it(`should fire thumbIntoRange event exactly when moving a ${data.mode} cursor into the graph at ${data.edge} side`, () => {
            const getInitialPosition = () => {
                if (data.mode === 'horizontal' && data.edge.includes('left')) {
                    return { relativeX: -0.05 };
                } else if (data.mode === 'horizontal' && data.edge.includes('right')) {
                    return { relativeX: 1.05 }
                } else if (data.mode === 'vertical' && data.edge.includes('top')) {
                    return { relativeY: -0.05 };
                } else if (data.mode === 'vertical' && data.edge.includes('bottom')) {
                    return { relativeY: 1.05 };
                }
            };
            plot = $.plot("#placeholder", [sampledata], {
                cursors: [
                    {
                        name: 'Blue cursor',
                        color: 'blue',
                        position: getInitialPosition(),
                        mode: data.mode === 'horizontal' ? 'x' : 'y',
                        showThumbs: data.thumbLocation
                    }
                ],
                pan: {
                    interactive: true
                }
            });

            jasmine.clock().tick(20);

            const spy = jasmine.createSpy('thumbIntoRange');
            plot.getEventHolder().addEventListener('thumbIntoRange', spy);

            const plotOffset = plot.getPlotOffset();
            const cursorX = plotOffset.left + plot.width() * 0.5;
            const cursorY = plotOffset.top + plot.height() * 0.5;
            const getDelta = () => {
                if (data.mode === 'horizontal' && data.edge.includes('left')) {
                    return { x: 100, y: 0 };
                } else if (data.mode === 'horizontal' && data.edge.includes('right')) {
                    return { x: -100, y: 0 }
                } else if (data.mode === 'vertical' && data.edge.includes('top')) {
                    return { x: 0, y: 100 };
                } else if (data.mode === 'vertical' && data.edge.includes('bottom')) {
                    return { x: 0, y: -100 };
                }
            };
            const delta = getDelta();
            const options = {
                mouseX: cursorX,
                mouseY: cursorY,
                dx: delta.x,
                dy: delta.y
            };
            $('.flot-overlay').simulate("flotdrag", options);

            jasmine.clock().tick(20);

            expect(spy).toHaveBeenCalledTimes(1);
            const eventObject = spy.calls.argsFor(0)[0];
            const cursor = plot.getCursors()[0];
            expect(eventObject.detail.orientation).toBe(data.mode);
            expect(eventObject.detail.edge).toBe(data.edge);
            expect(eventObject.detail.target).toBe(cursor.thumbs[0]);
        });
    });

    it('should be possible to drag cursors with the mouse from the cursor manipulator while the chart updates', function () {
        plot = $.plot("#placeholder", [sampledata], {
            cursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue',
                    position: { relativeX: 0.5, relativeY: 0.6 }
                }
            ]
        });

        jasmine.clock().tick(20);

        var plotOffset = plot.getPlotOffset();
        var cursorX = plotOffset.left + plot.width() * 0.5;
        var cursorY = plotOffset.top + plot.height() * 0.6;

        var updateChart = function () {
            plot.setData([[[0, 1.2], [1, 1.1], [2, 1]]]);
            plot.setupGrid();
            plot.draw();
        };

        jasmine.clock().tick(20);

        var options = { mouseX: cursorX,
            mouseY: cursorY };
        $('.flot-overlay').simulate("flotdragstart", options);
        updateChart();
        jasmine.clock().tick(20);

        options = { mouseX: cursorX + 13,
            mouseY: cursorY + 5 };
        $('.flot-overlay').simulate("flotdragend", options);
        var cursor = plot.getCursors()[0];
        expect(cursor.x).toBeCloseTo(plot.width() * 0.5 + 13, -1);
        expect(cursor.y).toBeCloseTo(plot.height() * 0.6 + 5, -1);
    });

    it('should be possible to drag cursors with the mouse from the vertical line if the cursor is positioned relative to axes', function () {
        plot = $.plot("#placeholder", [sampledata], {
            cursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue',
                    position: { x: 0.5, y: 1 }
                }
            ]
        });

        var plotOffset = plot.getPlotOffset();

        jasmine.clock().tick(20);

        var cursorX = plot.getXAxes()[0].p2c(0.5) + plotOffset.left;
        var cursorY = plot.getYAxes()[0].p2c(1.1) + plotOffset.top;

        var dragX = 13;
        var options = { mouseX: cursorX,
            mouseY: cursorY,
            dx: dragX };
        $('.flot-overlay').simulate("flotdrag", options);

        jasmine.clock().tick(20);

        var cursor = plot.getCursors()[0];
        expect(cursor.x).toBeCloseTo(cursorX + dragX - plotOffset.left, 0);
    });

    it('should be possible to drag cursors with the mouse from the horizontal line if the cursor is positioned relative to axes', function () {
        plot = $.plot("#placeholder", [sampledata], {
            cursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue',
                    mode: 'y',
                    position: { x: 0.5, y: 1 }
                }
            ]
        });

        var plotOffset = plot.getPlotOffset();

        jasmine.clock().tick(20);

        var cursorX = plot.getXAxes()[0].p2c(0.6) + plotOffset.left;
        var cursorY = plot.getYAxes()[0].p2c(1.0) + plotOffset.top;

        var dragY = -13;
        var options = { mouseX: cursorX,
            mouseY: cursorY,
            dy: dragY };
        $('.flot-overlay').simulate("flotdrag", options);

        jasmine.clock().tick(20);

        var cursor = plot.getCursors()[0];
        expect(cursor.y).toBeCloseTo(cursorY + dragY - plotOffset.top, -1);
    });

    it('should be highlighted on mouse over the cursor manipulator', function () {
        plot = $.plot("#placeholder", [sampledata], {
            cursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue',
                    position: { relativeX: 0.5, relativeY: 0.6 }
                }
            ]
        });

        var plotOffset = plot.getPlotOffset();
        var cursorX = plotOffset.left + plot.width() * 0.5;
        var cursorY = plotOffset.top + plot.height() * 0.6;

        jasmine.clock().tick(20);

        var eventHolder = plot.getEventHolder();
        simulate.mouseMove(eventHolder, cursorX, cursorY);

        var cursor = plot.getCursors()[0];
        expect(cursor.highlighted).toBe(true);
    });

    it('should not be highlighted on mouse over the cursor manipulator if not visible', function () {
        plot = $.plot("#placeholder", [sampledata], {
            cursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue',
                    position: {
                        relativeX: 0.5,
                        relativeY: 0.6
                    },
                    show: false
                }
            ]
        });

        var cursorX = plot.offset().left + plot.width() * 0.5;
        var cursorY = plot.offset().top + plot.height() * 0.6;

        jasmine.clock().tick(20);

        $('#placeholder').find('.flot-overlay').trigger(new $.Event('mousemove', {
            pageX: cursorX,
            pageY: cursorY
        }));

        var cursor = plot.getCursors()[0];
        expect(cursor.highlighted).not.toBe(true);
    });

    it('should prevent default action of the event when moving a cursor', function () {
        plot = $.plot("#placeholder", [sampledata], {
            cursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue',
                    position: { relativeX: 0.5, relativeY: 0.6 }
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
            cursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue',
                    position: { relativeX: 0.5, relativeY: 0.6 }
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

        var cursor = plot.getCursors()[0];
        expect(cursor.selected).toBe(false);
        expect(cursor.y).not.toBe(plot.height() * 0.5 + 13);
        expect(cursor.y).not.toBe(plot.height() * 0.6 + 5);
    });

    it('should not pan the graph when dragging the cursor outside the plot area', function () {
        plot = $.plot("#placeholder", [sampledata], {
            pan: {
                interactive: true
            },
            cursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue',
                    position: { relativeX: 0.5, relativeY: 0.6 }
                }
            ]
        });

        var cursorX = plot.offset().left + plot.width() * 0.5;
        var cursorY = plot.offset().top + plot.height() * 0.6;

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
        it('should change the mouse pointer on mouse over the cursor manipulator', function () {
            plot = $.plot("#placeholder", [sampledata], {
                cursors: [
                    {
                        name: 'Blue cursor',
                        color: 'blue',
                        position: { relativeX: 0.5, relativeY: 0.6 }
                    }
                ]
            });

            var plotOffset = plot.getPlotOffset();
            var cursorX = plotOffset.left + plot.width() * 0.5;
            var cursorY = plotOffset.top + plot.height() * 0.6;

            jasmine.clock().tick(20);

            var eventHolder = plot.getEventHolder();
            simulate.mouseMove(eventHolder, cursorX, cursorY);

            expect($('#placeholder').css('cursor')).toBe('pointer');
        });

        it('should not change the mouse pointer on mouse over the cursor manipulator if not visible', function () {
            plot = $.plot("#placeholder", [sampledata], {
                cursors: [
                    {
                        name: 'Blue cursor',
                        color: 'blue',
                        position: { relativeX: 0.5, relativeY: 0.6 },
                        show: false
                    }
                ]
            });

            var plotOffset = plot.getPlotOffset();
            var cursorX = plotOffset.left + plot.width() * 0.5;
            var cursorY = plotOffset.top + plot.height() * 0.6;

            jasmine.clock().tick(20);

            var eventHolder = plot.getEventHolder();
            simulate.mouseMove(eventHolder, cursorX, cursorY);

            expect($('#placeholder').css('cursor')).not.toBe('pointer');
        });

        it('should change the mouse pointer when moving from the cursor vertical line to the cursor manipulator', function () {
            plot = $.plot("#placeholder", [sampledata], {
                cursors: [
                    {
                        name: 'Blue cursor',
                        color: 'blue',
                        position: { relativeX: 0.5, relativeY: 0.6 }
                    }
                ]
            });

            var plotOffset = plot.getPlotOffset();
            var cursorX = plotOffset.left + plot.width() * 0.5;
            var cursorY = plotOffset.top + plot.height() * 0.6 / 2;

            jasmine.clock().tick(20);

            var eventHolder = plot.getEventHolder();
            simulate.mouseMove(eventHolder, cursorX, cursorY);

            cursorY += plot.height() * 0.6 / 2;

            simulate.mouseMove(eventHolder, cursorX, cursorY);

            expect($('#placeholder').css('cursor')).toBe('pointer');
        });

        it('should change the mouse pointer on drag with the cursor manipulator', function () {
            plot = $.plot("#placeholder", [sampledata], {
                cursors: [
                    {
                        name: 'Blue cursor',
                        color: 'blue',
                        position: { relativeX: 0.5, relativeY: 0.6 }
                    }
                ]
            });

            var plotOffset = plot.getPlotOffset();
            var cursorX = plotOffset.left + plot.width() * 0.5;
            var cursorY = plotOffset.top + plot.height() * 0.6;

            jasmine.clock().tick(20);

            var options = { mouseX: cursorX,
                mouseY: cursorY };
            $('.flot-overlay').simulate("flotdragstart", options);

            expect($('#placeholder').css('cursor')).toBe('move');

            $('.flot-overlay').simulate("flotdragend", options);

            expect($('#placeholder').css('cursor')).toBe('default');
        });

        it('should change the mouse pointer on mouse over the cursor vertical line', function () {
            plot = $.plot("#placeholder", [sampledata], {
                cursors: [
                    {
                        name: 'Blue cursor',
                        color: 'blue',
                        position: { relativeX: 0.5, relativeY: 0.6 }
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
                cursors: [
                    {
                        name: 'Blue cursor',
                        mode: 'y',
                        color: 'blue',
                        position: { relativeX: 0.5, relativeY: 0.6 }
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
                cursors: [
                    {
                        name: 'Blue cursor',
                        color: 'blue',
                        position: { relativeX: 0.5, relativeY: 0.6 }
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
                cursors: [
                    {
                        name: 'Blue cursor',
                        color: 'blue',
                        position: { relativeX: 0.5, relativeY: 0.6 }
                    }
                ]
            });

            var plotOffset = plot.getPlotOffset();
            var cursorX = plotOffset.left + plot.width() * 0.5;
            var cursorY = plotOffset.top + plot.height() * 0.6;

            jasmine.clock().tick(20);

            var eventHolder = plot.getEventHolder();
            simulate.mouseMove(eventHolder, cursorX, cursorY);

            expect($('#placeholder').css('cursor')).toBe('pointer');

            plot.shutdown();

            expect($('#placeholder').css('cursor')).toBeAnyOf(['auto', 'default']);
        });
    });

    [true, false].forEach(function(longName) {
        var name = longName ? 'Long name' : '.',
            describeName = longName ? 'Long name and values location' : 'Short name and values location';

        describe(describeName, function () {
            var cursor, spy;

            beforeEach(function() {
                plot = $.plot("#placeholder", [sampledata], {
                    cursors: [
                        {
                            name: name,
                            color: 'blue',
                            position: { relativeX: 0.5, relativeY: 0.6 },
                            showLabel: true,
                            fontSize: '30px'
                        }
                    ]
                });
                cursor = plot.getCursors()[0];
                spy = spyOnFillText();
                jasmine.clock().tick(20);
            });

            it('should display the labels above the cursor`s position after it got to close to the bottom margin of the plot', function () {
                mouseDown(0.5, 0.6);

                spy.calls.reset();
                mouseMove(0.5, 0.9);
                expect(spy.calls.first().args[2]).toBeLessThan(cursor.y);

                spy.calls.reset();
                mouseMove(0.5, 0.7);
                expect(spy.calls.first().args[2]).toBeLessThan(cursor.y);

                spy.calls.reset();
                mouseMove(0.5, 0.5);
                expect(spy.calls.first().args[2]).toBeLessThan(cursor.y);

                spy.calls.reset();
                mouseMove(0.5, 0.3);
                expect(spy.calls.first().args[2]).toBeLessThan(cursor.y);

                mouseUp(0.5, 0.3);
            });

            it('should display the labels below the cursor`s position after it got to close to the top margin of the plot', function () {
                mouseDown(0.5, 0.6);

                spy.calls.reset();
                mouseMove(0.5, 0.1);
                expect(spy.calls.first().args[2]).toBeGreaterThan(cursor.y);

                spy.calls.reset();
                mouseMove(0.5, 0.3);
                expect(spy.calls.first().args[2]).toBeGreaterThan(cursor.y);

                spy.calls.reset();
                mouseMove(0.5, 0.5);
                expect(spy.calls.first().args[2]).toBeGreaterThan(cursor.y);

                spy.calls.reset();
                mouseMove(0.5, 0.7);
                expect(spy.calls.first().args[2]).toBeGreaterThan(cursor.y);

                mouseUp(0.5, 0.3);
            });

            it('should display the labels to the left of the cursor`s position after it got to close to the right margin of the plot', function () {
                mouseDown(0.5, 0.6);

                spy.calls.reset();
                mouseMove(0.9, 0.6);
                expect(spy.calls.first().args[1]).toBeLessThan(cursor.x);

                spy.calls.reset();
                mouseMove(0.7, 0.6);
                expect(spy.calls.first().args[1]).toBeLessThan(cursor.x);

                spy.calls.reset();
                mouseMove(0.5, 0.6);
                expect(spy.calls.first().args[1]).toBeLessThan(cursor.x);

                spy.calls.reset();
                mouseMove(0.35, 0.6);
                expect(spy.calls.first().args[1]).toBeLessThan(cursor.x);

                mouseUp(0.3, 0.6);
            });

            it('should display the labels to the right of the cursor`s position after it got to close to the left margin of the plot', function () {
                mouseDown(0.5, 0.6);

                spy.calls.reset();
                mouseMove(0.1, 0.6);
                expect(spy.calls.first().args[1]).toBeGreaterThan(cursor.x);

                spy.calls.reset();
                mouseMove(0.3, 0.6);
                expect(spy.calls.first().args[1]).toBeGreaterThan(cursor.x);

                spy.calls.reset();
                mouseMove(0.5, 0.6);
                expect(spy.calls.first().args[1]).toBeGreaterThan(cursor.x);

                spy.calls.reset();
                mouseMove(0.65, 0.6);
                expect(spy.calls.first().args[1]).toBeGreaterThan(cursor.x);

                mouseUp(0.3, 0.6);
            });

            function spyOnFillText() {
                var overlay = $('.flot-overlay')[0];
                var octx = overlay.getContext("2d");
                return spyOn(octx, 'fillText').and.callThrough();
            }

            function mouseDown(rx, ry) {
                var plotOffset = plot.getPlotOffset(),
                    cursorX = plotOffset.left + plot.width() * rx,
                    cursorY = plotOffset.top + plot.height() * ry;

                var options = { mouseX: cursorX, mouseY: cursorY };
                $('.flot-overlay').simulate("flotdragstart", options);
            }

            function mouseMove(rx, ry) {
                var plotOffset = plot.getPlotOffset(),
                    cursorX = plotOffset.left + plot.width() * rx,
                    cursorY = plotOffset.top + plot.height() * ry;

                var options = { mouseX: cursorX, mouseY: cursorY };
                $('.flot-overlay').simulate("flotdragstep", options);
                jasmine.clock().tick(20);
            }

            function mouseUp(rx, ry) {
                var plotOffset = plot.getPlotOffset(),
                    cursorX = plotOffset.left + plot.width() * rx,
                    cursorY = plotOffset.top + plot.height() * ry;

                var options = { mouseX: cursorX, mouseY: cursorY };
                $('.flot-overlay').simulate("flotdragend", options);
            }
        });
    });
});
