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
/* Flot plugin for adding cursors to the plot.
*/

/*global jQuery*/

(function ($) {
    'use strict';

    var options = {
        cursors: []
    };

    var constants = {
        iRectSize: 8,
        mouseGrabMargin: 12,
        textHeight: 10, // to do: compute it somehow. Canvas doesn't give us a way to know it
        labelPadding: 10,
        thumbRadius: 17
    };

    var positionModes = Object.freeze({
        axis: 0,
        relative: 1
    });

    var snapModes = Object.freeze({
        xy: 0, // when dragging the cursor, snap to the nearest point on the plane
        x: 1 // on a chart update, snap to the nearest point on the x axis
    });

    const showThumbToShapeMap = Object.freeze({
        t: 'top',
        b: 'bottom',
        l: 'left',
        r: 'right'
    });

    function init(plot) {
        var cursors = [];
        var update = [];
        var positionMode = positionModes.axis;
        var snapMode = snapModes.xy;
        const thumbPreviousPositionMap = new Map();
        let plotPositionConstrain;
        let svgRoot;

        function createCursor(options) {
            const defaultCursor = createDefaultCursor();
            processCursorOptions(defaultCursor, options);
            return mixin(options, defaultCursor);
        }

        function createDefaultCursor() {
            return {
                name: 'unnamed ' + cursors.length,
                position: {
                    relativeX: 0.5, // relative to the width of the drawing area
                    relativeY: 0.5, // relative to the height of the drawing area
                    x: undefined, // plot value
                    y: undefined // plot value
                },
                mousePosition: {
                    relativeX: undefined,
                    relativeY: undefined
                },
                x: 0, // canvas point relative to the actual data area
                y: 0, // canvas point relative to the actual data area
                valign: 'below',
                halign: 'right',
                show: true,
                selected: false,
                highlighted: false,
                mode: 'xy',
                showIntersections: false,
                showLabel: false,
                showValues: true,
                color: 'gray',
                fontSize: '10px',
                fontFamily: 'sans-serif',
                fontStyle: '',
                fontWeight: '',
                lineWidth: 1,
                movable: true,
                dashes: [],
                intersectionColor: 'darkgray',
                intersectionLabelPosition: 'bottom-right',
                snapToPlot: undefined,
                interpolate: false,
                defaultxaxis: 1,
                defaultyaxis: 1,
                symbolSize: 8,
                showThumbs: 'none',
                thumbAbbreviation: 'C' + cursors.length,
                thumbClassList: ['draggable'],
                thumbs: [],
                thumbColor: undefined,
                horizontalThumbConstrain: undefined,
                verticalThumbConstrain: undefined
            };
        }

        plot.hooks.processOptions.push(function (plot) {
            plot.getOptions().cursors.forEach(function (options) {
                plot.addCursor(options);
            });
        });

        plot.hooks.processOffset.push(function (plot, offset) {
            reserveSpaceForThumbs(cursors, plot, offset);
        });

        plot.getCursors = function () {
            return cursors;
        };

        plot.addCursor = function addCursor(options) {
            var currentCursor = createCursor(options);

            setPosition(plot, currentCursor, currentCursor.position, positionMode);

            cursors.push(currentCursor);

            plot.triggerRedrawOverlay();
        };

        plot.removeCursor = function removeCursor(cursor) {
            const index = cursors.indexOf(cursor);

            if (index !== -1) {
                // remove thumbs
                cursor.thumbs.forEach((thumb) => {
                    dispatchThumbEvent('thumbWillBeRemoved', { current: thumb });
                    svgRoot.removeChild(thumb);
                    thumbPreviousPositionMap.delete(thumb);
                });
                cursors.splice(index, 1);
            }

            plot.triggerRedrawOverlay();
        };

        plot.setCursor = function setCursor(cursor, options) {
            const index = cursors.indexOf(cursor);

            if (index !== -1) {
                processCursorOptions(cursor, options);
                mixin(options, cursors[index]);
                setPosition(plot, cursors[index], cursors[index].position);
                if (cursor._createThumbs) {
                    plot.setupGrid();
                    plot.draw();
                } else {
                    plot.triggerRedrawOverlay();
                }
            }
        };

        plot.getIntersections = function getIntersections(cursor) {
            var index = cursors.indexOf(cursor);

            if (index !== -1) {
                return cursors[index].intersections;
            }

            return [];
        };

        plot.formatCursorPosition = formatCursorPosition;

        plot.setPlotPositionConstrain = (constrain) => {
            if (typeof constrain !== 'function') {
                throw new Error('plot position constrain should be a function');
            }
            plotPositionConstrain = constrain;
        };

        function processCursorOptions(cursor, options) {
            processModeAndThumbs(cursor, options);
            processVisibilityOptions(cursor, options);
        }

        function shouldCoerceWhenModeAndShowThumbsDoNotMatch(mode, showThumbs) {
            if (mode === 'x' && showThumbs.search(/[lr]/) !== -1) {
                // a vertical cursor can't have left or right thumb
                return true;
            }
            if (mode === 'y' && showThumbs.search(/[tb]/) !== -1) {
                // a horizontal cursor can't have top or bottom thumb
                return true;
            }
            if (mode === 'xy' && showThumbs.search(/l\s*r|r\s*l|t\s*b|b\s*t/) !== -1) {
                // xy cursor can't have both left and right thumb or top and bottom thumb
                return true;
            }
            return false;
        }

        function validateAndCoerceModeAndShowThumbs(cursor, options) {
            if (options.mode && options.showThumbs) {
                if (shouldCoerceWhenModeAndShowThumbsDoNotMatch(options.mode, options.showThumbs)) {
                    console.log(`showThumbs ${options.showThumbs} doesn't match mode ${options.mode}.`);
                    switch (options.mode) {
                        case 'x':
                            options.showThumbs = 't';
                            break;
                        case 'y':
                            options.showThumbs = 'r';
                            break;
                        case 'xy':
                            options.showThumbs = 'tr';
                            break;
                    }
                    console.log(`showThumbs is coerced to ${options.showThumbs}`);
                }
            } else if (options.mode) {
                if (shouldCoerceWhenModeAndShowThumbsDoNotMatch(options.mode, cursor.showThumbs)) {
                    console.log(`mode doesn't match the existing showThumbs. It will be ignored`);
                    delete options.mode;
                }
            } else if (options.showThumbs) {
                if (shouldCoerceWhenModeAndShowThumbsDoNotMatch(cursor.mode, options.showThumbs)) {
                    console.log(`showThumbs doesn't match the existing mode. It will be ignored`);
                    delete options.showThumbs;
                }
            }
        }

        function processModeAndThumbs(cursor, options) {
            if (options.showThumbs === 'none') {
                return;
            }

            validateAndCoerceModeAndShowThumbs(cursor, options);

            if (!options.showThumbs) {
                // no showThumbs in options
                return;
            }

            const newShapes = options.showThumbs.split('').map((location) => {
                return showThumbToShapeMap[location];
            });
            let thumbToRemove;
            for (let i = 0; i < cursor.thumbs.length; i++) {
                // remove old thumb and new thumbs will be created in the draw overlay phase
                if (!newShapes.includes(cursor.thumbs[i].shape)) {
                    thumbToRemove = cursor.thumbs[i];
                    cursor.thumbs[i] = null;
                    cursor._createThumbs = true;
                    dispatchThumbEvent('thumbWillBeRemoved', { current: thumbToRemove });
                    svgRoot.removeChild(thumbToRemove);
                    thumbPreviousPositionMap.delete(thumbToRemove);
                }
            }
        }

        function processVisibilityOptions(cursor, options) {
            if (cursor.thumbs.length === 0) {
                return;
            }

            const finalShow = options.show !== undefined ? options.show : cursor.show;
            const finalShowThumbs = options.showThumbs !== undefined ? options.showThumbs : cursor.showThumbs;
            const showChanged = options.show !== undefined ? options.show !== cursor.show : false;
            const showThumbsMakesVisibilityChange = options.showThumbs !== undefined
                ? options.showThumbs !== cursor.showThumbs && (options.showThumbs === 'none' || cursor.showThumbs === 'none')
                : false;
            cursor.triggerThumbVisibilityChanged = (showChanged && finalShowThumbs !== 'none') ||
                (showThumbsMakesVisibilityChange && finalShow);
        }

        function dispatchThumbEvent(name, properties) {
            const event = new CustomEvent(name, { detail: properties });
            plot.getPlaceholder()[0].dispatchEvent(event);
        }

        function tryDispatchThumbVisibilityChangedEvent(cursor, visible) {
            cursor.triggerThumbVisibilityChanged && cursor.thumbs.forEach((thumb) => {
                dispatchThumbEvent('thumbVisibilityChanged', { visible, current: thumb });
            });
        }

        var reserveSpaceForThumbs = function(cursors, plot, offset) {
            var positions = ['left', 'right', 'top', 'bottom'],
                offsetIncrement = [],
                index = 0,
                thumbSize = 2 * constants.thumbRadius,
                thumbsPresent, axesPresent, axes, direction;

            offsetIncrement = positions.map(function(position, index) {
                thumbsPresent = cursors.some(cursor => cursor.showThumbs.indexOf(position[0]) !== -1);

                axes = index > 1 ? plot.getXAxes() : plot.getYAxes();
                axesPresent = axes.some(axis => axis.options.position === position);

                return (thumbsPresent && !axesPresent) ? thumbSize : 0;
            });

            for (direction in offset) {
                offset[direction] += offsetIncrement[index++];
            }
        };

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
                const [x, y] = getPlotXY(e.detail.touches[0].pageX, e.detail.touches[0].pageY);
                handleCursorMoveStart(e, x, y, e.detail.touches[0].pageX, e.detail.touches[0].pageY)
            },

            drag: function(e) {
                const [x, y] = getPlotXY(e.detail.touches[0].pageX, e.detail.touches[0].pageY);
                handleCursorMove(e, x, y, e.detail.touches[0].pageX, e.detail.touches[0].pageY);
            },

            end: function(e) {
                handleCursorMoveEnd(e);
            }
        };

        var pinch = {
            start: function(e) {
                const [x, y] = getPlotXY(e.detail.touches[0].pageX, e.detail.touches[0].pageY);
                handleCursorMoveStart(e, x, y, e.detail.touches[0].pageX, e.detail.touches[0].pageY)
            },

            drag: function(e) {
                const [x, y] = getPlotXY(e.detail.touches[0].pageX, e.detail.touches[0].pageY);
                handleCursorMove(e, x, y, e.detail.touches[0].pageX, e.detail.touches[0].pageY);
            },

            end: function(e) {
                handleCursorMoveEnd(e);
            }
        };

        var thumbmove = {
            start: function (e) {
                handleThumbMoveStart(e);
            },

            drag: function(e) {
                const [x, y] = getPlotXY(e.pageX, e.pageY);
                handleThumbMove(e, x, y);
            },

            end: function(e) {
                handleCursorMoveEnd(e);
            }
        };

        var mouseMove = {
            start: function(e) {
                const page = $.plot.browser.getPageXY(e);
                const [x, y] = getPlotXY(page.X, page.Y);

                handleCursorMoveStart(e, x, y, page.X, page.Y);
            },

            drag: function(e) {
                const page = $.plot.browser.getPageXY(e);
                const [x, y] = getPlotXY(page.X, page.Y);

                handleCursorMove(e, x, y, page.X, page.Y);
            },

            mouseover: function(e) {
                const page = $.plot.browser.getPageXY(e);
                const [x, y] = getPlotXY(page.X, page.Y);

                handleCursorMouseOver(e, x, y, page.X, page.Y);
            },

            end: function(e) {
                const page = $.plot.browser.getPageXY(e);
                const [x, y] = getPlotXY(page.X, page.Y);

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

            eventHolder[0].addEventListener('thumbmovestart', thumbmove.start, false);
            eventHolder[0].addEventListener('thumbmove', thumbmove.drag, false);
            eventHolder[0].addEventListener('thumbmoveend', thumbmove.end, false);

            plot.addEventHandler("dragstart", mouseMove.start, eventHolder, 10);
            plot.addEventHandler("drag", mouseMove.drag, eventHolder, 10);
            plot.addEventHandler("dragend", mouseMove.end, eventHolder, 10);
            eventHolder.bind('mousemove', mouseMove.mouseover)
        });

        plot.hooks.processRawData.push(function(plot, series, seriesData, datapoints) {
            if (series.historyBuffer) {
                // charting plugin enabled
                switchToRelativePlotPosition();
                snapMode = snapModes.x;
            }
        });

        function switchToRelativePlotPosition() {
            positionMode = positionModes.relative;
            cursors.forEach(function(cursor) {
                if (isNaN(cursor.x) || isNaN(cursor.y)) {
                    return;
                }
                var position = {
                    relativeX: cursor.position.relativeX || (cursor.x / plot.width()),
                    relativeY: cursor.position.relativeY || (cursor.y / plot.height()),
                    x: undefined,
                    y: undefined
                };
                if (!isNaN(position.relativeX) && !isNaN(position.relativeY)) {
                    cursor.position = position;
                }
            });
        }

        function switchToAxisPlotPosition() {
            positionMode = positionModes.axis;
            cursors.forEach(function(cursor) {
                cursor.mousePosition = {}; // reset mouse position
                if (cursor.position.x === undefined) {
                    var xaxis = findXAxis(plot, cursor);
                    cursor.position.x = xaxis.c2p ? xaxis.c2p(cursor.x) : undefined;
                }
                if (cursor.position.y === undefined) {
                    var yaxis = findYAxis(plot, cursor);
                    cursor.position.y = yaxis.c2p ? yaxis.c2p(cursor.y) : undefined;
                }
                cursor.position.relativeX = undefined;
                cursor.position.relativeY = undefined;
            });
        }

        function findIntersections(plot, cursor) {
            var intersections = {
                cursor: cursor.name,
                points: []
            };
            if (cursor.interpolate) {
                findIntersectionByInterpolation(plot, cursor, intersections);
            } else {
                findNearbyPointsIntersection(plot, cursor, intersections);
            }

            return intersections;
        }

        function findNearbyPointsIntersection (plot, cursor, intersections) {
            var cursorLastX, cursorLastY;
            if (positionMode === positionModes.axis) {
                cursorLastX = cursor.x;
                cursorLastY = cursor.y;
            } else {
                cursorLastX = cursor.mousePosition.relativeX * plot.width();
                cursorLastY = cursor.mousePosition.relativeY * plot.height();
            }
            var nearestPoint = plot.findNearbyItem(cursorLastX, cursorLastY, function(seriesIndex) {
                return cursor.snapToPlot === -1 || seriesIndex === cursor.snapToPlot;
            }, Number.MAX_VALUE, function(x, y) {
                // on a chart update, we want to snap to the nearest point to the cursor on the x axis
                // all other times, consider y value as well
                if (snapMode === snapModes.x) {
                    return x;
                }
                return x * x + y * y * 0.025;
            });

            if (nearestPoint) {
                var dataset = plot.getData(),
                    ps = dataset[nearestPoint.seriesIndex].datapoints.pointsize,
                    i = nearestPoint.dataIndex * ps;

                intersections.points.push({
                    x: nearestPoint.datapoint[0],
                    y: nearestPoint.datapoint[1],
                    leftPoint: [i - ps, i - ps + 1],
                    rightPoint: [i, i + 1],
                    seriesIndex: nearestPoint.seriesIndex
                });
            }
        }

        function findIntersectionByInterpolation(plot, cursor, intersections) {
            var pos = plot.c2p({
                left: cursor.x,
                top: cursor.y
            });

            var axes = plot.getAxes();
            if (pos.x < axes.xaxis.min || pos.x > axes.xaxis.max ||
                pos.y < axes.yaxis.min || pos.y > axes.yaxis.max) {
                return;
            }

            var interpolationPoint = plot.findNearbyInterpolationPoint(pos.x, pos.y, function(seriesIndex) {
                return cursor.snapToPlot === -1 || seriesIndex === cursor.snapToPlot;
            });

            if (interpolationPoint) {
                intersections.points.push({
                    x: interpolationPoint.datapoint[0],
                    y: interpolationPoint.datapoint[1],
                    leftPoint: interpolationPoint.leftPoint,
                    rightPoint: interpolationPoint.rightPoint,
                    seriesIndex: interpolationPoint.seriesIndex
                });
            }
        }

        function handleThumbMoveStart(e) {
            function isMovable(thumb) {
                return thumb.getAttribute('class').includes('draggable');
            }

            function extractTarget(touchedEl) {
                var target = touchedEl,
                    elClass = touchedEl.getAttribute('class');
                if (elClass.includes('interactionLayer')) {
                    target = touchedEl.parentNode;
                    elClass = target.getAttribute('class');
                }
                if (elClass.includes('thumb')) {
                    return target;
                }

                return null;
            }

            var currentlySelectedCursor = selectedCursor(cursors);
            if (!currentlySelectedCursor) {
                // find nearby cursor and unlock it
                visibleCursors(cursors)
                    .filter(cursor => cursor.movable === true)
                    .forEach(function(cursor) {
                        cursor.thumbs
                            .filter(isMovable)
                            .filter(t => t === extractTarget(e.detail.target))
                            .forEach(function (thumb) {
                                var targetCursor = cursor;
                                if (targetCursor) {
                                    if (thumb.classList.contains('x')) {
                                        targetCursor.dragmode = 'x';
                                    } else {
                                        targetCursor.dragmode = 'y';
                                    }
                                    targetCursor.selected = true;
                                    targetCursor.thumbmove = true;

                                    if (targetCursor.mode === 'x') {
                                        plot.getPlaceholder().css('cursor', 'ew-resize');
                                    } else if (targetCursor.mode === 'y') {
                                        plot.getPlaceholder().css('cursor', 'ns-resize');
                                    }

                                    plot.getPlaceholder().css('cursor', 'move');
                                    plot.getPlaceholder().trigger('cursordragstart', targetCursor);
                                    plot.triggerRedrawOverlay();
                                    e.stopImmediatePropagation();
                                    e.preventDefault();
                                }
                            });
                    });
            }
        }

        function handleThumbMove(e, x, y) {
            const currentlySelectedCursor = selectedCursor(cursors);

            if (currentlySelectedCursor) {
                updateCursorPositionOnMove(currentlySelectedCursor, x, y);
                const thumb = e.selectedThumb;
                let position;
                if (thumb.classList.contains('x')) {
                    position = currentlySelectedCursor.x + plot.getPlotOffset().left;
                } else {
                    position = currentlySelectedCursor.y + plot.getPlotOffset().top;
                }
                thumbPreviousPositionMap.set(thumb, position);

                plot.getPlaceholder().trigger('cursordrag', currentlySelectedCursor);
                plot.triggerRedrawOverlay();
                e.stopImmediatePropagation();
                e.preventDefault();
            }
        }

        function handleCursorMove(e, x, y, pageX, pageY) {
            var currentlySelectedCursor = selectedCursor(cursors);

            if (currentlySelectedCursor) {
                updateCursorPositionOnMove(currentlySelectedCursor, x, y);

                plot.getPlaceholder().trigger('cursordrag', currentlySelectedCursor);
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
                updateCursorHightlight(pageX, pageY, plot, cursor);
            });
        }

        function updateCursorHightlight(pageX, pageY, plot, cursor) {
            if (!cursor.movable) {
                return;
            }
            if (mouseOverCursorManipulator(pageX, pageY, plot, cursor)) {
                if (!cursor.highlighted) {
                    cursor.highlighted = true;
                    plot.triggerRedrawOverlay();
                }

                plot.getPlaceholder().css('cursor', 'pointer');
            } else if (mouseOverCursorVerticalLine(pageX, pageY, plot, cursor)) {
                if (!cursor.highlighted) {
                    cursor.highlighted = true;
                    plot.triggerRedrawOverlay();
                }

                plot.getPlaceholder().css('cursor', 'col-resize');
            } else if (mouseOverCursorHorizontalLine(pageX, pageY, plot, cursor)) {
                if (!cursor.highlighted) {
                    cursor.highlighted = true;
                    plot.triggerRedrawOverlay();
                }

                plot.getPlaceholder().css('cursor', 'row-resize');
            } else {
                if (cursor.highlighted) {
                    cursor.highlighted = false;
                    plot.getPlaceholder().css('cursor', 'default');
                    plot.triggerRedrawOverlay();
                }
            }
        }

        function handleCursorMoveStart(e, x, y, pageX, pageY) {
            var currentlySelectedCursor = selectedCursor(cursors);
            snapMode = snapModes.xy;
            if (currentlySelectedCursor) {
                plot.getPlaceholder().css('cursor', 'default');
                currentlySelectedCursor.x = x;
                currentlySelectedCursor.y = y;
                currentlySelectedCursor.position.relativeX = x / plot.width();
                currentlySelectedCursor.position.relativeY = y / plot.height();

                plot.triggerRedrawOverlay();
            } else {
                // find nearby cursor and unlock it
                var targetCursor;
                var dragmode;

                visibleCursors(cursors).forEach(function (cursor) {
                    if (!cursor.movable) {
                        return;
                    }
                    if (mouseOverCursorManipulator(pageX, pageY, plot, cursor)) {
                        targetCursor = cursor;
                        dragmode = 'xy';
                    } else if (mouseOverCursorHorizontalLine(pageX, pageY, plot, cursor)) {
                        targetCursor = cursor;
                        dragmode = 'y';
                    } else if (mouseOverCursorVerticalLine(pageX, pageY, plot, cursor)) {
                        targetCursor = cursor;
                        dragmode = 'x';
                    }

                    updateCursorHightlight(pageX, pageY, plot, cursor);
                });

                if (targetCursor) {
                    targetCursor.thumbmove = false;
                    targetCursor.selected = true;
                    targetCursor.dragmode = dragmode;
                    // changed for InsightCM -max
                    if (targetCursor.mode === 'x') {
                        plot.getPlaceholder().css('cursor', 'ew-resize');
                    } else if (targetCursor.mode === 'y') {
                        plot.getPlaceholder().css('cursor', 'ns-resize');
                    } else {
                        plot.getPlaceholder().css('cursor', 'move');
                    }
                    plot.getPlaceholder().css('cursor', 'move');
                    plot.getPlaceholder().trigger('cursordragstart', targetCursor);
                    plot.triggerRedrawOverlay();
                    e.stopImmediatePropagation();
                    e.preventDefault();
                }
            }

            currentlySelectedCursor = selectedCursor(cursors);
        }

        function handleCursorMoveEnd(e, x, y, pageX, pageY) {
            var currentlySelectedCursor = selectedCursor(cursors);

            if (currentlySelectedCursor) {
                if (isFinite(x) && isFinite(y)) {
                    updateCursorPositionOnMove(currentlySelectedCursor, x, y);
                }

                // lock the free cursor to current position
                currentlySelectedCursor.selected = false;
                currentlySelectedCursor.thumbmove = false;

                plot.getPlaceholder().css('cursor', 'default');
                plot.getPlaceholder().trigger('cursordragend', currentlySelectedCursor);
                plot.triggerRedrawOverlay();
                e.stopImmediatePropagation();
                e.preventDefault();
            }
        }

        function updateCursorPositionOnMove(cursor, x, y) {
            var xaxis = findXAxis(plot, cursor),
                yaxis = findYAxis(plot, cursor);

            if (cursor.dragmode.indexOf('x') !== -1) {
                cursor.x = x;
                cursor.position.x = xaxis.c2p ? xaxis.c2p(x) : undefined;
                cursor.position.relativeX = x / plot.width();
                cursor.mousePosition.relativeX = x / plot.width();
            }

            if (cursor.dragmode.indexOf('y') !== -1) {
                cursor.y = y;
                cursor.position.y = yaxis.c2p ? yaxis.c2p(y) : undefined;
                cursor.position.relativeY = y / plot.height();
                cursor.mousePosition.relativeY = y / plot.height();
            }
        }

        function getPlotXY(pageX, pageY) {
            if (plotPositionConstrain) {
                return plotPositionConstrain(pageX, pageY);
            }

            const offset = plot.offset();
            return [
                Math.max(0, Math.min(pageX - offset.left, plot.width())),
                Math.max(0, Math.min(pageY - offset.top, plot.height()))
            ];
        }

        plot.hooks.drawOverlay.push(function (plot, ctx) {
            var isMousePositionInitilized = function(mousePosition) {
                return mousePosition.relativeX !== undefined && mousePosition.relativeY !== undefined;
            };

            update = [];

            cursors.forEach(function (cursor) {
                var intersections;

                initializePositionIfNecessary(plot, cursor);
                setPosition(plot, cursor, cursor.position);
                if (!isMousePositionInitilized(cursor.mousePosition)) {
                    cursor.mousePosition.relativeX = cursor.x / plot.width();
                    cursor.mousePosition.relativeY = cursor.y / plot.height();
                }

                intersections = findIntersections(plot, cursor);
                maybeSnapToPlot(plot, cursor, intersections);
                cursor.intersections = intersections;
                intersections.target = cursor;
                update.push(intersections);

                if (cursor.show) {
                    var plotOffset = plot.getPlotOffset();

                    ctx.save();
                    ctx.translate(plotOffset.left, plotOffset.top);

                    determineAndSetTextQuadrant(plot, ctx, cursor);
                    drawVerticalAndHorizontalLines(plot, ctx, cursor);
                    drawLabel(plot, ctx, cursor);
                    drawIntersections(plot, ctx, cursor);
                    drawValues(plot, ctx, cursor);
                    if (cursor.symbol !== 'none') {
                        drawManipulator(plot, ctx, cursor);
                    }

                    ctx.restore();

                    if (cursor.showThumbs !== 'none') {
                        if (cursor.thumbs.length === 0 || cursor._createThumbs) {
                            createThumbs(cursor, plot, plotOffset);
                            cursor._createThumbs = false;
                        } else if (!cursor.thumbmove) {
                            //the case where cursor was moved not due to a thumb move
                            updateThumbsPosition(plot, cursor, plotOffset);
                            tryDispatchThumbVisibilityChangedEvent(cursor, true);
                        }
                    } else {
                        hideThumbs(cursor);
                        tryDispatchThumbVisibilityChangedEvent(cursor, false);
                    }
                } else {
                    hideThumbs(cursor);
                    tryDispatchThumbVisibilityChangedEvent(cursor, false);
                }
            });

            if (update.length > 0) {
                plot.getPlaceholder().trigger('cursorupdates', [update]);
            }
        });

        plot.hooks.resize.push(function (plot, width, height) {
            // the height and the width parameter from resize hook include margin offsets
            cursors.forEach(function (cursor) {
                const plotOffset = plot.getPlotOffset();
                let yThumbIndex = 0;

                const xThumb = cursor.thumbs[0];
                if (xAxisThumb(cursor) && xThumb) {
                    yThumbIndex = 1;
                    if (cursor.showThumbs.indexOf('b') !== -1) {
                        const thumbCy = height - plotOffset.bottom + constants.thumbRadius;
                        $.thumb.updateComputedYPosition(xThumb, thumbCy);
                    }
                }

                const yThumb = cursor.thumbs[yThumbIndex]
                if (yAxisThumb(cursor) && yThumb) {
                    if (cursor.showThumbs.indexOf('r') !== -1) {
                        const thumbCx = width - plotOffset.right + constants.thumbRadius;
                        $.thumb.updateComputedXPosition(yThumb, thumbCx);
                    }
                }
            });
        });

        function hideThumbs(cursor) {
            cursor.thumbs.forEach((thumb) => {
                $.thumb.setHidden(thumb, true);
            });
        }

        function createThumbs(cursor, plot, plotOffset) {
            svgRoot = $.thumb.createSVGLayer(plot.getPlaceholder(), plot.getEventHolder());
            let thumb, thumbCx, thumbCy, constraintFunction, yThumbIndex = 0;
            const thumbOptions = {
                size: constants.thumbRadius,
                svgRoot: svgRoot,
                abbreviation: cursor.thumbAbbreviation || cursor.name[0],
                classList: cursor.thumbClassList,
                offset: cursor.thumbOffset,
                fill: cursor.thumbColor
            };

            if (xAxisThumb(cursor) && !cursor.thumbs[0]) {
                yThumbIndex = 1;
                thumbCx = cursor.x + plotOffset.left;
                thumbCy = cursor.showThumbs.indexOf('b') !== -1 ? plot.height() + plotOffset.top + constants.thumbRadius : plotOffset.top - constants.thumbRadius;
                // cursor uses the default constrain function unless we provide one explicitly
                constraintFunction = cursor.horizontalThumbConstrain ? cursor.horizontalThumbConstrain : function (mouseX, mouseY, currentX, currentY, thumbX, thumbY) {
                    var offsetLeft = plot.offset().left,
                        x = Math.max(offsetLeft, Math.min(thumbX, plot.width() + offsetLeft)) - thumbX + mouseX;
                    return [x, currentY];
                };

                thumbOptions.shape = cursor.showThumbs.indexOf('b') !== -1 ? 'bottom' : 'top';
                thumbOptions.x = thumbCx;
                thumbOptions.y = thumbCy;
                thumbOptions.constraintFunction = constraintFunction;

                thumb = $.thumb.createThumb(thumbOptions);
                cursor.thumbs[0] = thumb;
                thumbPreviousPositionMap.set(thumb, thumbCx);
                dispatchThumbEvent('thumbCreated', { current: thumb });
            }
            if (yAxisThumb(cursor) && !cursor.thumbs[yThumbIndex]) {
                thumbCx = cursor.showThumbs.indexOf('l') !== -1 ? plotOffset.left - constants.thumbRadius : plotOffset.left + plot.width() + constants.thumbRadius;
                thumbCy = cursor.y + plotOffset.top;
                constraintFunction = cursor.verticalThumbConstrain ? cursor.verticalThumbConstrain : function (mouseX, mouseY, currentX, currentY, thumbX, thumbY) {
                    var offset = plot.offset(),
                        y = Math.max(offset.top, Math.min(thumbY, plot.height() + offset.top)) - thumbY + mouseY;
                    return [currentX, y];
                };

                thumbOptions.shape = cursor.showThumbs.indexOf('l') !== -1 ? 'left' : 'right';
                thumbOptions.x = thumbCx;
                thumbOptions.y = thumbCy;
                thumbOptions.constraintFunction = constraintFunction;

                thumb = $.thumb.createThumb(thumbOptions);
                cursor.thumbs[yThumbIndex] = thumb;
                thumbPreviousPositionMap.set(thumb, thumbCy);
                dispatchThumbEvent('thumbCreated', { current: thumb });
            }
        }

        function updateThumbsPosition(plot, cursor, plotOffset) {
            let thumb;
            if (xAxisThumb(cursor)) {
                thumb = cursor.thumbs[0];
                const cursorX = cursor.x + plotOffset.left;
                const previousX = thumbPreviousPositionMap.get(thumb);
                const isTopThumb = isThumbAtTop(thumb);
                if (isPositionInXRange(plot, cursor.x)) {
                    if (previousX < plotOffset.left) {
                        dispatchThumbIntoOutOfRangeEvent('thumbIntoRange',
                            {
                                target: thumb,
                                edge: isTopThumb ? 'topleft' : 'bottomleft',
                                orientation: 'horizontal',
                                position: cursorX
                            },
                            plot.getEventHolder());
                    } else if (previousX > plotOffset.left + plot.width()) {
                        dispatchThumbIntoOutOfRangeEvent('thumbIntoRange',
                            {
                                target: thumb,
                                edge: isTopThumb ? 'topright' : 'bottomright',
                                orientation: 'horizontal',
                                position: cursorX
                            },
                            plot.getEventHolder());
                    }

                    $.thumb.setHidden(thumb, false);
                    $.thumb.updateComputedXPosition(thumb, cursorX);
                } else {
                    if (isPositionInXRange(plot, previousX - plotOffset.left) && cursor.x < 0) {
                        dispatchThumbIntoOutOfRangeEvent('thumbOutOfRange',
                            {
                                target: thumb,
                                edge: isTopThumb ? 'topleft' : 'bottomleft',
                                orientation: 'horizontal'
                            },
                            plot.getEventHolder());
                    } else if (isPositionInXRange(plot, previousX - plotOffset.left) && cursor.x > plot.width()) {
                        dispatchThumbIntoOutOfRangeEvent('thumbOutOfRange',
                            {
                                target: thumb,
                                edge: isTopThumb ? 'topright' : 'bottomright',
                                orientation: 'horizontal'
                            },
                            plot.getEventHolder());
                    }

                    $.thumb.setHidden(thumb, true);
                }

                thumbPreviousPositionMap.set(thumb, cursorX);
            }
            if (yAxisThumb(cursor)) {
                const yThumbIndex = xAxisThumb(cursor) ? 1 : 0;
                thumb = cursor.thumbs[yThumbIndex];
                const cursorY = cursor.y + plotOffset.top;
                const previousY = thumbPreviousPositionMap.get(thumb);
                const isLeftThumb = isThumbAtLeft(thumb);
                if (isPositionInYRange(plot, cursor.y)) {
                    if (previousY < plotOffset.top) {
                        dispatchThumbIntoOutOfRangeEvent('thumbIntoRange',
                            {
                                target: thumb,
                                edge: isLeftThumb ? 'topleft' : 'topright',
                                orientation: 'vertical',
                                position: cursorY
                            },
                            plot.getEventHolder());
                    } else if (previousY > plotOffset.top + plot.height()) {
                        dispatchThumbIntoOutOfRangeEvent('thumbIntoRange',
                            {
                                target: thumb,
                                edge: isLeftThumb ? 'bottomleft' : 'bottomright',
                                orientation: 'vertical',
                                position: cursorY
                            },
                            plot.getEventHolder());
                    }

                    $.thumb.setHidden(thumb, false);
                    $.thumb.updateComputedYPosition(thumb, cursorY);
                } else {
                    if (isPositionInYRange(plot, previousY - plotOffset.top)) {
                        if (cursor.y < 0) {
                            dispatchThumbIntoOutOfRangeEvent('thumbOutOfRange',
                                {
                                    target: thumb,
                                    edge: isLeftThumb ? 'topleft' : 'topright',
                                    orientation: 'vertical'
                                },
                                plot.getEventHolder());
                        } else if (cursor.y > plot.height()) {
                            dispatchThumbIntoOutOfRangeEvent('thumbOutOfRange',
                                {
                                    target: thumb,
                                    edge: isLeftThumb ? 'bottomleft' : 'bottomright',
                                    orientation: 'vertical'
                                },
                                plot.getEventHolder());
                        }
                    }

                    $.thumb.setHidden(thumb, true);
                }

                thumbPreviousPositionMap.set(thumb, cursorY);
            }
        }

        function dispatchThumbIntoOutOfRangeEvent(eventType, properties, eventHolder) {
            const event = new CustomEvent(eventType, { detail: properties });
            eventHolder.dispatchEvent(event);
        }

        function isThumbAtTop(thumb) {
            return thumb.classList.contains('top');
        }

        function isThumbAtLeft(thumb) {
            return thumb.classList.contains('left');
        }

        function xAxisThumb(cursor) {
            return (cursor.showThumbs.indexOf('b') !== -1 || cursor.showThumbs.indexOf('t') !== -1);
        }

        function yAxisThumb(cursor) {
            return (cursor.showThumbs.indexOf('l') !== -1 || cursor.showThumbs.indexOf('r') !== -1);
        }

        plot.hooks.shutdown.push(function (plot, eventHolder) {
            eventHolder[0].removeEventListener('panstart', pan.start);
            eventHolder[0].removeEventListener('pandrag', pan.drag);
            eventHolder[0].removeEventListener('panend', pan.end);
            eventHolder[0].removeEventListener('pinchstart', pinch.start);
            eventHolder[0].removeEventListener('pinchdrag', pinch.drag);
            eventHolder[0].removeEventListener('pinchend', pinch.end);

            eventHolder[0].removeEventListener('thumbmovestart', thumbmove.start);
            eventHolder[0].removeEventListener('thumbmove', thumbmove.drag);
            eventHolder[0].removeEventListener('thumbmoveend', thumbmove.end);

            eventHolder.unbind('dragstart', mouseMove.start);
            eventHolder.unbind('drag', mouseMove.drag);
            eventHolder.unbind('dragend', mouseMove.end);
            eventHolder.unbind('mousemove', mouseMove.mouseover);

            eventHolder.unbind('cursorupdates');

            var placeholder = plot.getPlaceholder();
            placeholder.unbind('plotpan', switchToAxisPlotPosition);
            placeholder.unbind('plotzoom', switchToAxisPlotPosition);
            placeholder.css('cursor', 'default');
            if (placeholder.find('.flot-thumbs')[0]) {
                $.thumb.shutdown(placeholder.find('.flot-thumbs')[0].firstChild);
            }

            cursors = [];
            thumbPreviousPositionMap.clear();
            update = [];
        });
    }

    function mixin(source, destination) {
        Object.keys(source).forEach(function (key) {
            destination[key] = source[key];
        });

        return destination;
    }

    function initializePositionIfNecessary(plot, cursor) {
        var xaxis = findXAxis(plot, cursor),
            yaxis = findYAxis(plot, cursor),
            position = cursor.position;
        if ((position.x === undefined || position.y === undefined) && xaxis.c2p && yaxis.c2p &&
            !(xaxis.min === 0 && xaxis.max === 1 && yaxis.min === 0 && yaxis.max === 1)) {
            // if cursor is defined with an initial relative position, need to initialize
            // axis position values after axes have been defined
            position.x = xaxis.c2p(position.relativeX * plot.width());
            position.y = yaxis.c2p(position.relativeY * plot.height());
        }

        if ((position.relativeX === undefined || position.relativeY === undefined) &&
            xaxis.p2c && yaxis.p2c && !(position.x === undefined || position.y === undefined)) {
            // if cursor is defined with an initial axis position, need to initialize
            // axis relative position values
            position.relativeX = xaxis.p2c(position.x) / plot.width();
            position.relativeY = yaxis.p2c(position.y) / plot.height();
        }
    }

    /**
        Calculate and set the canvas coords based on relative coords or plot values.
        When both provided then the plot values will be taken into account
        and the canvas coords ignored.
     */
    function setPosition(plot, cursor, pos) {
        var xaxis = findXAxis(plot, cursor),
            yaxis = findYAxis(plot, cursor),
            x, y;

        if (pos.x !== undefined && xaxis.p2c) {
            x = xaxis.p2c(pos.x);
        } else {
            x = pos.relativeX * plot.width();
        }
        if (pos.y !== undefined && yaxis.p2c) {
            y = yaxis.p2c(pos.y);
        } else {
            y = pos.relativeY * plot.height();
        }

        // These values could be outside the plot area
        cursor.x = x;
        cursor.y = y;
    }

    function maybeSnapToPlot(plot, cursor, intersections) {
        if (cursor.snapToPlot >= -1) {
            var point = intersections.points[0];

            if (point) {
                var plotData = plot.getData()[point.seriesIndex],
                    relativeX = plotData.xaxis.p2c(point.x) / plot.width(),
                    relativeY = plotData.yaxis.p2c(point.y) / plot.height();

                setPosition(plot, cursor, {
                    x: point.x,
                    y: point.y
                });

                cursor.position.x = point.x;
                cursor.position.y = point.y;
                cursor.position.relativeX = relativeX;
                cursor.position.relativeY = relativeY;

                intersections.x = point.x; // update cursor position
                intersections.y = point.y;
            }
        }
    }

    function determineAndSetTextQuadrant(plot, ctx, cursor) {
        var width = plot.width(),
            height = plot.height(),
            y = cursor.y,
            x = cursor.x,
            rowsWidth = 0,
            rowsHeight = 0,
            count = rowCount(cursor),
            fontSizeInPx = Number(cursor.fontSize.substring(0, cursor.fontSize.length - 2)),
            lowerLimit = 0.05,
            higherLimit = 1 - lowerLimit;

        ctx.font = cursor.fontStyle + ' ' + cursor.fontWeight + ' ' + cursor.fontSize + ' ' + cursor.fontFamily;
        if (cursor.showLabel) {
            rowsWidth = Math.max(rowsWidth, ctx.measureText(cursor.name).width);
        }
        if (cursor.showValues) {
            var positionTextValues = formatCursorPosition(plot, cursor),
                text = positionTextValues.xTextValue + ", " + positionTextValues.yTextValue;
            rowsWidth = Math.max(rowsWidth, ctx.measureText(text).width);
        }

        if (cursor.halign === 'right' && x + rowsWidth > width * higherLimit) {
            cursor.halign = 'left';
        } else if (cursor.halign === 'left' && x - rowsWidth < width * lowerLimit) {
            cursor.halign = 'right';
        }

        rowsHeight = count * (fontSizeInPx + constants.labelPadding);

        if (cursor.valign === 'below' && y + rowsHeight > height * higherLimit) {
            cursor.valign = 'above';
        } else if (cursor.valign === 'above' && y - rowsHeight < height * lowerLimit) {
            cursor.valign = 'below';
        }
    }

    /**
     * The text displayed next to the cursor can be stacked as rows and their positions can be calculated with this function.
     * The bottom one has the index = 0, and the top one has the index = count -1. Depending on the current cursor's possition
     * relative to the center of the plot, index and count, the positions will be computed like this:
     *
     *               |
     *           two | two
     *           one | one
     *          zero | zero
     *       --------+--------
     *           two | two
     *           one | one
     *          zero | zero
     *               |
     */
    function computeRowPosition(plot, cursor, index, count) {
        var textAlign = 'left';
        var fontSizeInPx = Number(cursor.fontSize.substring(0, cursor.fontSize.length - 2));

        var y = cursor.y;
        var x = cursor.x;

        if (cursor.halign === 'left') {
            x -= constants.labelPadding;
            textAlign = 'right';
        } else {
            x += constants.labelPadding;
        }

        if (cursor.valign === 'above') {
            y -= constants.labelPadding * (count - index) + fontSizeInPx * (count - 1 - index);
        } else {
            y += constants.labelPadding * (index + 1) + fontSizeInPx * (index + 1);
        }

        return {
            x: x,
            y: y,
            textAlign: textAlign
        };
    }

    function rowCount(cursor) {
        return (cursor.showLabel ? 1 : 0) + (cursor.showValues ? 1 : 0);
    }

    function labelRowIndex(cursor) {
        return 0;
    }

    function valuesRowIndex(cursor) {
        return cursor.showLabel ? 1 : 0;
    }

    function isPositionInXRange(plot, position) {
        return position >= 0 && Math.round(position) <= plot.width();
    }

    function isPositionInYRange(plot, position) {
        return position >= 0 && Math.round(position) <= plot.height();
    }

    function cursorInPlotRange(plot, cursor) {
        return isPositionInXRange(plot, cursor.x) && isPositionInYRange(plot, cursor.y);
    }

    function drawLabel(plot, ctx, cursor) {
        if (cursor.showLabel && cursorInPlotRange(plot, cursor)) {
            ctx.beginPath();
            var position = computeRowPosition(plot, cursor, labelRowIndex(cursor), rowCount(cursor));
            ctx.fillStyle = cursor.color;
            ctx.textAlign = position.textAlign;
            ctx.font = cursor.fontStyle + ' ' + cursor.fontWeight + ' ' + cursor.fontSize + ' ' + cursor.fontFamily;
            ctx.fillText(cursor.name, position.x, position.y);
            ctx.textAlign = 'left';
            ctx.stroke();
        }
    }

    function fillTextAligned(ctx, text, x, y, position, fontStyle, fontWeight, fontSize, fontFamily) {
        var fontSizeInPx = Number(fontSize.substring(0, fontSize.length - 2));
        var textWidth;
        switch (position) {
            case 'left':
                textWidth = ctx.measureText(text).width;
                x = x - textWidth - constants.iRectSize;
                break;
            case 'bottom-left':
                textWidth = ctx.measureText(text).width;
                x = x - textWidth - constants.iRectSize;
                y = y + fontSizeInPx;
                break;
            case 'top-left':
                textWidth = ctx.measureText(text).width;
                x = x - textWidth - constants.iRectSize;
                y = y - constants.iRectSize;
                break;
            case 'top-right':
                x = x + constants.iRectSize;
                y = y - constants.iRectSize;
                break;
            case 'right':
                x = x + constants.iRectSize;
                break;
            case 'bottom-right':
            default:
                x = x + constants.iRectSize;
                y = y + fontSizeInPx;
                break;
        }

        ctx.textBaseline = "middle";
        ctx.font = fontStyle + ' ' + fontWeight + ' ' + fontSize + ' ' + fontFamily;
        ctx.fillText(text, x, y);
    }

    function drawIntersections(plot, ctx, cursor) {
        if (cursor.showIntersections && hasVerticalLine(cursor)) {
            ctx.beginPath();
            if (cursor.intersections === undefined) {
                return;
            }
            cursor.intersections.points.forEach(function (point, index) {
                if (typeof cursor.showIntersections === 'object') {
                    if (cursor.showIntersections.indexOf(index) === -1) {
                        return;
                    }
                }
                var coord = plot.p2c(point);
                ctx.fillStyle = cursor.intersectionColor;
                ctx.fillRect(Math.floor(coord.left) - constants.iRectSize / 2,
                    Math.floor(coord.top) - constants.iRectSize / 2,
                    constants.iRectSize, constants.iRectSize);

                var text;
                if (typeof cursor.formatIntersectionData === 'function') {
                    text = cursor.formatIntersectionData(point);
                } else {
                    text = point.y.toFixed(2);
                }

                fillTextAligned(ctx, text, coord.left, coord.top, cursor.intersectionLabelPosition, cursor.fontStyle, cursor.fontWeight, cursor.fontSize, cursor.fontFamily);
            });
            ctx.stroke();
        }
    }

    function computeCursorsPrecision(plot, axis, canvasPosition) {
        var canvas2 = axis.direction === "x" ? canvasPosition + 1 : canvasPosition - 1,
            point1 = axis.c2p(canvasPosition),
            point2 = axis.c2p(canvas2);

        return plot.computeValuePrecision(point1, point2, axis.direction, 1);
    }

    function findXAxis(plot, cursor) {
        var dataset = plot.getData(),
            xaxes = plot.getXAxes(),
            zeroBasedIndex = cursor.defaultxaxis - 1;
        if (cursor.snapToPlot >= -1) {
            if (cursor.intersections && cursor.intersections.points[0]) {
                var series = dataset[cursor.intersections.points[0].seriesIndex];
                return series ? series.xaxis : xaxes[zeroBasedIndex];
            } else {
                return xaxes[zeroBasedIndex];
            }
        } else {
            return xaxes[zeroBasedIndex];
        }
    }

    function findYAxis(plot, cursor) {
        var dataset = plot.getData(),
            yaxes = plot.getYAxes(),
            zeroBasedIndex = cursor.defaultyaxis - 1;
        if (cursor.snapToPlot >= -1) {
            if (cursor.intersections && cursor.intersections.points[0]) {
                var series = dataset[cursor.intersections.points[0].seriesIndex];
                return series ? series.yaxis : yaxes[zeroBasedIndex];
            } else {
                return yaxes[zeroBasedIndex];
            }
        } else {
            return yaxes[zeroBasedIndex];
        }
    }

    function formatCursorPosition(plot, cursor) {
        var xaxis = findXAxis(plot, cursor),
            yaxis = findYAxis(plot, cursor),
            htmlSpace = '&nbsp;',
            htmlNewline = '<br>',
            xaxisPrecision = computeCursorsPrecision(plot, xaxis, cursor.x),
            xFormattedValue = xaxis.tickFormatter(xaxis.c2p(cursor.x), xaxis, xaxisPrecision, plot),
            yaxisPrecision = computeCursorsPrecision(plot, yaxis, cursor.y),
            yFormattedValue = yaxis.tickFormatter(yaxis.c2p(cursor.y), yaxis, yaxisPrecision, plot);

        xFormattedValue = xFormattedValue.replace(htmlNewline, " ");
        xFormattedValue = xFormattedValue.replace(htmlSpace, " ");

        yFormattedValue = yFormattedValue.replace(htmlNewline, " ");
        yFormattedValue = yFormattedValue.replace(htmlSpace, " ");

        return {
            xTextValue: xFormattedValue,
            yTextValue: yFormattedValue
        }
    }

    function drawValues(plot, ctx, cursor) {
        if (cursor.showValues && cursorInPlotRange(plot, cursor)) {
            var positionTextValues = formatCursorPosition(plot, cursor),
                text = positionTextValues.xTextValue + ", " + positionTextValues.yTextValue,
                position = computeRowPosition(plot, cursor, valuesRowIndex(cursor), rowCount(cursor));

            ctx.fillStyle = cursor.color;
            ctx.textAlign = position.textAlign;
            ctx.font = cursor.fontStyle + ' ' + cursor.fontWeight + ' ' + cursor.fontSize + ' ' + cursor.fontFamily;
            ctx.fillText(text, position.x, position.y);
        }
    }

    function drawVerticalAndHorizontalLines(plot, ctx, cursor) {
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
        ctx.setLineDash(cursor.dashes);

        if (cursor.mode.indexOf("x") !== -1 && isPositionInXRange(plot, cursor.x)) {
            var drawX = Math.floor(cursor.x) + adj;
            // draw from cursor center out, so dashed lines look consistent
            ctx.moveTo(drawX, Math.min(plot.height(), Math.max(0, cursor.y - cursor.symbolSize / 2)));
            ctx.lineTo(drawX, 0);
            ctx.moveTo(drawX, Math.min(plot.height(), Math.max(0, cursor.y + cursor.symbolSize / 2)));
            ctx.lineTo(drawX, plot.height());
        }

        if (cursor.mode.indexOf("y") !== -1 && isPositionInYRange(plot, cursor.y)) {
            var drawY = Math.floor(cursor.y) + adj;
            // draw from cursor center out, so dashed lines look consistent
            ctx.moveTo(Math.min(plot.width(), Math.max(0, cursor.x - cursor.symbolSize / 2)), drawY);
            ctx.lineTo(0, drawY);
            ctx.moveTo(Math.min(plot.width(), Math.max(0, cursor.x + cursor.symbolSize / 2)), drawY);
            ctx.lineTo(plot.width(), drawY);
        }

        ctx.stroke();
        ctx.setLineDash([]);
    }

    function drawManipulator(plot, ctx, cursor) {
        if (!cursorInPlotRange(plot, cursor)) {
            return;
        }

        // keep line sharp
        var adj = cursor.lineWidth % 2 ? 0.5 : 0;
        ctx.beginPath();

        if (cursor.highlighted) {
            ctx.strokeStyle = 'orange';
        } else {
            ctx.strokeStyle = cursor.color;
        }
        if (cursor.symbol && plot.drawSymbol && plot.drawSymbol[cursor.symbol]) {
            ctx.fillStyle = cursor.color;
            plot.drawSymbol[cursor.symbol](ctx, Math.floor(cursor.x) + adj,
                Math.floor(cursor.y) + adj, cursor.symbolSize / 2, 0);
        } else {
            ctx.fillRect(Math.floor(cursor.x) + adj - (cursor.symbolSize / 2),
                Math.floor(cursor.y) + adj - (cursor.symbolSize / 2),
                cursor.symbolSize, cursor.symbolSize);
        }

        ctx.stroke();
    }

    function hasVerticalLine(cursor) {
        return (cursor.mode.indexOf('x') !== -1);
    }

    function hasHorizontalLine(cursor) {
        return (cursor.mode.indexOf('y') !== -1);
    }

    function mouseOverCursorManipulator(x, y, plot, cursor) {
        var offset = plot.offset();
        var mouseX = Math.max(0, Math.min(x - offset.left, plot.width()));
        var mouseY = Math.max(0, Math.min(y - offset.top, plot.height()));
        var grabRadius = cursor.symbolSize + constants.mouseGrabMargin;

        return ((mouseX > cursor.x - grabRadius) && (mouseX < cursor.x + grabRadius) &&
            (mouseY > cursor.y - grabRadius) && (mouseY < cursor.y + grabRadius)) &&
            (cursor.symbol !== 'none');
    }

    function mouseOverCursorVerticalLine(x, y, plot, cursor) {
        var offset = plot.offset();
        var mouseX = Math.max(0, Math.min(x - offset.left, plot.width()));
        var mouseY = Math.max(0, Math.min(y - offset.top, plot.height()));

        return (hasVerticalLine(cursor) && (mouseX > cursor.x - constants.mouseGrabMargin) &&
            (mouseX < cursor.x + constants.mouseGrabMargin) && (mouseY > 0) && (mouseY < plot.height()));
    }

    function mouseOverCursorHorizontalLine(x, y, plot, cursor) {
        var offset = plot.offset();
        var mouseX = Math.max(0, Math.min(x - offset.left, plot.width()));
        var mouseY = Math.max(0, Math.min(y - offset.top, plot.height()));

        return (hasHorizontalLine(cursor) && (mouseY > cursor.y - constants.mouseGrabMargin) &&
            (mouseY < cursor.y + constants.mouseGrabMargin) && (mouseX > 0) && (mouseX < plot.width()));
    }

    $.plot.plugins.push({
        init: init,
        options: options,
        name: 'cursors',
        version: '0.2'
    });
})(jQuery);
