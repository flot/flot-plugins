/* Flot plugin for adding cursors to the plot.

Copyright (c) cipix2000@gmail.com.
Copyright (c) 2007-2014 IOLA and Ole Laursen.
Licensed under the MIT license.
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
                    relativeStart: 0.45, // relative to the with of the drawing area
                    relativeEnd: 0.55, // relative to the with of the drawing area
                    start: undefined, // plot value
                    end: undefined // plot value
                },
                mousePosition: {
                    relativeStart: undefined,
                    relativeEnd: undefined
                },
                start: undefined, // canvas point relative to the actual data area
                end: undefined, // canvas point relative to the actual data area
                startMovePosition: {
                    x: 0,
                    y: 0
                },
                show: true,
                selected: false,
                highlighted: false,
                orientation: 'vertical',
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
            if (series && series.historyBuffer) {
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
                    relativeStart: cursor.position.relativeStart || (cursor.orientation === 'vertical' ? cursor.start / plot.width() : cursor.start / plot.height()),
                    relativeEnd: cursor.position.relativeEnd || (cursor.orientation === 'vertical' ? cursor.end / plot.width() : cursor.end / plot.height())
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
                var axis = cursor.orientation === 'vertical' ? xaxis : yaxis;
                cursor.mousePosition = {}; // reset mouse position
                if (!cursor.position.start === undefined) {
                    cursor.position.start = axis.c2p ? axis.c2p(cursor.start) : undefined;
                }
                if (!cursor.position.end === undefined) {
                    cursor.position.end = axis.c2p ? axis.c2p(cursor.end) : undefined;
                }
                cursor.position.relativeStart = undefined;
                cursor.position.relativeEnd = undefined;
            });
        }

        function handleCursorMove(e, x, y, pageX, pageY) {
            var currentlySelectedCursor = selectedCursor(cursors);

            if (currentlySelectedCursor && currentlySelectedCursor.dragLocation !== '') {
                updateCursorPositionOnMove(currentlySelectedCursor, x, y);
                currentlySelectedCursor.startMovePosition.x = x;
                currentlySelectedCursor.startMovePosition.y = y;
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
                    if (!cursor.movable) {
                        return;
                    }
                    if (mouseOverCursorStartLine(pageX, pageY, plot, cursor)) {
                        if (!cursor.highlighted) {
                            cursor.highlighted = true;
                            plot.triggerRedrawOverlay();
                        }
                        plot.getPlaceholder().css('cursor', cursor.orientation === 'vertical' ? 'col-resize' : 'row-resize');
                    } else if (mouseOverCursorEndLine(pageX, pageY, plot, cursor)) {
                        if (!cursor.highlighted) {
                            cursor.highlighted = true;
                            plot.triggerRedrawOverlay();
                        }

                        plot.getPlaceholder().css('cursor', cursor.orientation === 'vertical' ? 'col-resize' : 'row-resize');
                    } else if (mouseBetweenCursorStartAndEndLine(pageX, pageY, plot, cursor)) {
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
                    if (!cursor.movable) {
                        return;
                    }
                    if (mouseOverCursorStartLine(pageX, pageY, plot, cursor)) {
                        targetCursor = cursor;
                        dragLocation = 'start';
                    }
                    if (mouseOverCursorEndLine(pageX, pageY, plot, cursor)) {
                        targetCursor = cursor;
                        dragLocation = 'end';
                    }
                    if (mouseBetweenCursorStartAndEndLine(pageX, pageY, plot, cursor)) {
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
            if (!cursor.movable) {
                return;
            }

            if (mouseOverCursorStartLine(pageX, pageY, plot, cursor) || mouseOverCursorEndLine(pageX, pageY, plot, cursor)) {
                highlightRedraw(cursor);
                plot.getPlaceholder().css('cursor', cursor.orientation === 'vertical' ? 'col-resize' : 'row-resize');
            } else if (mouseBetweenCursorStartAndEndLine(pageX, pageY, plot, cursor)) {
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

        function updateCursorPosition (cursor, start, end) {
            var xaxis, yaxis, axis;
            xaxis = findXAxis(plot, cursor);
            yaxis = findYAxis(plot, cursor);
            axis = cursor.orientation === 'vertical' ? xaxis : yaxis;
            if (start !== undefined) {
                cursor.mousePosition.relativeStart = start / getPlotDimension(plot, cursor);
                cursor.position.relativeStart = start / getPlotDimension(plot, cursor);
                cursor.position.start = axis.c2p ? axis.c2p(start) : undefined;
            }

            if (end !== undefined) {
                cursor.mousePosition.relativeEnd = end / getPlotDimension(plot, cursor);
                cursor.position.relativeEnd = end / getPlotDimension(plot, cursor);
                cursor.position.end = axis.c2p ? axis.c2p(end) : undefined;
            }
        }

        function updateCursorPositionOnMove(cursor, x, y) {
            //var xaxis, yaxis;
            if (cursor.dragLocation === 'start') {
                cursor.start = cursor.orientation === 'vertical' ? x : y;
                updateCursorPosition(cursor, cursor.start, undefined);
            } else if (cursor.dragLocation === 'end') {
                cursor.end = cursor.orientation === 'vertical' ? x : y;
                updateCursorPosition(cursor, undefined, cursor.end);
            } else if (cursor.dragLocation === 'between') {
                cursor.start = cursor.start + (cursor.orientation === 'vertical' ? x - cursor.startMovePosition.x : y - cursor.startMovePosition.y);
                cursor.end = cursor.end + (cursor.orientation === 'vertical' ? x - cursor.startMovePosition.x : y - cursor.startMovePosition.y);
                updateCursorPosition(cursor,
                    cursor.start,
                    cursor.end);
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
                return mousePosition.relativeStart !== undefined && mousePosition.relativeEnd !== undefined;
            };

            cursors.forEach(function (cursor) {
                initializeAxisPositionIfNecessary(plot, cursor);
                setPosition(plot, cursor, cursor.position);
                updateCursorPosition(cursor, cursor.start, cursor.end);

                if (!isMousePositionInitilized(cursor.mousePosition)) {
                    cursor.mousePosition.relativeStart = cursor.start / getPlotDimension(plot, cursor);
                    cursor.mousePosition.relativeEnd = cursor.end / getPlotDimension(plot, cursor);
                }

                if (cursor.show) {
                    var plotOffset = plot.getPlotOffset();

                    ctx.save();
                    ctx.translate(plotOffset.left, plotOffset.top);

                    if (cursor.showBorders) {
                        drawStartAndEndLines(plot, ctx, cursor);
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

    function getPlotDimension (plot, cursor) {
        return (cursor.orientation === 'vertical' ? plot.width() : plot.height());
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
            position = cursor.position, axis;
        if (cursor.orientation === 'vertical') {
            axis = xaxis;
        } else {
            axis = yaxis;
        }

        if ((position.start === undefined || position.end === undefined) && axis.c2p &&
            !(axis.min === 0 && axis.max === 1)) {
            // if cursor is defined with an initial relative position, need to initialize
            // axis position values after axes have been defined
            position.start = axis.c2p(position.relativeStart * getPlotDimension(plot, cursor));
            position.end = axis.c2p(position.relativeEnd * getPlotDimension(plot, cursor));
        }

        if ((position.relativeStat === undefined || position.relativeEnd === undefined) &&
            axis.p2c && !(position.start === undefined || position.end === undefined)) {
            // if cursor is defined with an initial axis position, need to initialize
            // axis relative position values
            position.relativeStart = axis.p2c(position.start) / getPlotDimension(plot, cursor);
            position.relativeEnd = axis.p2c(position.end) / getPlotDimension(plot, cursor);
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
        var start, end, axis;

        if (cursor.orientation === 'vertical') {
            axis = xaxis;
        } else {
            axis = yaxis;
        }

        start = pos.start !== undefined
            ? axis.p2c ? axis.p2c(pos.start) : undefined
            : pos.relativeStart * getPlotDimension(plot, cursor);
        end = pos.end !== undefined
            ? axis.p2c ? axis.p2c(pos.end) : undefined
            : pos.relativeEnd * getPlotDimension(plot, cursor);

        var axisEnd = getPlotDimension(plot, cursor);
        var diff = Math.abs(end - start);
        if (diff > axisEnd) {
            diff = axisEnd;
        }

        if (start > end && cursor.orientation !== 'horizontal' && !axis.inverted) {
            start = end - diff;
        }

        if (cursor.constrainToEdge) {
            if (end > axisEnd) {
                end = axisEnd;
                start = axisEnd - diff;
            }

            if (start < 0) {
                start = 0;
                end = diff;
            }
        }

        cursor.start = start;
        cursor.end = end;
    }

    function computeRowPosition(plot, cursor, halign, rowIndex) {
        var textAlign = 'left';
        var fontSizeInPx = Number(cursor.fontSize.substring(0, cursor.fontSize.length - 2));

        var center = cursor.start + (cursor.end - cursor.start) / 2;
        var x, y;
        if (cursor.orientation === 'vertical') {
            x = center;
            y = plot.height() / 2;
        } else {
            x = plot.width() / 2;
            y = center;
        }

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
        } else {
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
        }

        if ((cursor.orientation === 'vertical' && (x < 0 || x > plot.width())) ||
            (cursor.orientation === 'horizontal' && (y < 0 || y > plot.height()))) {
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

            var start = extent.start;
            var end = extent.end;
            ctx.beginPath();
            ctx.strokeStyle = cursor.color;
            ctx.lineWidth = cursor.lineWidth;
            if (cursor.orientation === 'vertical') {
                ctx.moveTo(start, plot.height() / 2);
                ctx.lineTo(end, plot.height() / 2);
                if (Math.abs(start - cursor.start) > Number.EPSILON) {
                    drawArrowHead(ctx, cursor, 'left', cursor.start, plot.height() / 2);
                }

                if (Math.abs(end - cursor.end) > Number.EPSILON) {
                    drawArrowHead(ctx, cursor, 'right', cursor.end, plot.height() / 2);
                }
            } else {
                ctx.moveTo(plot.width() / 2, start);
                ctx.lineTo(plot.width() / 2, end);

                if (Math.abs(start - cursor.start) > Number.EPSILON) {
                    drawArrowHead(ctx, cursor, 'up', plot.width() / 2, cursor.start);
                }

                if (Math.abs(end - cursor.end) > Number.EPSILON) {
                    drawArrowHead(ctx, cursor, 'down', plot.width() / 2, cursor.end);
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

        var axis = cursor.orientation === 'vertical' ? xaxis : yaxis;
        var axisPrecision = computeCursorsPrecision(plot, axis, cursor.start);
        var formattedValue = axis.tickFormatter(axis.c2p(cursor.end) - axis.c2p(cursor.start), axis, axisPrecision);
        formattedValue = formattedValue.replace(htmlNewline, " ");
        formattedValue = formattedValue.replace(htmlSpace, " ");
        return formattedValue;
    }

    function drawLine(plot, ctx, cursor, pos) {
        if (cursor.orientation === 'vertical') {
            ctx.moveTo(pos, 0);
            ctx.lineTo(pos, plot.height());
        } else {
            ctx.moveTo(0, pos);
            ctx.lineTo(plot.width(), pos);
        }
    }

    function clampStartAndEnd(plot, cursor) {
        var start = cursor.mousePosition.relativeStart;
        var end = cursor.mousePosition.relativeEnd;
        if ((start <= 0 && end <= 0) ||
            (start >= 1 && end >= 1)) {
            return;
        } else {
            if (start < 0) {
                start = 0;
            } else {
                start = cursor.start;
            }

            if (end > 1) {
                end = cursor.orientation === 'vertical' ? plot.width() : plot.height();
            } else {
                end = cursor.end;
            }
        }

        return {start: start, end: end};
    }

    function drawStartAndEndLines(plot, ctx, cursor) {
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

        var drawStart = Math.floor(cursor.start) + adj;
        if (drawStart >= 0 && drawStart <= (cursor.orientation === 'vertical' ? plot.width() : plot.height())) {
            drawLine(plot, ctx, cursor, drawStart);
        }

        var drawEnd = Math.floor(cursor.end) + adj;
        if (drawEnd >= 0 && drawEnd <= (cursor.orientation === 'vertical' ? plot.width() : plot.height())) {
            drawLine(plot, ctx, cursor, drawEnd);
        }

        ctx.stroke();
    }

    function drawFill(plot, ctx, cursor) {
        ctx.fillStyle = cursor.fillColor;
        var extent = clampStartAndEnd(plot, cursor);
        if (!extent) {
            return;
        }

        var start = extent.start;
        var end = extent.end;
        if (cursor.transparentRange === 'outside') {
            if (cursor.orientation === 'vertical') {
                ctx.fillRect(start, 0, end - start, plot.height());
            } else {
                ctx.fillRect(0, start, plot.width(), end - start);
            }
        } else {
            if (cursor.orientation === 'vertical') {
                ctx.fillRect(0, 0, start, plot.height());
                ctx.fillRect(end, 0, plot.width() - end, plot.height());
            } else {
                ctx.fillRect(0, 0, plot.width(), start);
                ctx.fillRect(0, end, plot.width(), plot.height() - end);
            }
        }
    }

    function mouseOverVerticalCursorLine(x, y, plot, pos) {
        var offset = plot.offset();
        var mouseX = Math.max(0, Math.min(x - offset.left, plot.width()));
        var mouseY = Math.max(0, Math.min(y - offset.top, plot.height()));

        return ((mouseX > pos - constants.mouseGrabMargin) &&
            (mouseX < pos + constants.mouseGrabMargin) && (mouseY > 0) && (mouseY < plot.height()));
    }

    function mouseOverHorizontalCursorLine(x, y, plot, pos) {
        var offset = plot.offset();
        var mouseX = Math.max(0, Math.min(x - offset.left, plot.width()));
        var mouseY = Math.max(0, Math.min(y - offset.top, plot.height()));

        return ((mouseY > pos - constants.mouseGrabMargin) &&
            (mouseY < pos + constants.mouseGrabMargin) && (mouseX > 0) && (mouseX < plot.width()));
    }

    function mouseBetweenHorizontalCursorLines(x, y, plot, cursor) {
        var offset = plot.offset();
        var mouseX = Math.max(0, Math.min(x - offset.left, plot.width()));
        var mouseY = Math.max(0, Math.min(y - offset.top, plot.height()));
        var extent = clampStartAndEnd(plot, cursor);
        if (!extent) {
            return;
        }

        var start = extent.start;
        var end = extent.end;
        return ((mouseY > start + constants.mouseGrabMargin) &&
            (mouseY < end - constants.mouseGrabMargin) && (mouseX > 0) && (mouseX < plot.width()));
    }

    function mouseBetweenVerticalCursorLines(x, y, plot, cursor) {
        var offset = plot.offset();
        var mouseX = Math.max(0, Math.min(x - offset.left, plot.width()));
        var mouseY = Math.max(0, Math.min(y - offset.top, plot.height()));
        var extent = clampStartAndEnd(plot, cursor);
        if (!extent) {
            return;
        }

        var start = extent.start;
        var end = extent.end;
        return ((mouseX > start + constants.mouseGrabMargin) &&
            (mouseX < end - constants.mouseGrabMargin) && (mouseY > 0) && (mouseY < plot.height()));
    }

    function mouseOverCursorStartLine(x, y, plot, cursor) {
        if (cursor.orientation === 'vertical') {
            return mouseOverVerticalCursorLine(x, y, plot, cursor.start)
        } else {
            return mouseOverHorizontalCursorLine(x, y, plot, cursor.start)
        }
    }

    function mouseOverCursorEndLine(x, y, plot, cursor) {
        if (cursor.orientation === 'vertical') {
            return mouseOverVerticalCursorLine(x, y, plot, cursor.end)
        } else {
            return mouseOverHorizontalCursorLine(x, y, plot, cursor.end)
        }
    }

    function mouseBetweenCursorStartAndEndLine(x, y, plot, cursor) {
        if (cursor.orientation === 'vertical') {
            return mouseBetweenVerticalCursorLines(x, y, plot, cursor)
        } else {
            return mouseBetweenHorizontalCursorLines(x, y, plot, cursor)
        }
    }

    $.plot.plugins.push({
        init: init,
        options: options,
        name: 'cursors',
        version: '0.2'
    });
})(jQuery);
