/* The MIT License
Copyright (c) 2019 by National Instruments
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the 'Software'), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/
/* Flot plugin for adding range cursors to the plot.
*/

/*global jQuery*/

(function ($) {
    'use strict';

    var options = {
        cursors: []
    };

    var constants = {
        mouseGrabMargin: 12,
        arrowHeadLength: 10,
        labelPadding: 2
    };

    function init(plot) {
        var cursors = [];
        var positionModeAxis = true;

        function createCursor(options) {
            return mixin(options, {
                name: 'unnamed ' + cursors.length,
                type: 'range-cursor',
                position: options.position || {
                    relativeXStart: 0.45, // relative to the with of the drawing area
                    relativeXEnd: 0.55, // relative to the with of the drawing area
                    xstart: undefined, // plot value
                    xend: undefined, // plot value
                    relativeYStart: 0.45, // relative to the with of the drawing area
                    relativeYEnd: 0.55, // relative to the with of the drawing area
                    ystart: undefined, // plot value
                    yend: undefined // plot value
                },
                mousePosition: {
                    relativeXStart: undefined,
                    relativeXEnd: undefined,
                    relativeYStart: undefined,
                    relativeYEnd: undefined
                },
                xstart: undefined, // canvas point relative to the actual data area
                xend: undefined, // canvas point relative to the actual data area
                ystart: undefined, // canvas point relative to the actual data area
                yend: undefined, // canvas point relative to the actual data area
                startMovePosition: {
                    x: 0,
                    y: 0
                },
                show: true,
                selected: false,
                highlighted: false,
                orientation: 'vertical',  // horizontal, vertical or box
                halign: 'top',
                dragLocation: '', /// start or end being moved
                transparentRange: 'outside', // inside, outside
                showLabel: false,
                showValue: false,
                showBorders: true,
                color: 'gray',
                fillColor: '#4F4F4F4F',
                fontSize: '10px',
                fontFamily: 'sans-serif',
                fontStyle: '',
                fontWeight: '',
                lineWidth: 1,
                movable: true,
                mouseButton: 'all',
                dashes: [],
                defaultxaxis: 1,
                defaultyaxis: 1,
                constrainToEdge: true
            });
        }

        plot.hooks.processOptions.push(function (plot) {
            if (plot.getOptions().rangecursors) {
                plot.getOptions().rangecursors.forEach(function (options) {
                    plot.addRangeCursor(options);
                });
            }
        });

        plot.getRangeCursors = function () {
            return cursors;
        };

        plot.addRangeCursor = function addRangeCursor(options) {
            var currentCursor = createCursor(options);

            setPosition(plot, currentCursor, currentCursor.position);

            cursors.push(currentCursor);

            plot.triggerRedrawOverlay();
        };

        plot.removeRangeCursor = function removeRangeCursor(cursor) {
            var index = cursors.indexOf(cursor);

            if (index !== -1) {
                cursors.splice(index, 1);
            }

            plot.triggerRedrawOverlay();
        };

        plot.setRangeCursor = function setRangeCursor(cursor, options) {
            var index = cursors.indexOf(cursor);

            if (index !== -1) {
                mixin(options, cursors[index]);
                setPosition(plot, cursors[index], cursors[index].position);
                plot.triggerRedrawOverlay();
            }
        };

        plot.formatCursorRange = formatCursorRange;

        var selectedCursor = function (cursors) {
            var result;

            cursors.forEach(function (cursor) {
                if (cursor.selected) {
                    if (!result) {
                        result = cursor;
                    }
                }
            });

            return result;
        };

        var visibleCursors = function(cursors) {
            return cursors.filter(function (cursor) {
                return cursor.show;
            });
        };

        var pan = {
            start: function (e) {
                var x = getPlotX(e.detail.touches[0].pageX);
                var y = getPlotY(e.detail.touches[0].pageY);
                handleCursorMoveStart(e, x, y, e.detail.touches[0].pageX, e.detail.touches[0].pageY)
            },

            drag: function(e) {
                var x = getPlotX(e.detail.touches[0].pageX);
                var y = getPlotY(e.detail.touches[0].pageY);
                handleCursorMove(e, x, y, e.detail.touches[0].pageX, e.detail.touches[0].pageY);
            },

            end: function(e) {
                var currentlySelectedCursor = selectedCursor(cursors);
                if (currentlySelectedCursor) {
                    currentlySelectedCursor.selected = false;
                }
            }
        };

        var pinch = {
            start: function(e) {
                var x = getPlotX(e.detail.touches[0].pageX);
                var y = getPlotY(e.detail.touches[0].pageY);
                handleCursorMoveStart(e, x, y, e.detail.touches[0].pageX, e.detail.touches[0].pageY)
            },

            drag: function(e) {
                var x = getPlotX(e.detail.touches[0].pageX);
                var y = getPlotY(e.detail.touches[0].pageY);

                handleCursorMove(e, x, y, e.detail.touches[0].pageX, e.detail.touches[0].pageY);
            },

            end: function(e) {
                var currentlySelectedCursor = selectedCursor(cursors);
                if (currentlySelectedCursor) {
                    currentlySelectedCursor.selected = false;
                }
            }
        };

        var mouseMove = {
            start: function(e) {
                var page = $.plot.browser.getPageXY(e)
                var x = getPlotX(page.X);
                var y = getPlotY(page.Y);

                handleCursorMoveStart(e, x, y, page.X, page.Y);
            },

            drag: function(e) {
                var page = $.plot.browser.getPageXY(e)
                var x = getPlotX(page.X);
                var y = getPlotY(page.Y);

                handleCursorMove(e, x, y, page.X, page.Y);
            },

            mouseover: function(e) {
                var page = $.plot.browser.getPageXY(e)
                var x = getPlotX(page.X);
                var y = getPlotY(page.Y);

                handleCursorMouseOver(e, x, y, page.X, page.Y);
            },

            end: function(e) {
                var page = $.plot.browser.getPageXY(e)
                var x = getPlotX(page.X);
                var y = getPlotY(page.Y);

                handleCursorMoveEnd(e, x, y, page.X, page.Y);
            }
        };

        plot.hooks.bindEvents.push(function (plot, eventHolder) {
            eventHolder[0].addEventListener('panstart', pan.start, false);
            eventHolder[0].addEventListener('pandrag', pan.drag, false);
            eventHolder[0].addEventListener('panend', pan.end, false);
            eventHolder[0].addEventListener('pinchstart', pinch.start, false);
            eventHolder[0].addEventListener('pinchdrag', pinch.drag, false);
            eventHolder[0].addEventListener('pinchend', pinch.end, false);

            plot.getPlaceholder().bind('plotpan', switchToAxisPlotPosition);
            plot.getPlaceholder().bind('plotzoom', switchToAxisPlotPosition);

            plot.addEventHandler("dragstart", mouseMove.start, eventHolder, 10);
            plot.addEventHandler("drag", mouseMove.drag, eventHolder, 10);
            plot.addEventHandler("dragend", mouseMove.end, eventHolder, 10);
            eventHolder.bind('mousemove', mouseMove.mouseover)
        });

        plot.hooks.processRawData.push(function(plot, series, seriesData, datapoints) {
            if (series.historyBuffer) {
                // charting plugin enabled
                switchToRelativePlotPosition();
            }
        });

        function switchToRelativePlotPosition() {
            positionModeAxis = false;
            cursors.forEach(function(cursor) {
                if (isNaN(cursor.start) || isNaN(cursor.end)) {
                    return;
                }
                var relativePosition = {
                    relativeXStart: cursor.position.relativeXStart || cursor.xstart / plot.width(),
                    relativeYStart: cursor.position.relativeYStart || cursor.ystart / plot.height(),
                    relativeXEnd: cursor.position.relativeXEnd || cursor.xend / plot.width(),
                    relativeYEnd: cursor.position.relativeYEnd || cursor.yend / plot.width(),
                };
                if (!isNaN(relativePosition.relativeStart) && !isNaN(relativePosition.relativeEnd)) {
                    cursor.position = relativePosition;
                }
            });
        }

        function switchToAxisPlotPosition() {
            positionModeAxis = true;
            cursors.forEach(function(cursor) {
                var xaxis = findXAxis(plot, cursor);
                var yaxis = findYAxis(plot, cursor);
                cursor.mousePosition = {}; // reset mouse position
                if (cursor.position.xstart === undefined) {
                    cursor.position.xstart = xaxis.c2p ? xaxis.c2p(cursor.xstart) : undefined;
                }

                if (cursor.position.ystart === undefined) {
                    cursor.position.ystart = yaxis.c2p ? yaxis.c2p(cursor.ystart) : undefined;
                }

                if (cursor.position.xend === undefined) {
                    cursor.position.xend = xaxis.c2p ? xaxis.c2p(cursor.xend) : undefined;
                }

                if (cursor.position.yend === undefined) {
                    cursor.position.yend = yaxis.c2p ? yaxis.c2p(cursor.yend) : undefined;
                }
                cursor.position.relativeXStart = undefined;
                cursor.position.relativeXEnd = undefined;
                cursor.position.relativeYStart = undefined;
                cursor.position.relativeYEnd = undefined;
            });
        }

        function handleCursorMove(e, x, y, pageX, pageY) {
            var currentlySelectedCursor = selectedCursor(cursors);

            if (currentlySelectedCursor && currentlySelectedCursor.dragLocation !== '') {
                updateCursorPositionOnMove(currentlySelectedCursor, x, y);
                currentlySelectedCursor.startMovePosition.x = x;
                currentlySelectedCursor.startMovePosition.y = y;
                plot.getPlaceholder().trigger('cursordrag', currentlySelectedCursor);
                plot.triggerRedrawOverlay();
                e.stopImmediatePropagation();
                e.preventDefault();
            } else {
                // in case the mouse button was released outside the plot area
                if (currentlySelectedCursor && currentlySelectedCursor.dragLocation !== '') {
                    currentlySelectedCursor.selected = false;
                    currentlySelectedCursor.dragLocation = '';
                    plot.triggerRedrawOverlay();
                }

                visibleCursors(cursors).forEach(function (cursor) {
                    var cursorShape = {shape: ''};
                    if (!cursor.movable) {
                        return;
                    }
                    if (mouseOverCursorEdgeLines(pageX, pageY, plot, cursor, cursorShape) !== '') {
                        if (!cursor.highlighted) {
                            cursor.highlighted = true;
                            plot.triggerRedrawOverlay();
                        }

                        plot.getPlaceholder().css('cursor', cursorShape.shape);
                    } else if (mouseBetweenCursorEdgeLines(pageX, pageY, plot, cursor)) {
                        if (!cursor.highlighted) {
                            cursor.highlighted = true;
                            plot.triggerRedrawOverlay();
                        }

                        plot.getPlaceholder().css('cursor', 'move');
                    } else {
                        if (cursor.highlighted) {
                            cursor.highlighted = false;
                            plot.getPlaceholder().css('cursor', 'default');
                            plot.triggerRedrawOverlay();
                        }
                    }
                });
            }
        }

        function handleCursorMoveStart(e, x, y, pageX, pageY) {
            var currentlySelectedCursor = selectedCursor(cursors);
            if (currentlySelectedCursor && currentlySelectedCursor.dragLocation !== '') {
                plot.getPlaceholder().css('cursor', 'default');
                updateCursorPositionOnMove(currentlySelectedCursor, x, y);
                plot.triggerRedrawOverlay();
            } else {
                // find nearby cursor and unlock it
                var targetCursor;
                var dragLocation;

                visibleCursors(cursors).forEach(function (cursor) {
                    var cursorShape = {shape: ''};
                    if (!cursor.movable) {
                        return;
                    }
                    if ((dragLocation = mouseOverCursorEdgeLines(pageX, pageY, plot, cursor, cursorShape)) !== '') {
                        targetCursor = cursor;
                    } else if (mouseBetweenCursorEdgeLines(pageX, pageY, plot, cursor)) {
                        targetCursor = cursor;
                        dragLocation = 'between';
                        cursor.startMovePosition.x = x;
                        cursor.startMovePosition.y = y;
                    }
                });

                if (targetCursor) {
                    targetCursor.selected = true;
                    targetCursor.dragLocation = dragLocation;
                    plot.getPlaceholder().css('cursor', 'move');
                    plot.getPlaceholder().trigger('cursordragstart', targetCursor);
                    plot.triggerRedrawOverlay();
                    e.stopImmediatePropagation();
                    e.preventDefault();
                }
            }
        }

        function handleCursorMoveEnd(e, x, y, pageX, pageY) {
            var currentlySelectedCursor = selectedCursor(cursors);

            if (currentlySelectedCursor) {
                // lock the free cursor to current position
                currentlySelectedCursor.selected = false;
                updateCursorPositionOnMove(currentlySelectedCursor, x, y);
                plot.getPlaceholder().css('cursor', 'default');
                plot.getPlaceholder().trigger('cursordragend', currentlySelectedCursor);
                plot.triggerRedrawOverlay();
                e.stopImmediatePropagation();
                e.preventDefault();
            }
        }

        function handleCursorMouseOver(e, x, y, pageX, pageY) {
            var currentlySelectedCursor = selectedCursor(cursors);

            if (currentlySelectedCursor && e.buttons === 0) {
                currentlySelectedCursor.selected = false;
                plot.triggerRedrawOverlay();
            }

            visibleCursors(cursors).forEach(function (cursor) {
                updateCursorHighlight(pageX, pageY, plot, cursor);
            });
        }

        function highlightRedraw (cursor) {
            if (!cursor.highlighted) {
                cursor.highlighted = true;
                plot.triggerRedrawOverlay();
            }
        }

        function updateCursorHighlight(pageX, pageY, plot, cursor) {
            var cursorShape = {shape: ''};
            if (!cursor.movable) {
                return;
            }

            if (mouseOverCursorEdgeLines(pageX, pageY, plot, cursor, cursorShape) !== '') {
                highlightRedraw(cursor);
                plot.getPlaceholder().css('cursor', cursorShape.shape);
            } else if (mouseBetweenCursorEdgeLines(pageX, pageY, plot, cursor)) {
                highlightRedraw(cursor);
                plot.getPlaceholder().css('cursor', 'move');
            } else {
                if (cursor.highlighted) {
                    cursor.highlighted = false;
                    plot.getPlaceholder().css('cursor', 'default');
                    plot.triggerRedrawOverlay();
                }
            }
        }

        function updateCursorPosition (cursor, xstart, xend, ystart, yend) {
            var xaxis, yaxis;
            xaxis = findXAxis(plot, cursor);
            yaxis = findYAxis(plot, cursor);
            if (xstart !== undefined) {
                cursor.mousePosition.relativeXStart = xstart / plot.width();
                cursor.position.relativeXStart = xstart / plot.width();
                cursor.position.xstart = xaxis.c2p ? xaxis.c2p(xstart) : undefined;
            }

            if (xend !== undefined) {
                cursor.mousePosition.relativeXEnd = xend / plot.width();
                cursor.position.relativeXEnd = xend / plot.width();
                cursor.position.xend = xaxis.c2p ? xaxis.c2p(xend) : undefined;
            }

            if (ystart !== undefined) {
                cursor.mousePosition.relativeYStart = ystart / plot.height();
                cursor.position.relativeYStart = ystart / plot.height();
                cursor.position.ystart = yaxis.c2p ? yaxis.c2p(ystart) : undefined;
            }

            if (yend !== undefined) {
                cursor.mousePosition.relativeYEnd = yend / plot.height();
                cursor.position.relativeYEnd = yend / plot.height();
                cursor.position.yend = yaxis.c2p ? yaxis.c2p(yend) : undefined;
            }
        }

        function updateCursorPositionOnMove(cursor, x, y) {
            //var xaxis, yaxis;
            if (cursor.dragLocation === 'edge-w') {
                cursor.xstart = x;
                updateCursorPosition(cursor, cursor.xstart, cursor.xend, cursor.ystart, cursor.yend);
            } else if (cursor.dragLocation === 'edge-e') {
                cursor.xend = x;
                updateCursorPosition(cursor, cursor.xstart, cursor.xend, cursor.ystart, cursor.yend);
            } else if (cursor.dragLocation === 'edge-n') {
                cursor.ystart = y;
                updateCursorPosition(cursor, cursor.xstart, cursor.xend, cursor.ystart, cursor.yend);
            } else if (cursor.dragLocation === 'edge-s') {
                cursor.yend = y;
                updateCursorPosition(cursor, cursor.xstart, cursor.xend, cursor.ystart, cursor.yend);
            } else if (cursor.dragLocation === 'between') {
                if (cursor.orientation !== 'horizontal') {
                    cursor.xstart = cursor.xstart + x - cursor.startMovePosition.x;
                    cursor.xend = cursor.xend + x - cursor.startMovePosition.x ;
                }

                if (cursor.orientation !== 'vertical') {
                    cursor.ystart = cursor.ystart + y - cursor.startMovePosition.y;
                    cursor.yend = cursor.yend + y - cursor.startMovePosition.y;
                }

                updateCursorPosition(cursor, cursor.xstart, cursor.xend, cursor.ystart, cursor.yend);
            }
        }

        function getPlotX(pageX) {
            var offset = plot.offset();
            return Math.max(0, Math.min(pageX - offset.left, plot.width()));
        }

        function getPlotY(pageY) {
            var offset = plot.offset();
            return Math.max(0, Math.min(pageY - offset.top, plot.height()));
        }

        plot.hooks.drawOverlay.push(function (plot, ctx) {
            var updates = [];
            var isMousePositionInitilized = function(mousePosition) {
                return mousePosition.relativeXStart !== undefined &&
                mousePosition.relativeXEnd !== undefined &&
                mousePosition.relativeYStart !== undefined &&
                mousePosition.relativeYEnd !== undefined;
            };

            cursors.forEach(function (cursor) {
                initializeAxisPositionIfNecessary(plot, cursor);
                setPosition(plot, cursor, cursor.position);
                updateCursorPosition(cursor, cursor.xstart, cursor.xend, cursor.ystart, cursor.yend);

                if (!isMousePositionInitilized(cursor.mousePosition)) {
                    cursor.mousePosition.relativeXStart = cursor.xstart / plot.width();
                    cursor.mousePosition.relativeXEnd = cursor.xend / plot.width();
                    cursor.mousePosition.relativeYStart = cursor.ystart / plot.height();
                    cursor.mousePosition.relativeYEnd = cursor.yend / plot.height();
                }

                if (cursor.show) {
                    var plotOffset = plot.getPlotOffset();

                    ctx.save();
                    ctx.translate(plotOffset.left, plotOffset.top);

                    if (cursor.showBorders) {
                        drawEdgeLines(plot, ctx, cursor);
                    }

                    drawFill(plot, ctx, cursor);
                    drawLabel(plot, ctx, cursor);
                    drawRangeLine(plot, ctx, cursor);
                    drawValues(plot, ctx, cursor);
                    ctx.restore();
                    updates.push({rangecursor: cursor.name, target: cursor, positionMode: positionModeAxis, position: cursor.position});
                }
            });

            if (updates.length > 0) {
                plot.getPlaceholder().trigger('cursorupdates', [updates]);
            }
        });

        plot.hooks.shutdown.push(function (plot, eventHolder) {
            eventHolder[0].removeEventListener('panstart', pan.start);
            eventHolder[0].removeEventListener('pandrag', pan.drag);
            eventHolder[0].removeEventListener('panend', pan.end);
            eventHolder[0].removeEventListener('pinchstart', pinch.start);
            eventHolder[0].removeEventListener('pinchdrag', pinch.drag);
            eventHolder[0].removeEventListener('pinchend', pinch.end);

            var placeholder = plot.getPlaceholder();
            placeholder.unbind('plotpan', switchToAxisPlotPosition);
            placeholder.unbind('plotzoom', switchToAxisPlotPosition);
            eventHolder.unbind('mousedown', mouseMove.start);
            eventHolder.unbind('mousemove', mouseMove.move);
            eventHolder.unbind('mouseup', mouseMove.end);

            placeholder.css('cursor', 'default');
        });
    }

    function mixin(source, destination) {
        Object.keys(source).forEach(function (key) {
            destination[key] = source[key];
        });

        return destination;
    }

    function initializeAxisPositionIfNecessary(plot, cursor) {
        var xaxis = findXAxis(plot, cursor),
            yaxis = findYAxis(plot, cursor),
            position = cursor.position;
        if ((position.xstart === undefined || position.xend === undefined) && 
            xaxis.c2p &&
            !(xaxis.min === 0 && xaxis.max === 1)) {
            // if cursor is defined with an initial relative position, need to initialize
            // axis position values after axes have been defined
            if (cursor.orientation !== 'horizontal') {
                position.xstart = xaxis.c2p(position.relativeXStart * plot.width());
                position.xend = xaxis.c2p(position.relativeXEnd * plot.width());
            } else {
                position.xstart = xaxis.c2p(0);
                position.xend = xaxis.c2p(plot.width());
            }
        }

        if ((position.ystart === undefined || position.yend === undefined) && yaxis.c2p &&
            !(yaxis.min === 0 && yaxis.max === 1)) {
            // if cursor is defined with an initial relative position, need to initialize
            // axis position values after axes have been defined
            if (cursor.orientation !== 'vertical') {
                position.ystart = yaxis.c2p(position.relativeYStart * plot.height());
                position.yend = yaxis.c2p(position.relativeYEnd * plot.height());
            } else {
                position.ystart = yaxis.c2p(0);
                position.yend = yaxis.c2p(plot.height());
            }
        }

        if ((position.relativeXStart === undefined || position.relativeXEnd === undefined) &&
            xaxis.p2c && !(position.xstart === undefined || position.xend === undefined)) {
            // if cursor is defined with an initial axis position, need to initialize
            // axis relative position values
            if (cursor.orientation !== 'horizontal') {
                position.relativeXStart = xaxis.p2c(position.xstart) /plot.width();
                position.relativeXEnd = xaxis.p2c(position.xend) / plot.width();
            } else {
                position.relativeXStart = 0;
                position.relativeXEnd = 1;
            }
        }

        if ((position.relativeYStart === undefined || position.relativeYEnd === undefined) &&
            yaxis.p2c && !(position.ystart === undefined || position.yend === undefined)) {
            // if cursor is defined with an initial axis position, need to initialize
            // axis relative position values
            if (cursor.orientation !== 'vertical') {
                position.relativeYStart = yaxis.p2c(position.ystart) /plot.height();
                position.relativeYEnd = yaxis.p2c(position.yend) / plot.height();
            } else {
                position.relativeYStart = 0;
                position.relativeYEnd = 1;
            }
        }
    }

    /**
        Calculate and set the canvas coords based on relative coords or plot values.
        When both provided then the relative coords will be took into account
        and the plot values ignored.
     */
    function setPosition(plot, cursor, pos) {
        var xaxis = findXAxis(plot, cursor),
            yaxis = findYAxis(plot, cursor);
        var xstart = pos.xstart !== undefined
            ? xaxis.p2c ? xaxis.p2c(pos.xstart) : undefined
            : pos.relativeXStart * plot.width();
        var xend = pos.xend !== undefined
            ? xaxis.p2c ? xaxis.p2c(pos.xend) : undefined
            : pos.relativeXEnd * plot.width();
        var ystart = pos.ystart !== undefined
            ? yaxis.p2c ? yaxis.p2c(pos.ystart) : undefined
            : pos.relativeYStart * plot.height();
        var yend = pos.yend !== undefined
            ? yaxis.p2c ? yaxis.p2c(pos.yend) : undefined
            : pos.relativeYEnd * plot.height();

        var xaxisEnd = plot.width();
        var xdiff = Math.abs(xend - xstart);
        if (xdiff > xaxisEnd) {
            xdiff = xaxisEnd;
        }

        var yaxisEnd = plot.height();
        var ydiff = Math.abs(yend - ystart);
        if (ydiff > yaxisEnd) {
            ydiff = yaxisEnd;
        }

        if (xstart > xend && !xaxis.inverted) {
            xstart = xend - xdiff;
        }

        if (cursor.constrainToEdge) {
            if (xend > xaxisEnd) {
                xend = xaxisEnd;
                xstart = xaxisEnd - xdiff;
            }

            if (xstart < 0) {
                xstart = 0;
                xend = xdiff;
            }

            if (yend > yaxisEnd) {
                yend = yaxisEnd;
                ystart = yaxisEnd - ydiff;
            }

            if (ystart < 0) {
                ystart = 0;
                yend = ydiff;
            }
        }

        if (cursor.orientation === 'vertical') {
            cursor.ystart = 0;
            cursor.yend = plot.height();
            cursor.xstart = xstart;
            cursor.xend = xend;
        } else if (cursor.orientation === 'horizontal') {
            cursor.xstart = 0;
            cursor.xend = plot.width();
            cursor.ystart = ystart;
            cursor.yend = yend;
        } else {
            cursor.xstart = xstart;
            cursor.xend = xend;
            cursor.ystart = ystart;
            cursor.yend = yend;
        }
    }

    function computeRowPosition(plot, cursor, halign, rowIndex) {
        var textAlign = 'left';
        var fontSizeInPx = Number(cursor.fontSize.substring(0, cursor.fontSize.length - 2));

        var x = cursor.xstart + (cursor.xend - cursor.xstart) / 2;
        var y = cursor.ystart + (cursor.yend - cursor.ystart) / 2;
        if (cursor.orientation === 'vertical') {
            if (halign === 'top') {
                y -= constants.labelPadding;
                textAlign = 'center';
                y -= fontSizeInPx;
                if (cursor.showLabel && cursor.showValue && rowIndex === 0) {
                    y -= fontSizeInPx;
                }
            } else {
                y += constants.labelPadding;
                textAlign = 'center';
                y += fontSizeInPx;
                if (rowIndex === 1) {
                    y += fontSizeInPx;
                }
            }
        } else if (cursor.orientation === 'horizontal') {
            if (halign === 'top') {
                x += constants.labelPadding;
                if (rowIndex === 1) {
                    y += fontSizeInPx;
                }
            } else {
                x -= constants.labelPadding;
                textAlign = 'right';
                if (rowIndex === 1) {
                    y += fontSizeInPx;
                }
            }
        } else {
            textAlign = 'center';
            if (rowIndex === 1) {
                y += fontSizeInPx;
            }
    }

        if (x < 0 || x > plot.width() || y < 0 || y > plot.height()) {
            return;
        }

        return {
            x: x,
            y: y,
            textAlign: textAlign
        };
    }

    function drawLabel(plot, ctx, cursor) {
        if (cursor.showLabel) {
            var position = computeRowPosition(plot, cursor, cursor.halign, 0);
            if (!position) {
                return;
            }

            ctx.beginPath();
            ctx.fillStyle = cursor.color;
            ctx.textAlign = position.textAlign;
            ctx.font = cursor.fontStyle + ' ' + cursor.fontWeight + ' ' + cursor.fontSize + ' ' + cursor.fontFamily;
            ctx.fillText(cursor.name, position.x, position.y);
            ctx.textAlign = 'left';
            ctx.stroke();
        }
    }

    function drawValues(plot, ctx, cursor) {
        if (cursor.showValue) {
            var text = formatCursorRange(plot, cursor);
            var position = computeRowPosition(plot, cursor, cursor.halign, cursor.showLabel ? 1 : 0);
            if (!position) {
                return;
            }

            ctx.fillStyle = cursor.color;
            ctx.textAlign = position.textAlign;
            ctx.font = cursor.fontStyle + ' ' + cursor.fontWeight + ' ' + cursor.fontSize + ' ' + cursor.fontFamily;
            ctx.fillText(text, position.x, position.y);
        }
    }

    function drawRangeLine(plot, ctx, cursor) {
        if (cursor.showBorders) {
            var extent = clampStartAndEnd(plot, cursor);
            if (!extent) {
                return;
            }

            ctx.beginPath();
            ctx.strokeStyle = cursor.color;
            ctx.lineWidth = cursor.lineWidth;
            if (cursor.orientation === 'vertical') {
                var start = extent.xstart;
                var end = extent.xend;
                ctx.moveTo(start, plot.height() / 2);
                ctx.lineTo(end, plot.height() / 2);
                if (Math.abs(start - end) > Number.EPSILON) {
                    drawArrowHead(ctx, cursor, 'left', cursor.xstart, plot.height() / 2);
                }

                if (Math.abs(end - start) > Number.EPSILON) {
                    drawArrowHead(ctx, cursor, 'right', cursor.end, plot.height() / 2);
                }
            } else if (cursor.orientation === 'horizontal') {
                var start = extent.ystart;
                var end = extent.yend;
                    ctx.moveTo(plot.width() / 2, start);
                ctx.lineTo(plot.width() / 2, end);

                if (Math.abs(start - end) > Number.EPSILON) {
                    drawArrowHead(ctx, cursor, 'up', plot.width() / 2, cursor.ystart);
                }

                if (Math.abs(end - start) > Number.EPSILON) {
                    drawArrowHead(ctx, cursor, 'down', plot.width() / 2, cursor.yend);
                }
            }

            ctx.stroke();
        }
    }

    function drawArrowHead (ctx, cursor, direction, x, y) {
        switch (direction) {
            case 'left':
                ctx.moveTo(x, y);
                ctx.lineTo(x + constants.arrowHeadLength, y - constants.arrowHeadLength / 2);
                ctx.moveTo(x, y);
                ctx.lineTo(x + constants.arrowHeadLength, y + constants.arrowHeadLength / 2);
                break;
            case 'right':
                ctx.moveTo(x, y);
                ctx.lineTo(x - constants.arrowHeadLength, y - constants.arrowHeadLength / 2);
                ctx.moveTo(x, y);
                ctx.lineTo(x - constants.arrowHeadLength, y + constants.arrowHeadLength / 2);
                break;
            case 'up':
                ctx.moveTo(x, y);
                ctx.lineTo(x - constants.arrowHeadLength / 2, y + constants.arrowHeadLength);
                ctx.moveTo(x, y);
                ctx.lineTo(x + constants.arrowHeadLength / 2, y + constants.arrowHeadLength);
                break;
            case 'down':
                ctx.moveTo(x, y);
                ctx.lineTo(x - constants.arrowHeadLength / 2, y - constants.arrowHeadLength);
                ctx.moveTo(x, y);
                ctx.lineTo(x + constants.arrowHeadLength / 2, y - constants.arrowHeadLength);
                break;
        }
    }

    function computeCursorsPrecision(plot, axis, canvasPosition) {
        var canvas2 = axis.direction === "x" ? canvasPosition + 1 : canvasPosition - 1,
            point1 = axis.c2p(canvasPosition),
            point2 = axis.c2p(canvas2);

        return plot.computeValuePrecision(point1, point2, axis.direction, 1);
    }

    function findXAxis(plot, cursor) {
        var xaxes = plot.getXAxes(),
            zeroBasedIndex = cursor.defaultxaxis - 1;
        return xaxes[zeroBasedIndex];
    }

    function findYAxis(plot, cursor) {
        var yaxes = plot.getYAxes(),
            zeroBasedIndex = cursor.defaultyaxis - 1;
        return yaxes[zeroBasedIndex];
    }

    function formatCursorRange(plot, cursor) {
        var xaxis = findXAxis(plot, cursor),
            yaxis = findYAxis(plot, cursor),
            htmlSpace = '&nbsp;',
            htmlNewline = '<br>';

        var xaxisPrecision = computeCursorsPrecision(plot, xaxis, cursor.xstart);
        var xformattedValue = xaxis.tickFormatter(xaxis.c2p(cursor.xend) - xaxis.c2p(cursor.xstart), xaxis, xaxisPrecision, plot);
        xformattedValue = xformattedValue.replace(htmlNewline, " ");
        xformattedValue = xformattedValue.replace(htmlSpace, " ");
        var yaxisPrecision = computeCursorsPrecision(plot, yaxis, cursor.ystart);
        var yformattedValue = yaxis.tickFormatter(yaxis.c2p(cursor.yend) - yaxis.c2p(cursor.ystart), yaxis, yaxisPrecision, plot);
        yformattedValue = yformattedValue.replace(htmlNewline, " ");
        yformattedValue = yformattedValue.replace(htmlSpace, " ");
        if (cursor.orientation === 'box') {
            return '[' + xformattedValue + ' ' + yformattedValue + ']';
        } else if (cursor.orientation === 'vertical') {
            return xformattedValue;
        } else {
            return yformattedValue;
        }
    }

    function clampStartAndEnd(plot, cursor) {
        var xstart = cursor.mousePosition.relativeXStart;
        var xend = cursor.mousePosition.relativeXEnd;
        var ystart = cursor.mousePosition.relativeYStart;
        var yend = cursor.mousePosition.relativeYEnd;
        if ((xstart <= 0 && xend <= 0) ||
            (ystart <= 0 && yend <= 0) ||
            (ystart >= 1 && yend >= 1) ||
            (xstart >= 1 && xend >= 1)) {
            return;
        } else {
            if (xstart < 0) {
                xstart = 0;
            } else {
                xstart = cursor.xstart;
            }

            if (ystart < 0) {
                ystart = 0;
            } else {
                ystart = cursor.ystart;
            }

            if (xend > 1) {
                xend = plot.width();
            } else {
                xend = cursor.xend;
            }

            if (yend > 1) {
                yend = plot.height();
            } else {
                yend = cursor.yend;
            }
        }

        return {xstart: xstart, xend: xend, ystart: ystart, yend: yend};
    }

    function drawEdgeLines(plot, ctx, cursor) {
        // abort draw if linewidth is zero
        if (cursor.lineWidth === 0) {
            return;
        }
        // keep line sharp
        var adj = cursor.lineWidth % 2 ? 0.5 : 0;

        ctx.strokeStyle = cursor.color;
        ctx.lineWidth = cursor.lineWidth;
        ctx.lineJoin = "round";

        ctx.beginPath();
        if (cursor.dashes.length) {
            ctx.setLineDash(cursor.dashes);
        }

        var xdrawStart = Math.floor(cursor.xstart) + adj;
        var xdrawEnd = Math.floor(cursor.xend) + adj;
        var ydrawStart = Math.floor(cursor.ystart) + adj;
        var ydrawEnd = Math.floor(cursor.yend) + adj;
        if (cursor.orientation === 'box') {
            ctx.strokeRect(xdrawStart, ydrawStart, xdrawEnd - xdrawStart, ydrawEnd - ydrawStart);
        } else if (cursor.orientation === 'vertical') {
            ctx.moveTo(xdrawStart, ydrawStart)
            ctx.lineTo(xdrawStart, ydrawEnd);
            ctx.moveTo(xdrawEnd, ydrawStart)
            ctx.lineTo(xdrawEnd, ydrawEnd);
            ctx.stroke();
        } else {
            ctx.moveTo(xdrawStart, ydrawStart)
            ctx.lineTo(xdrawEnd, ydrawStart);
            ctx.moveTo(xdrawStart, ydrawEnd)
            ctx.lineTo(xdrawEnd, ydrawEnd);
            ctx.stroke();
        }
    }

    function drawFill(plot, ctx, cursor) {
        ctx.fillStyle = cursor.fillColor;
        var extent = clampStartAndEnd(plot, cursor);
        if (!extent) {
            return;
        }

        var xstart = extent.xstart;
        var xend = extent.xend;
        var ystart = extent.ystart;
        var yend = extent.yend;
        if (cursor.transparentRange === 'outside') {
            ctx.fillRect(xstart, ystart, xend - xstart, yend - ystart);
        } else {
            ctx.fillRect(0, 0, plot.width(), ystart);
            ctx.fillRect(0, ystart, xstart, yend - ystart);
            ctx.fillRect(xend, ystart, plot.width() - xend, yend - ystart);
            ctx.fillRect(0, yend, plot.width(), plot.height() - yend);
        }
    }

    function mouseOverVerticalCursorLine(x, y, plot, pos, ystart, yend) {
        var offset = plot.offset();
        var mouseX = Math.max(0, Math.min(x - offset.left, plot.width()));
        var mouseY = Math.max(0, Math.min(y - offset.top, plot.height()));

        return ((mouseX > pos - constants.mouseGrabMargin) &&
            (mouseX < pos + constants.mouseGrabMargin) && (mouseY > ystart) && (mouseY < yend));
    }

    function mouseOverHorizontalCursorLine(x, y, plot, pos, xstart, xend) {
        var offset = plot.offset();
        var mouseX = Math.max(0, Math.min(x - offset.left, plot.width()));
        var mouseY = Math.max(0, Math.min(y - offset.top, plot.height()));

        return ((mouseY > pos - constants.mouseGrabMargin) &&
            (mouseY < pos + constants.mouseGrabMargin) && (mouseX > xstart) && (mouseX < xend));
    }

    function mouseBetweenCursorEdgeLines(x, y, plot, cursor) {
        var offset = plot.offset();
        var mouseX = Math.max(0, Math.min(x - offset.left, plot.width()));
        var mouseY = Math.max(0, Math.min(y - offset.top, plot.height()));
        var extent = clampStartAndEnd(plot, cursor);
        if (!extent) {
            return;
        }

        var xstart = extent.xstart;
        var xend = extent.xend;
        var ystart = extent.ystart;
        var yend = extent.yend;
        return ((mouseY > ystart + constants.mouseGrabMargin) &&
            (mouseY < yend - constants.mouseGrabMargin) &&
            (mouseX > xstart + constants.mouseGrabMargin) &&
            (mouseX < xend + constants.mouseGrabMargin));
    }

    function mouseOverCursorEdgeLines(x, y, plot, cursor, cursorShape) {
        if (cursor.orientation !== 'horizontal' && mouseOverVerticalCursorLine(x, y, plot, cursor.xstart, cursor.ystart, cursor.yend)) {
            cursorShape.shape = 'ew-resize';
            return 'edge-w';
        } else if (cursor.orientation !== 'horizontal' && mouseOverVerticalCursorLine(x, y, plot, cursor.xend, cursor.ystart, cursor.yend)) {
            cursorShape.shape = 'ew-resize';
            return 'edge-e';
        } else if (cursor.orientation !== 'vertical' && mouseOverHorizontalCursorLine(x, y, plot, cursor.yend, cursor.xstart, cursor.xend)) {
            cursorShape.shape = 'ns-resize';
            return 'edge-s';
        } else if (cursor.orientation !== 'vertical' && mouseOverHorizontalCursorLine(x, y, plot, cursor.ystart, cursor.xstart, cursor.xend)) {
            cursorShape.shape = 'ns-resize';
            return 'edge-n';
        }

        return '';
    }

    $.plot.plugins.push({
        init: init,
        options: options,
        name: 'cursors',
        version: '0.2'
    });
})(jQuery);
