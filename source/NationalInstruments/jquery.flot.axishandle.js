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
/* Flot plugin for adding axis handle to the graph
*/

/*global jQuery*/

(function ($) {
    'use strict';

    const options = {
        axisHandles: []
    };

    const defaultThumbRadius = 17;

    const oppositePositions = Object.freeze({
        left: 'right',
        right: 'left',
        bottom: 'top',
        top: 'bottom'
    });

    const saturated = $.plot.saturated;

    function init(plot) {
        let axisHandles = [];
        let requestAnimationFrameId;
        let thumbSvgRoot;
        let plotPositionConstrain;
        const privateProperties = [
            'positionInPixel',
            'selected',
            'thumbmove',
            'thumb'
        ];

        const propertiesThatRecreateThumb = [
            'orientation',
            'location',
            'radius'
        ];

        const thumbPreviousPositionMap = new Map();

        function createDefaultAxisHandle() {
            return {
                position: 0.5,
                absolutePosition: undefined,
                show: true,
                orientation: 'vertical',
                location: 'far',
                axisIndex: 0, // 0-based index
                radius: defaultThumbRadius,
                handleLabel: axisHandles.length.toString(),
                handleClassList: ['draggable'],
                fill: undefined,
                horizontalHandleConstrain: undefined,
                verticalHandleConstrain: undefined,
                // private properties below
                positionInPixel: undefined,
                selected: false,
                thumbmove: false,
                thumb: undefined
            };
        }

        function coerceOptions(options) {
            if (options.orientation !== 'vertical' && options.orientation !== 'horizontal') {
                console.log('orientation is invalid. it will be coerced to vertical');
                options.orientation = 'vertical';
            }
            const axes = options.orientation === 'vertical'
                ? plot.getYAxes()
                : plot.getXAxes();
            if (options.axisIndex < 0 || options.axisIndex > axes.length - 1) {
                console.log('axisIndex is invalid. it will be coerced to 0');
                options.axisIndex = 0;
            }
        }

        function reserveSpaceForThumbs(axisHandles, plot, offset) {
            const mayNeedSpaceHandles = axisHandles.filter(handle => handle.location === 'far');
            const offsetIncrement = {};
            const xAxes = plot.getXAxes();
            const yAxes = plot.getYAxes();
            mayNeedSpaceHandles.forEach((handle) => {
                if (isXAxisHandle(handle)) {
                    offsetIncrement[oppositePositions[xAxes[handle.axisIndex].options.position]] = 2 * handle.radius;
                } else {
                    offsetIncrement[oppositePositions[yAxes[handle.axisIndex].options.position]] = 2 * handle.radius;
                }
            });

            // prevent from reserving redundant space for example there are cursor thumbs on the same side.
            Object.keys(offsetIncrement).forEach((direction) => {
                offset[direction] += Math.max(0, offsetIncrement[direction] - offset[direction]);
            });
        }

        function getSelectedHandle(axisHandles) {
            const selectedHandles = axisHandles.filter(handle => handle.selected);
            return selectedHandles.length > 0 ? selectedHandles[0] : undefined;
        }

        function getVisibleHandles(axisHandles) {
            return axisHandles.filter(function (handle) {
                return handle.show;
            });
        }

        const thumbMoveBehavior = {
            start: function (e) {
                onThumbMoveStart(e);
            },

            drag: function(e) {
                onThumbMove(e);
            },

            end: function(e) {
                onThumbMoveEnd(e);
            }
        };

        const panState = {
            startX: undefined,
            startY: undefined,
            previousDelta: {
                x: 0,
                y: 0
            }
        };

        function isLeftMouseButtonPressedOrTouched(e) {
            return e.button === 0 || e.touches;
        }

        function pan(delta, handle) {
            const axis = findAxis(plot, handle);

            if (Number.isNaN(delta.x)) {
                delta.x = 0;
            }
            if (Number.isNaN(delta.y)) {
                delta.y = 0;
            }

            const axisOptions = axis.options;
            const deltaAtDirection = delta[axis.direction];
            const deltaAtAxis = panState.previousDelta[axis.direction] - delta[axis.direction];
            if (deltaAtDirection !== 0) {
                let navigationOffsetBelow = saturated.saturate(axis.c2p(axis.p2c(axis.min) - deltaAtAxis) - axis.c2p(axis.p2c(axis.min))),
                    navigationOffsetAbove = saturated.saturate(axis.c2p(axis.p2c(axis.max) - deltaAtAxis) - axis.c2p(axis.p2c(axis.max)));

                if (!isFinite(navigationOffsetBelow)) {
                    navigationOffsetBelow = 0;
                }

                if (!isFinite(navigationOffsetAbove)) {
                    navigationOffsetAbove = 0;
                }

                axisOptions.offset = {
                    below: saturated.saturate(navigationOffsetBelow + (axisOptions.offset.below || 0)),
                    above: saturated.saturate(navigationOffsetAbove + (axisOptions.offset.above || 0))
                };
            }

            panState.previousDelta = delta;
            plot.setupGrid(true);
            plot.draw();
            plot.getPlaceholder().trigger('axisHandlePan', [delta, axis, panState, handle]);
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

        function onThumbMoveStart(e) {
            if (!isLeftMouseButtonPressedOrTouched(e.detail)) {
                return;
            }

            [panState.startX, panState.startY] = getPlotXY(e.pageX, e.pageY);

            function extractTarget(touchedEl) {
                let target = touchedEl,
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

            const currentlySelectedHandle = getSelectedHandle(axisHandles);
            if (!currentlySelectedHandle) {
                const targetHandle = getVisibleHandles(axisHandles).find((handle) => {
                    return handle.thumb === extractTarget(e.detail.target);
                });
                targetHandle.selected = true;
                targetHandle.thumbmove = true;
                e.stopImmediatePropagation();
                e.preventDefault();
                plot.getPlaceholder().trigger('axisHandlePanStart', [targetHandle]);
            }
        }

        function onThumbMove(e) {
            if (requestAnimationFrameId) {
                return;
            }

            const handle = getSelectedHandle(axisHandles);
            // thumbmove and thumbmoveend events depend on the mousemove/touchmove and mouseup/touchend events on the svg root element
            // instead of the thumb element. This means when moving a thumb, it's possible that the plugin may handle this event but
            // actually no axis handle is moved.
            if (!handle) {
                return;
            }

            const [plotX, plotY] = getPlotXY(e.pageX, e.pageY);

            requestAnimationFrameId = window.requestAnimationFrame(() => {
                pan({
                    x: panState.startX - plotX,
                    y: panState.startY - plotY
                }, handle);
                requestAnimationFrameId = undefined;
            });

            // update the thumb's previous position in the map
            let position = handle.positionInPixel + (isXAxisHandle(handle) ? plot.getPlotOffset().left : plot.getPlotOffset().top);
            thumbPreviousPositionMap.set(e.selectedThumb, position);

            e.stopImmediatePropagation();
            e.preventDefault();
        }

        function onThumbMoveEnd(e) {
            if (requestAnimationFrameId) {
                window.cancelAnimationFrame(requestAnimationFrameId);
                requestAnimationFrameId = undefined;
            }

            const selectedHandle = getSelectedHandle(axisHandles);
            if (!selectedHandle) {
                return;
            }

            panState.previousDelta = { x: 0, y: 0 };
            selectedHandle.selected = false;
            selectedHandle.thumbmove = false;
            updateThumbsPosition(selectedHandle, plot.getPlotOffset());
            plot.triggerRedrawOverlay();
            e.stopImmediatePropagation();
            e.preventDefault();
            plot.getPlaceholder().trigger('axisHandlePanEnd', [selectedHandle]);
        }

        function createThumbs(handle, plot, plotOffset) {
            thumbSvgRoot = $.thumb.createSVGLayer(plot.getPlaceholder(), plot.getEventHolder());
            let thumb, thumbCx, thumbCy, constraintFunction,
                thumbOptions = {
                    size: handle.radius,
                    svgRoot: thumbSvgRoot,
                    abbreviation: handle.handleLabel,
                    classList: handle.handleClassList.slice(),
                    fill: handle.fill
                };

            if (isXAxisHandle(handle)) {
                thumbCx = handle.positionInPixel + plotOffset.left;
                thumbCy = handle.location === 'near'
                    ? plot.height() + plotOffset.top + handle.radius
                    : plotOffset.top - handle.radius;
                // axis handle uses the default constrain unless we provide one explicitly
                constraintFunction = handle.horizontalHandleConstrain ? handle.horizontalHandleConstrain : function (mouseX, mouseY, currentX, currentY) {
                    const offsetLeft = plot.offset().left,
                        x = Math.max(offsetLeft, Math.min(mouseX, plot.width() + offsetLeft));
                    return [x, currentY];
                };

                thumbOptions.shape = handle.location === 'near' ? 'bottom' : 'top';
                thumbOptions.x = thumbCx;
                thumbOptions.y = thumbCy;
                thumbOptions.constraintFunction = constraintFunction;

                thumb = $.thumb.createThumb(thumbOptions);
                thumbPreviousPositionMap.set(thumb, thumbCx);
            } else {
                thumbCx = handle.location === 'near'
                    ? plotOffset.left - handle.radius
                    : plotOffset.left + plot.width() + handle.radius;
                thumbCy = handle.positionInPixel + plotOffset.top;
                constraintFunction = handle.verticalHandleConstrain ? handle.verticalHandleConstrain : function (mouseX, mouseY, currentX, currentY) {
                    const offset = plot.offset(),
                        y = Math.max(offset.top, Math.min(mouseY, plot.height() + offset.top));
                    return [currentX, y];
                };

                thumbOptions.shape = handle.location === 'near' ? 'left' : 'right';
                thumbOptions.x = thumbCx;
                thumbOptions.y = thumbCy;
                thumbOptions.constraintFunction = constraintFunction;

                thumb = $.thumb.createThumb(thumbOptions);
                thumbPreviousPositionMap.set(thumb, thumbCy);
            }
            handle.thumb = thumb;
            dispatchThumbEvent('thumbCreated', { current: thumb });
        }

        function isPositionInXRange(position) {
            const integerPosition = Math.round(position);
            return integerPosition >= 0 && integerPosition <= plot.width();
        }

        function isPositionInYRange(position) {
            const integerPosition = Math.round(position);
            return integerPosition >= 0 && integerPosition <= plot.height();
        }

        function updateThumbsPosition(handle, plotOffset) {
            let thumb;
            if (isXAxisHandle(handle)) {
                thumb = handle.thumb;
                const currentX = handle.positionInPixel + plotOffset.left;
                const previousX = thumbPreviousPositionMap.get(thumb);
                const isTopThumb = isThumbAtTop(thumb);

                if (isPositionInXRange(handle.positionInPixel)) {
                    if (previousX < plotOffset.left) {
                        dispatchThumbIntoOutOfRangeEvent('thumbIntoRange',
                            {
                                target: thumb,
                                edge: isTopThumb ? 'topleft' : 'bottomleft',
                                orientation: 'horizontal',
                                position: currentX
                            },
                            plot.getEventHolder());
                    } else if (previousX > plotOffset.left + plot.width()) {
                        dispatchThumbIntoOutOfRangeEvent('thumbIntoRange',
                            {
                                target: thumb,
                                edge: isTopThumb ? 'topright' : 'bottomright',
                                orientation: 'horizontal',
                                position: currentX
                            },
                            plot.getEventHolder());
                    }

                    $.thumb.setHidden(thumb, false);
                    $.thumb.updateComputedXPosition(thumb, currentX);
                } else {
                    if (isPositionInXRange(previousX - plotOffset.left) && currentX < plotOffset.left) {
                        dispatchThumbIntoOutOfRangeEvent('thumbOutOfRange',
                            {
                                target: thumb,
                                edge: isTopThumb ? 'topleft' : 'bottomleft',
                                orientation: 'horizontal'
                            },
                            plot.getEventHolder());
                    } else if (isPositionInXRange(previousX - plotOffset.left) && currentX > plot.width() + plotOffset.left) {
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

                thumbPreviousPositionMap.set(thumb, currentX);
            } else {
                thumb = handle.thumb;
                const currentY = handle.positionInPixel + plotOffset.top;
                const previousY = thumbPreviousPositionMap.get(thumb);
                const isLeftThumb = isThumbAtLeft(thumb);
                if (isPositionInYRange(handle.positionInPixel)) {
                    if (previousY < plotOffset.top) {
                        dispatchThumbIntoOutOfRangeEvent('thumbIntoRange',
                            {
                                target: thumb,
                                edge: isLeftThumb ? 'topleft' : 'topright',
                                orientation: 'vertical',
                                position: currentY
                            },
                            plot.getEventHolder());
                    } else if (previousY > plotOffset.top + plot.height()) {
                        dispatchThumbIntoOutOfRangeEvent('thumbIntoRange',
                            {
                                target: thumb,
                                edge: isLeftThumb ? 'bottomleft' : 'bottomright',
                                orientation: 'vertical',
                                position: currentY
                            },
                            plot.getEventHolder());
                    }

                    $.thumb.setHidden(thumb, false);
                    $.thumb.updateComputedYPosition(thumb, currentY);
                } else {
                    if (isPositionInYRange(previousY - plotOffset.top)) {
                        if (currentY < plotOffset.top) {
                            dispatchThumbIntoOutOfRangeEvent('thumbOutOfRange',
                                {
                                    target: thumb,
                                    edge: isLeftThumb ? 'topleft' : 'topright',
                                    orientation: 'vertical'
                                },
                                plot.getEventHolder());
                        } else if (currentY > plot.height() + plotOffset.top) {
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

                thumbPreviousPositionMap.set(thumb, currentY);
            }
        }

        function updateThumbsLocation(handle, plot, width, height) {
            if (!handle.thumb) {
                return;
            }
            const plotOffset = plot.getPlotOffset();
            if (isXAxisHandle(handle)) {
                const thumbCy = handle.location === 'near'
                ? height - plotOffset.bottom + handle.radius
                : plotOffset.top - handle.radius;
                $.thumb.updateComputedYPosition(handle.thumb, thumbCy)
            } else {
                const thumbCx = handle.location === 'near'
                ? plotOffset.left - handle.radius
                : width - plotOffset.right + handle.radius;
                $.thumb.updateComputedXPosition(handle.thumb, thumbCx)
            }
        }

        function isThumbAtTop(thumb) {
            return thumb.shape === 'top';
        }

        function isThumbAtLeft(thumb) {
            return thumb.shape === 'left';
        }

        function dispatchThumbIntoOutOfRangeEvent(eventType, properties, eventHolder) {
            const event = new CustomEvent(eventType, { detail: properties });
            eventHolder.dispatchEvent(event);
        }

        function dispatchThumbEvent(name, properties) {
            const event = new CustomEvent(name, { detail: properties });
            plot.getPlaceholder()[0].dispatchEvent(event);
        }

        function isXAxisHandle(handle) {
            return handle.orientation === 'horizontal';
        }

        function setPosition(plot, handle) {
            const axis = findAxis(plot, handle);
            const length = isXAxisHandle(handle) ? plot.width() : plot.height();

            if (isFinite(handle.absolutePosition) && axis.p2c) {
                handle.positionInPixel = axis.p2c(handle.absolutePosition);
                handle.position = handle.positionInPixel / length;
                return;
            }

            handle.positionInPixel = handle.position !== undefined ? handle.position * length : undefined;

            if (!isFinite(handle.absolutePosition) && isFinite(handle.positionInPixel) && axis.c2p) {
                handle.absolutePosition = axis.c2p(handle.positionInPixel);
            }
        }

        function findAxis(plot, handle) {
            if (isXAxisHandle(handle)) {
                return plot.getXAxes()[handle.axisIndex];
            } else {
                return plot.getYAxes()[handle.axisIndex];
            }
        }

        function arrayDifference(array1, array2) {
            return array1.filter((e) => !array2.includes(e));
        }

        function processPublicProperties(source, destination) {
            const propertiesInOptions = Object.keys(source);
            const publicProperties = arrayDifference(propertiesInOptions, privateProperties);
            let recreateThumb = false;

            const hasNewAbsolutePosition = isFinite(source.absolutePosition);
            const oldAbsolutePositionStaled = isFinite(source.position) || source.orientation;
            if (!hasNewAbsolutePosition && oldAbsolutePositionStaled) {
                destination.absolutePosition = undefined;
            }

            publicProperties.forEach((property) => {
                if (!recreateThumb && propertiesThatRecreateThumb.includes(property) && destination[property] !== source[property]) {
                    recreateThumb = true;
                }
                if (property === 'show' && destination[property] !== source[property]) {
                    destination.triggerThumbVisibilityChanged = true;
                }
                destination[property] = source[property];
            });

            if (destination.thumb) {
                destination.thumb.classList.toggle('draggable', destination.handleClassList.includes('draggable'));
                if (recreateThumb) {
                    dispatchThumbEvent('thumbWillBeRemoved', { current: destination.thumb });
                    thumbPreviousPositionMap.delete(destination.thumb);
                    thumbSvgRoot.removeChild(destination.thumb);
                    destination.thumb = null;
                    // force redraw to make sure the plot offset is correct
                    plot.setupGrid();
                    plot.draw();
                } else {
                    const thumbLabel = destination.thumb.getElementsByClassName('thumbLabel')[0];
                    thumbLabel.textContent = destination.handleLabel;

                    const thumbIcon = destination.thumb.getElementsByClassName('thumbIcon')[0];
                    thumbIcon.style.fill = destination.fill;
                }
            }

            return destination;
        }

        function tryDispatchThumbVisibilityChangedEvent(axisHandle) {
            axisHandle.triggerThumbVisibilityChanged && dispatchThumbEvent('thumbVisibilityChanged', { current: axisHandle.thumb, visible: axisHandle.show });
        }

        // public methods
        plot.getAxisHandles = function () {
            return axisHandles;
        };

        plot.addAxisHandle = function addAxisHandle(options) {
            const axisHandle = processPublicProperties(options, createDefaultAxisHandle());
            coerceOptions(axisHandle);

            setPosition(plot, axisHandle);

            axisHandles.push(axisHandle);

            plot.triggerRedrawOverlay();
        };

        plot.removeAxisHandle = function removeAxisHandle(axisHandle) {
            const index = axisHandles.indexOf(axisHandle);

            if (index !== -1) {
                if (axisHandle.thumb) {
                    dispatchThumbEvent('thumbWillBeRemoved', { current: axisHandle.thumb });
                    thumbSvgRoot.removeChild(axisHandle.thumb);
                    thumbPreviousPositionMap.delete(axisHandle.thumb);
                    axisHandle.thumb = null;
                }
                axisHandles.splice(index, 1);
            }

            plot.triggerRedrawOverlay();
        };

        plot.setAxisHandle = function setAxisHandle(axisHandle, options) {
            const index = axisHandles.indexOf(axisHandle);

            if (index !== -1) {
                processPublicProperties(options, axisHandles[index]);
                coerceOptions(axisHandles[index]);
                setPosition(plot, axisHandles[index]);
                plot.triggerRedrawOverlay();
            }
        };

        plot.setAxisHandlePlotPositionConstrain = (constrain) => {
            if (typeof constrain !== 'function') {
                throw new Error('constrain should be a function');
            }

            plotPositionConstrain = constrain;
        };

        // plot hooks
        plot.hooks.processOptions.push(function (plot) {
            plot.getOptions().axisHandles.forEach(function (options) {
                plot.addAxisHandle(options);
            });
        });

        plot.hooks.processOffset.push(function (plot, offset) {
            reserveSpaceForThumbs(axisHandles, plot, offset);
        });

        plot.hooks.drawOverlay.push(function (plot, ctx) {
            const plotOffset = plot.getPlotOffset();

            axisHandles.forEach(function (handle) {
                setPosition(plot, handle);

                if (handle.show) {
                    if (!handle.thumb) {
                        createThumbs(handle, plot, plotOffset);
                    } else if (!handle.thumbmove) {
                        //the case where handle was moved not due to a thumb move
                        updateThumbsPosition(handle, plotOffset);
                        tryDispatchThumbVisibilityChangedEvent(handle);
                    }
                } else {
                    if (handle.thumb) {
                        $.thumb.setHidden(handle.thumb, true);
                        tryDispatchThumbVisibilityChangedEvent(handle);
                    }
                }
            });

            plot.getPlaceholder().trigger('axisHandleUpdates', [axisHandles]);
        });

        plot.hooks.resize.push(function (plot, width, height) {
            // the height and the width parameter from resize hook include margin offsets
            axisHandles.forEach(function (handle) {
                updateThumbsLocation(handle, plot, width, height)
            });
        });

        plot.hooks.bindEvents.push(function (plot, eventHolder) {
            eventHolder[0].addEventListener('thumbmovestart', thumbMoveBehavior.start, false);
            eventHolder[0].addEventListener('thumbmove', thumbMoveBehavior.drag, false);
            eventHolder[0].addEventListener('thumbmoveend', thumbMoveBehavior.end, false);
        });

        plot.hooks.shutdown.push(function (plot, eventHolder) {
            eventHolder[0].removeEventListener('thumbmovestart', thumbMoveBehavior.start);
            eventHolder[0].removeEventListener('thumbmove', thumbMoveBehavior.drag);
            eventHolder[0].removeEventListener('thumbmoveend', thumbMoveBehavior.end);

            thumbSvgRoot = undefined;
            axisHandles = [];
            thumbPreviousPositionMap.clear();

            const placeholder = plot.getPlaceholder();
            if (placeholder.find('.flot-thumbs')[0]) {
                $.thumb.shutdown(placeholder.find('.flot-thumbs')[0].firstChild);
            }
        });
    }

    $.plot.plugins.push({
        init: init,
        options: options,
        name: 'axis-handle',
        version: '2.0.3'
    });
})(jQuery);
