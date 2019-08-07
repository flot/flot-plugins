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
/* Flot plugin for adding the parking lot for the graph
*/

/*global jQuery*/

(function ($) {
    'use strict';
    class ObservableSet extends Set {
        constructor(...args) {
            super(...args);
            this.setChangedListeners = [];
        }

        add(value) {
            const sizeBefore = this.size;
            const self = super.add(value);
            const sizeAfter = this.size;
            if (sizeAfter !== sizeBefore) {
                this.onSetChanged('add');
            }
            return self;
        }

        delete(value) {
            const successful = super.delete(value);
            if (successful) {
                this.onSetChanged('remove');
            }
            return successful;
        }

        clear() {
            const sizeBefore = this.size;
            super.clear();
            if (sizeBefore > 0) {
                this.onSetChanged('reset');
            }
        }

        onSetChanged(action) {
            if (this.setChangedListeners === undefined) {
                return;
            }
            const clone = this.setChangedListeners.slice();
            clone.forEach((listener) => {
                listener(action);
            });
        }

        addSetChangedListener(listener) {
            if (typeof listener !== 'function') {
                throw new Error('listener is not a callable object');
            }
            this.setChangedListeners.push(listener);
        }

        removeSetChangedListener(listener) {
            const index = this.setChangedListeners.findIndex(listener);
            if (index !== -1) {
                this.setChangedListeners.splice(index, 1);
            }
        }

        static get [Symbol.species]() { return Set; }
    }

    const parkingLotLocations = Object.freeze({
        topLeft: 'topleft',
        topRight: 'topright',
        bottomLeft: 'bottomleft',
        bottomRight: 'bottomright'
    });

    class ParkingLot {
        constructor(plot, options) {
            this._offset = options.offset || 35;
            this._thumbRadius = options.thumbRadius || 17;
            this._show = options.show !== false;
            this._initialize(plot);
        }

        _initialize(plot) {
            this.thumbs = new Set();
            const invalidateDockerRender = (action) => {
                if (action === 'reset') {
                    return;
                }
                plot.triggerRedrawOverlay();
            };
            this.topLeftHorizontalDocker = new ObservableSet();
            this.topLeftHorizontalDocker.addSetChangedListener(invalidateDockerRender);
            this.topLeftVerticalDocker = new ObservableSet();
            this.topLeftVerticalDocker.addSetChangedListener(invalidateDockerRender);
            this.topRightHorizontalDocker = new ObservableSet();
            this.topRightHorizontalDocker.addSetChangedListener(invalidateDockerRender);
            this.topRightVerticalDocker = new ObservableSet();
            this.topRightVerticalDocker.addSetChangedListener(invalidateDockerRender);
            this.bottomRightHorizontalDocker = new ObservableSet();
            this.bottomRightHorizontalDocker.addSetChangedListener(invalidateDockerRender);
            this.bottomRightVerticalDocker = new ObservableSet();
            this.bottomRightVerticalDocker.addSetChangedListener(invalidateDockerRender);
            this.bottomLeftHorizontalDocker = new ObservableSet();
            this.bottomLeftHorizontalDocker.addSetChangedListener(invalidateDockerRender);
            this.bottomLeftVerticalDocker = new ObservableSet();
            this.bottomLeftVerticalDocker.addSetChangedListener(invalidateDockerRender);
            this._attachConstrains(plot);
            this._onThumbMoveStart = this._onThumbMoveStart.bind(this);
            this._onThumbCreated = this._onThumbCreated.bind(this, plot);
            this._onThumbWillBeRemoved = this._onThumbWillBeRemoved.bind(this, plot);
            this._onThumbVisibilityChanged = this._onThumbVisibilityChanged.bind(this, plot);
            this._onThumbIntoRange = this._onThumbIntoRange.bind(this, plot);
            this._onThumbOutOfRange = this._onThumbOutOfRange.bind(this);
        }

        dispose(plot) {
            this.topLeftHorizontalDocker.clear();
            this.bottomLeftHorizontalDocker.clear();
            this.topRightHorizontalDocker.clear();
            this.bottomRightHorizontalDocker.clear();
            this.topLeftVerticalDocker.clear();
            this.bottomLeftVerticalDocker.clear();
            this.topRightVerticalDocker.clear();
            this.bottomRightVerticalDocker.clear();
            this._unbindEvents(plot);
        }

        reserveSpace() {
            return [ 'left', 'right', 'bottom', 'top' ].reduce((accumulator, currentValue) => {
                accumulator[currentValue] = this._offset;
                return accumulator;
            }, {});
        }

        _createThumbConstrain(plot) {
            const horizontalThumbConstrain = (mouseX, mouseY, previousX, previousY, thumbX, thumbY) => {
                const thumb = this.thumbMoveState.selectedElement;
                const plotOffset = plot.getPlotOffset();
                let thumbPositioned = false;
                if (this.thumbMoveState.inParkingLot) {
                    const offset = plot.offset();
                    const thumbInGraph = thumbX >= offset.left && thumbX <= offset.left + plot.width();
                    if (thumbInGraph) {
                        $.thumb.setHidden(thumb, false);
                        const detail = { target: thumb, edge: this.thumbMoveState.parkingLotLocation, orientation: 'horizontal', position: thumbX - offset.left + plotOffset.left };
                        if (this.thumbMoveState.axisHandle) {
                            detail.axisHandle = this.thumbMoveState.axisHandle;
                        }
                        this._dispatchThumbEvent('thumbIntoRange', detail, plot.getEventHolder());
                        thumbPositioned = true;
                        this.thumbMoveState.inParkingLot = false;
                    }
                } else {
                    [this.thumbMoveState.inParkingLot, this.thumbMoveState.parkingLotLocation] = this._willHorizontalThumbBeMovedOffGraph(thumb, thumbX, plot);
                }

                return [mouseX, previousY, thumbPositioned];
            };
            const verticalThumbConstrain = (mouseX, mouseY, previousX, previousY, thumbX, thumbY) => {
                const thumb = this.thumbMoveState.selectedElement;
                const plotOffset = plot.getPlotOffset();
                let thumbPositioned = false;
                if (this.thumbMoveState.inParkingLot) {
                    const offset = plot.offset();
                    const thumbInGraph = thumbY >= offset.top && thumbY <= offset.top + plot.height();
                    if (thumbInGraph) {
                        $.thumb.setHidden(thumb, false);
                        const detail = { target: thumb, edge: this.thumbMoveState.parkingLotLocation, orientation: 'vertical', position: thumbY - offset.top + plotOffset.top };
                        if (this.thumbMoveState.axisHandle) {
                            detail.axisHandle = this.thumbMoveState.axisHandle;
                        }
                        this._dispatchThumbEvent('thumbIntoRange', detail, plot.getEventHolder());
                        thumbPositioned = true;
                        this.thumbMoveState.inParkingLot = false;
                    }
                } else {
                    [this.thumbMoveState.inParkingLot, this.thumbMoveState.parkingLotLocation] = this._willVerticalThumbBeMovedOffGraph(thumb, thumbY, plot);
                }

                return [previousX, mouseY, thumbPositioned];
            };
            return {
                horizontal: horizontalThumbConstrain,
                vertical: verticalThumbConstrain
            };
        }

        _createAxisHandleThumbConstrain(thumbConstrain, axisHandle) {
            const horizontal = (...args) => {
                this.thumbMoveState.axisHandle = axisHandle;
                return thumbConstrain.horizontal(...args);
            };
            const vertical = (...args) => {
                this.thumbMoveState.axisHandle = axisHandle;
                return thumbConstrain.vertical(...args);
            };
            return { horizontal, vertical };
        }

        _willVerticalThumbBeMovedOffGraph(thumb, mouseY, plot) {
            const offset = plot.offset();
            let outOfRange = false;
            let parkingLotLocation;
            if (mouseY < offset.top) {
                parkingLotLocation = thumb.shape === 'left' ? parkingLotLocations.topLeft : parkingLotLocations.topRight;
                outOfRange = true;
            } else if (mouseY > offset.top + plot.height()) {
                parkingLotLocation = thumb.shape === 'left' ? parkingLotLocations.bottomLeft : parkingLotLocations.bottomRight;
                outOfRange = true;
            }
            if (outOfRange) {
                $.thumb.setHidden(thumb, true);
                this._dispatchThumbEvent('thumbOutOfRange',
                    { target: thumb, edge: parkingLotLocation, orientation: 'vertical' },
                    plot.getEventHolder());
            }
            return [outOfRange, parkingLotLocation];
        }

        _willHorizontalThumbBeMovedOffGraph(thumb, mouseX, plot) {
            const offset = plot.offset();
            let outOfRange = false;
            let parkingLotLocation;
            if (mouseX < offset.left) {
                parkingLotLocation = thumb.shape === 'top' ? parkingLotLocations.topLeft : parkingLotLocations.bottomLeft;
                outOfRange = true;
            } else if (mouseX > offset.left + plot.width()) {
                parkingLotLocation = thumb.shape === 'top' ? parkingLotLocations.topRight : parkingLotLocations.bottomRight;
                outOfRange = true;
            }
            if (outOfRange) {
                $.thumb.setHidden(thumb, true);
                this._dispatchThumbEvent('thumbOutOfRange',
                    { target: thumb, edge: parkingLotLocation, orientation: 'horizontal' },
                    plot.getEventHolder());
            }
            return [outOfRange, parkingLotLocation];
        }

        _dispatchThumbEvent(eventType, eventProperties, eventHolder) {
            const event = new CustomEvent(eventType, { detail: eventProperties });
            eventHolder.dispatchEvent(event);
        }

        _createPlotValueConstrain(plot) {
            return (mouseX, mouseY) => {
                const offset = plot.offset();
                // expand 1 pixel at all directions
                return [
                    Math.max(-1, Math.min(mouseX - offset.left, plot.width() + 1)),
                    Math.max(-1, Math.min(mouseY - offset.top, plot.height() + 1))
                ];
            }
        }

        render(plot) {
            this._lazyInitializeForRender(plot);
            this._renderDockers(plot);
        }

        _lazyInitializeForRender(plot) {
            if (!this.svgRoot) {
                this.svgRoot = $.thumb.createSVGLayer(plot.getPlaceholder(), plot.getEventHolder());
                const orientationIndicatorSymbols =
                    `<defs xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                        <symbol id="left-arrow" viewBox="0 0 40 50">
                            <rect x="0" y="0" width="40" height="50"/>
                            <polyline points="20,10 10,25 20,40" fill="none"/>
                            <polyline points="10,25 30,25" fill="none"/>
                        </symbol>
                        <symbol id="up-arrow" viewBox="0 0 50 40">
                            <rect x="0" y="0" width="50" height="40" />
                            <polyline points="10,20 25,10 40,20" fill="none"/>
                            <polyline points="25,10 25,30" fill="none"/>
                        </symbol>
                        <symbol id="right-arrow" viewBox="0 0 40 50">
                            <use xlink:href="#left-arrow" x="0" y="0" width="40" height="50" transform="rotate(180,20,25)"/>
                        </symbol>
                        <symbol id="down-arrow" viewBox="0 0 50 40">
                            <use xlink:href="#up-arrow" x="0" y="0" width="50" height="40" transform="rotate(180,25,20)"/>
                        </symbol>
                     </defs>`;

                const doc = new DOMParser().parseFromString(orientationIndicatorSymbols, 'image/svg+xml');
                const svgDefs = document.importNode(doc.documentElement, true);
                this.svgRoot.appendChild(svgDefs);

                const setHrefAttribute = (svgElement, attributeValue) => {
                    // Set the 'href' attribute using both versions. This is required because in Safari the 'href'
                    // attribute is not supported, but 'xlink:href' is.
                    svgElement.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', attributeValue);
                    svgElement.setAttributeNS('http://www.w3.org/1999/xlink', 'href', attributeValue);
                };
                const indicatorMap = {
                    topLeft: {
                        horizontal: '#left-arrow',
                        vertical: '#up-arrow'
                    },
                    topRight: {
                        horizontal: '#right-arrow',
                        vertical: '#up-arrow'
                    },
                    bottomLeft: {
                        horizontal: '#left-arrow',
                        vertical: '#down-arrow'
                    },
                    bottomRight: {
                        horizontal: '#right-arrow',
                        vertical: '#down-arrow'
                    }
                };
                this._dockerIndicators = {};
                this._dockerBorders = {};
                Object.keys(parkingLotLocations).forEach((location) => {
                    this._dockerIndicators[location] = {};
                    this._dockerBorders[location] = {};
                    ['horizontal', 'vertical'].forEach((orientation) => {
                        const indicator = document.createElementNS('http://www.w3.org/2000/svg', 'use');
                        setHrefAttribute(indicator, indicatorMap[location][orientation]);
                        if (orientation === 'horizontal') {
                            indicator.setAttributeNS(null, 'height', `${this._thumbRadius * 2}`);
                            indicator.setAttributeNS(null, 'width', `${this._thumbRadius * 2 * 0.8}`);
                        } else {
                            indicator.setAttributeNS(null, 'width', `${this._thumbRadius * 2}`);
                            indicator.setAttributeNS(null, 'height', `${this._thumbRadius * 2 * 0.8}`);
                        }
                        indicator.setAttributeNS(null, 'x', '0');
                        indicator.setAttributeNS(null, 'y', '0');
                        indicator.setAttributeNS(null, 'display', 'none');
                        indicator.style.pointerEvents = 'none';
                        indicator.classList.add('parkingLot-dockerArrow');
                        this.svgRoot.appendChild(indicator);
                        this._dockerIndicators[location][orientation] = indicator;

                        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                        rect.setAttributeNS(null, 'display', 'none');
                        rect.style.pointerEvents = 'none';
                        rect.classList.add('parkingLot-docker');
                        this._dockerBorders[location][orientation] = rect;
                        this.svgRoot.appendChild(rect);
                    });
                });
            }
        }

        _renderDockers(plot) {
            this._renderTopLeftHorizontalDocker();
            this._renderTopLeftVerticalDocker();

            const plotOffset = plot.getPlotOffset();
            const thumbLayerWidth = plot.width() + plotOffset.left + plotOffset.right;
            const thumbLayerHeight = plot.height() + plotOffset.top + plotOffset.bottom;
            this._renderTopRightHorizontalDocker(thumbLayerWidth);
            this._renderTopRightVerticalDocker(thumbLayerWidth);

            this._renderBottomLeftHorizontalDocker(thumbLayerHeight);
            this._renderBottomLeftVerticalDocker(thumbLayerHeight);

            this._renderBottomRightHorizontalDocker(thumbLayerWidth, thumbLayerHeight);
            this._renderBottomRightVerticalDocker(thumbLayerWidth, thumbLayerHeight);
        }

        _renderBottomRightVerticalDocker(thumbLayerWidth, thumbLayerHeight) {
            if (this._show && this.bottomRightVerticalDocker.size > 0) {
                let index = 0;
                const isBottomRightEmpty = this.bottomRightHorizontalDocker.size === 0;
                const rightOffsetFromBottom = isBottomRightEmpty ? 0 : this._thumbRadius * 2;
                this.bottomRightVerticalDocker.forEach((thumb) => {
                    const matrix = `matrix(1 0 0 1 ${thumbLayerWidth - this._thumbRadius} ${thumbLayerHeight - (rightOffsetFromBottom + this._thumbRadius + (2 * this._thumbRadius) * index++)})`;
                    thumb.setAttribute('transform', matrix);
                    $.thumb.setHidden(thumb, false);
                });

                const height = this.bottomRightVerticalDocker.size * this._thumbRadius * 2;
                this._updateBorderAttributes(
                    this._dockerBorders.bottomRight.vertical,
                    thumbLayerWidth - this._thumbRadius * 2,
                    thumbLayerHeight - (height + rightOffsetFromBottom),
                    this._thumbRadius * 2,
                    height
                );
                this._updateArrowPosition(
                    this._dockerIndicators.bottomRight.vertical,
                    thumbLayerWidth - this._thumbRadius * 2,
                    thumbLayerHeight - (height + rightOffsetFromBottom + 2 * this._thumbRadius * 0.8)
                );
            } else {
                this._dockerBorders.bottomRight.vertical.setAttributeNS(null, 'display', 'none');
                this._dockerIndicators.bottomRight.vertical.setAttributeNS(null, 'display', 'none');
            }
        }

        _renderBottomRightHorizontalDocker(thumbLayerWidth, thumbLayerHeight) {
            if (this._show && this.bottomRightHorizontalDocker.size > 0) {
                let index = 0;
                this.bottomRightHorizontalDocker.forEach((thumb) => {
                    const matrix = `matrix(1 0 0 1 ${thumbLayerWidth - this._thumbRadius - (2 * this._thumbRadius) * index++} ${thumbLayerHeight - this._thumbRadius})`;
                    thumb.setAttribute('transform', matrix);
                    $.thumb.setHidden(thumb, false);
                });

                const width = this.bottomRightHorizontalDocker.size * this._thumbRadius * 2;
                this._updateBorderAttributes(
                    this._dockerBorders.bottomRight.horizontal,
                    thumbLayerWidth - width,
                    thumbLayerHeight - this._thumbRadius * 2,
                    width,
                    this._thumbRadius * 2
                );
                this._updateArrowPosition(
                    this._dockerIndicators.bottomRight.horizontal,
                    thumbLayerWidth - width - 2 * this._thumbRadius * 0.8,
                    thumbLayerHeight - 2 * this._thumbRadius
                );
            } else {
                this._dockerBorders.bottomRight.horizontal.setAttributeNS(null, 'display', 'none');
                this._dockerIndicators.bottomRight.horizontal.setAttributeNS(null, 'display', 'none');
            }
        }

        _renderBottomLeftVerticalDocker(thumbLayerHeight) {
            if (this._show && this.bottomLeftVerticalDocker.size > 0) {
                let index = 0;
                const isBottomLeftEmpty = this.bottomLeftHorizontalDocker.size === 0;
                const leftOffsetFromBottom = isBottomLeftEmpty ? 0 : this._thumbRadius * 2;
                this.bottomLeftVerticalDocker.forEach((thumb) => {
                    const matrix = `matrix(1 0 0 1 ${this._thumbRadius} ${thumbLayerHeight - (leftOffsetFromBottom + this._thumbRadius + (2 * this._thumbRadius) * index++)})`;
                    thumb.setAttribute('transform', matrix);
                    $.thumb.setHidden(thumb, false);
                });

                const height = this.bottomLeftVerticalDocker.size * this._thumbRadius * 2;
                this._updateBorderAttributes(
                    this._dockerBorders.bottomLeft.vertical,
                    0,
                    thumbLayerHeight - (height + leftOffsetFromBottom),
                    this._thumbRadius * 2,
                    height
                );
                this._updateArrowPosition(
                    this._dockerIndicators.bottomLeft.vertical,
                    0,
                    thumbLayerHeight - (height + leftOffsetFromBottom + 2 * this._thumbRadius * 0.8)
                );
            } else {
                this._dockerBorders.bottomLeft.vertical.setAttributeNS(null, 'display', 'none');
                this._dockerIndicators.bottomLeft.vertical.setAttributeNS(null, 'display', 'none');
            }
        }

        _renderBottomLeftHorizontalDocker(thumbLayerHeight) {
            if (this._show && this.bottomLeftHorizontalDocker.size > 0) {
                let index = 0;
                this.bottomLeftHorizontalDocker.forEach((thumb) => {
                    const matrix = `matrix(1 0 0 1 ${this._thumbRadius + (2 * this._thumbRadius) * index++} ${thumbLayerHeight - this._thumbRadius})`;
                    thumb.setAttribute('transform', matrix);
                    $.thumb.setHidden(thumb, false);
                });

                this._updateBorderAttributes(
                    this._dockerBorders.bottomLeft.horizontal,
                    0,
                    thumbLayerHeight - 2 * this._thumbRadius,
                    this.bottomLeftHorizontalDocker.size * this._thumbRadius * 2,
                    this._thumbRadius * 2
                );
                this._updateArrowPosition(
                    this._dockerIndicators.bottomLeft.horizontal,
                    this.bottomLeftHorizontalDocker.size * this._thumbRadius * 2,
                    thumbLayerHeight - 2 * this._thumbRadius
                );
            } else {
                this._dockerBorders.bottomLeft.horizontal.setAttributeNS(null, 'display', 'none');
                this._dockerIndicators.bottomLeft.horizontal.setAttributeNS(null, 'display', 'none');
            }
        }

        _renderTopRightVerticalDocker(thumbLayerWidth) {
            if (this._show && this.topRightVerticalDocker.size > 0) {
                let index = 0;
                const isTopRightEmpty = this.topRightHorizontalDocker.size === 0;
                const rightOffsetFromTop = isTopRightEmpty ? 0 : this._thumbRadius * 2;
                this.topRightVerticalDocker.forEach((thumb) => {
                    const matrix = `matrix(1 0 0 1 ${thumbLayerWidth - this._thumbRadius} ${rightOffsetFromTop + this._thumbRadius + (2 * this._thumbRadius) * index++})`;
                    thumb.setAttribute('transform', matrix);
                    $.thumb.setHidden(thumb, false);
                });

                this._updateBorderAttributes(
                    this._dockerBorders.topRight.vertical,
                    thumbLayerWidth - 2 * this._thumbRadius,
                    rightOffsetFromTop,
                    2 * this._thumbRadius,
                    this.topRightVerticalDocker.size * this._thumbRadius * 2
                );
                this._updateArrowPosition(
                    this._dockerIndicators.topRight.vertical,
                    thumbLayerWidth - 2 * this._thumbRadius,
                    rightOffsetFromTop + this.topRightVerticalDocker.size * this._thumbRadius * 2
                );
            } else {
                this._dockerBorders.topRight.vertical.setAttributeNS(null, 'display', 'none');
                this._dockerIndicators.topRight.vertical.setAttributeNS(null, 'display', 'none');
            }
        }

        _renderTopRightHorizontalDocker(thumbLayerWidth) {
            if (this._show && this.topRightHorizontalDocker.size > 0) {
                let index = 0;
                this.topRightHorizontalDocker.forEach((thumb) => {
                    const matrix = `matrix(1 0 0 1 ${thumbLayerWidth - this._thumbRadius - (2 * this._thumbRadius) * index++} ${this._thumbRadius})`;
                    thumb.setAttribute('transform', matrix);
                    $.thumb.setHidden(thumb, false);
                });

                const width = this.topRightHorizontalDocker.size * this._thumbRadius * 2;
                this._updateBorderAttributes(this._dockerBorders.topRight.horizontal, thumbLayerWidth - width, 0, width, 2 * this._thumbRadius);
                this._updateArrowPosition(
                    this._dockerIndicators.topRight.horizontal,
                    thumbLayerWidth - width - 2 * this._thumbRadius * 0.8,
                    0
                );
            } else {
                this._dockerBorders.topRight.horizontal.setAttributeNS(null, 'display', 'none');
                this._dockerIndicators.topRight.horizontal.setAttributeNS(null, 'display', 'none');
            }
        }

        _renderTopLeftVerticalDocker() {
            if (this._show && this.topLeftVerticalDocker.size > 0) {
                let index = 0;
                const isTopLeftHorizontalDockerEmpty = this.topLeftHorizontalDocker.size === 0;
                const leftOffsetFromTop = isTopLeftHorizontalDockerEmpty ? 0 : this._thumbRadius * 2;
                this.topLeftVerticalDocker.forEach((thumb) => {
                    const matrix = `matrix(1 0 0 1 ${this._thumbRadius} ${leftOffsetFromTop + this._thumbRadius + (2 * this._thumbRadius) * index++})`;
                    thumb.setAttribute('transform', matrix);
                    $.thumb.setHidden(thumb, false);
                });

                this._updateBorderAttributes(
                    this._dockerBorders.topLeft.vertical,
                    0,
                    leftOffsetFromTop,
                    2 * this._thumbRadius,
                    this.topLeftVerticalDocker.size * this._thumbRadius * 2
                );
                this._updateArrowPosition(
                    this._dockerIndicators.topLeft.vertical,
                    0,
                    this.topLeftVerticalDocker.size * this._thumbRadius * 2 + leftOffsetFromTop
                );
            } else {
                this._dockerBorders.topLeft.vertical.setAttributeNS(null, 'display', 'none');
                this._dockerIndicators.topLeft.vertical.setAttributeNS(null, 'display', 'none');
            }
        }

        _renderTopLeftHorizontalDocker() {
            if (this._show && this.topLeftHorizontalDocker.size > 0) {
                let index = 0;
                this.topLeftHorizontalDocker.forEach((thumb) => {
                    const matrix = `matrix(1 0 0 1 ${this._thumbRadius + (2 * this._thumbRadius) * index++} ${this._thumbRadius})`;
                    thumb.setAttribute('transform', matrix);
                    // by default we hide the thumb when it is out of the range
                    // we need to show it in the parking lot
                    $.thumb.setHidden(thumb, false);
                });

                this._updateBorderAttributes(
                    this._dockerBorders.topLeft.horizontal,
                    0,
                    0,
                    this.topLeftHorizontalDocker.size * this._thumbRadius * 2,
                    2 * this._thumbRadius
                );
                this._updateArrowPosition(
                    this._dockerIndicators.topLeft.horizontal,
                    this.topLeftHorizontalDocker.size * this._thumbRadius * 2,
                    0
                );
            } else {
                this._dockerBorders.topLeft.horizontal.setAttributeNS(null, 'display', 'none');
                this._dockerIndicators.topLeft.horizontal.setAttributeNS(null, 'display', 'none');
            }
        }

        _updateBorderAttributes(rect, x, y, width, height) {
            rect.setAttributeNS(null, 'x', x.toString());
            rect.setAttributeNS(null, 'y', y.toString());
            rect.setAttributeNS(null, 'width', width.toString());
            rect.setAttributeNS(null, 'height', height.toString());
            rect.setAttributeNS(null, 'display', 'inline');
        }

        _updateArrowPosition(arrow, left, top) {
            arrow.setAttributeNS(null, 'transform', `matrix(1 0 0 1 ${left} ${top})`);
            arrow.setAttributeNS(null, 'display', 'inline');
        }

        _attachConstrains(plot) {
            const plotPositionConstrain = this._createPlotValueConstrain(plot);
            const thumbConstrain = this._createThumbConstrain(plot);
            const plotOptions = plot.getOptions();
            if (plotOptions.cursors) {
                plot.setPlotPositionConstrain(plotPositionConstrain);
                plot.getCursors().forEach((cursor) => {
                    cursor.horizontalThumbConstrain = thumbConstrain.horizontal;
                    cursor.verticalThumbConstrain = thumbConstrain.vertical;
                });
            }
            if (plotOptions.axisHandles) {
                plot.setAxisHandlePlotPositionConstrain(plotPositionConstrain);
                plot.getAxisHandles().forEach((axisHandle) => {
                    const constrain = this._createAxisHandleThumbConstrain(thumbConstrain, axisHandle);
                    axisHandle.horizontalHandleConstrain = constrain.horizontal;
                    axisHandle.verticalHandleConstrain = constrain.vertical;
                });
            }
        }

        bindEvents(plot) {
            const eventHolder = plot.getEventHolder();
            eventHolder.addEventListener('thumbIntoRange', this._onThumbIntoRange, false);
            eventHolder.addEventListener('thumbOutOfRange', this._onThumbOutOfRange, false);
            const placeHolder = plot.getPlaceholder()[0];
            placeHolder.addEventListener('thumbCreated', this._onThumbCreated, false);
            placeHolder.addEventListener('thumbWillBeRemoved', this._onThumbWillBeRemoved, false);
            placeHolder.addEventListener('thumbVisibilityChanged', this._onThumbVisibilityChanged, false);
        }

        _onThumbCreated(plot, event) {
            const thumb = event.detail.current;
            thumb.addEventListener('mousedown', this._onThumbMoveStart, false);
            thumb.addEventListener('touchstart', this._onThumbMoveStart, false);
            this.thumbs.add(thumb);
            this._addThumbIfWithinParkingLot(thumb, plot);
        }

        _onThumbWillBeRemoved(plot, event) {
            const thumb = event.detail.current;
            thumb.removeEventListener('mousedown', this._onThumbMoveStart);
            thumb.removeEventListener('touchstart', this._onThumbMoveStart);
            this.thumbs.delete(thumb);
            this._removeThumbIfOutsideParkingLot(thumb, plot);
        }

        _onThumbVisibilityChanged(plot, event) {
            const thumb = event.detail.current;
            if (event.detail.visible) {
                this._addThumbIfWithinParkingLot(thumb, plot);
            } else {
                this._removeThumbIfOutsideParkingLot(thumb, plot);
            }
        }

        _removeThumbIfOutsideParkingLot(thumb, plot) {
            const [x, y] = this._getThumbXYCoordinates(thumb);
            const plotOffset = plot.getPlotOffset();
            switch (thumb.shape) {
                case 'top':
                    if (y < plotOffset.top - 2 * this._thumbRadius) {
                        this.topLeftHorizontalDocker.delete(thumb);
                        this.topRightHorizontalDocker.delete(thumb);
                    }
                    break;
                case 'bottom':
                    if (y > plotOffset.top + plot.height() + 2 * this._thumbRadius) {
                        this.bottomLeftHorizontalDocker.delete(thumb);
                        this.bottomRightHorizontalDocker.delete(thumb);
                    }
                    break;
                case 'left':
                    if (x < plotOffset.left - 2 * this._thumbRadius) {
                        this.topLeftVerticalDocker.delete(thumb);
                        this.bottomLeftVerticalDocker.delete(thumb);
                    }
                    break;
                case 'right':
                    if (x > plotOffset.left + plot.width() + 2 * this._thumbRadius) {
                        this.topRightVerticalDocker.delete(thumb);
                        this.bottomRightVerticalDocker.delete(thumb);
                    }
                    break;
            }
        }

        _addThumbIfWithinParkingLot(thumb, plot) {
            const [x, y] = this._getThumbXYCoordinates(thumb);
            const plotOffset = plot.getPlotOffset();
            switch (thumb.shape) {
                case 'top':
                    if (x < plotOffset.left) {
                        this.topLeftHorizontalDocker.add(thumb);
                    } else if (x > plotOffset.left + plot.width()) {
                        this.topRightHorizontalDocker.add(thumb);
                    }
                    break;
                case 'bottom':
                    if (x < plotOffset.left) {
                        this.bottomLeftHorizontalDocker.add(thumb);
                    } else if (x > plotOffset.left + plot.width()) {
                        this.bottomRightHorizontalDocker.add(thumb);
                    }
                    break;
                case 'left':
                    if (y < plotOffset.top) {
                        this.topLeftVerticalDocker.add(thumb);
                    } else if (y > plotOffset.top + plot.height()) {
                        this.bottomLeftVerticalDocker.add(thumb);
                    }
                    break;
                case 'right':
                    if (y < plotOffset.top) {
                        this.topRightVerticalDocker.add(thumb);
                    } else if (y > plotOffset.top + plot.height()) {
                        this.bottomRightVerticalDocker.add(thumb);
                    }
                    break;
            }
        }

        _onThumbOutOfRange(event) {
            // for the case where the thumb is off the graph we only need to add it to the docker
            // the parking lot's render method will position thumbs
            const orientation = event.detail.orientation;
            const edge = event.detail.edge;
            const thumb = event.detail.target;
            switch (edge) {
                case parkingLotLocations.topLeft:
                    if (orientation === 'horizontal') {
                        this.topLeftHorizontalDocker.add(thumb);
                    } else {
                        this.topLeftVerticalDocker.add(thumb);
                    }
                    break;
                case parkingLotLocations.topRight:
                    if (orientation === 'horizontal') {
                        this.topRightHorizontalDocker.add(thumb);
                    } else {
                        this.topRightVerticalDocker.add(thumb);
                    }
                    break;
                case parkingLotLocations.bottomLeft:
                    if (orientation === 'horizontal') {
                        this.bottomLeftHorizontalDocker.add(thumb);
                    } else {
                        this.bottomLeftVerticalDocker.add(thumb);
                    }
                    break;
                case parkingLotLocations.bottomRight:
                    if (orientation === 'horizontal') {
                        this.bottomRightHorizontalDocker.add(thumb);
                    } else {
                        this.bottomRightVerticalDocker.add(thumb);
                    }
                    break;
            }
        }

        _onThumbIntoRange(plot, event) {
            // for the case where thumb goes into the graph, not only we need to delete the thumb from the docker
            // but also we need to update thumb's position
            const orientation = event.detail.orientation;
            const edge = event.detail.edge;
            const thumb = event.detail.target;
            const position = event.detail.position;
            const plotOffset = plot.getPlotOffset();
            switch (edge) {
                case parkingLotLocations.topLeft:
                    if (orientation === 'horizontal') {
                        this.topLeftHorizontalDocker.delete(thumb);
                        ParkingLot._updateThumbPosition(thumb, position, plotOffset.top - this._thumbRadius);
                    } else {
                        this.topLeftVerticalDocker.delete(thumb);
                        ParkingLot._updateThumbPosition(thumb, plotOffset.left - this._thumbRadius, position);
                    }
                    break;
                case parkingLotLocations.topRight:
                    if (orientation === 'horizontal') {
                        this.topRightHorizontalDocker.delete(thumb);
                        ParkingLot._updateThumbPosition(thumb, position, plotOffset.top - this._thumbRadius);
                    } else {
                        this.topRightVerticalDocker.delete(thumb);
                        ParkingLot._updateThumbPosition(thumb, plotOffset.left + plot.width() + this._thumbRadius, position);
                    }
                    break;
                case parkingLotLocations.bottomLeft:
                    if (orientation === 'horizontal') {
                        this.bottomLeftHorizontalDocker.delete(thumb);
                        ParkingLot._updateThumbPosition(thumb, position, plotOffset.top + plot.height() + this._thumbRadius);
                    } else {
                        this.bottomLeftVerticalDocker.delete(thumb);
                        ParkingLot._updateThumbPosition(thumb, plotOffset.left - this._thumbRadius, position);
                    }
                    break;
                case parkingLotLocations.bottomRight:
                    if (orientation === 'horizontal') {
                        this.bottomRightHorizontalDocker.delete(thumb);
                        ParkingLot._updateThumbPosition(thumb, position, plotOffset.top + plot.height() + this._thumbRadius);
                    } else {
                        this.bottomRightVerticalDocker.delete(thumb);
                        ParkingLot._updateThumbPosition(thumb, plotOffset.left + plot.width() + this._thumbRadius, position);
                    }
                    break;
            }

            if (event.detail.axisHandle) {
                const axisHandle = event.detail.axisHandle;
                const axis = axisHandle.orientation === 'horizontal'
                    ? plot.getXAxes()[axisHandle.axisIndex]
                    : plot.getYAxes()[axisHandle.axisIndex];
                if (axisHandle.absolutePosition >= axis.min && axisHandle.absolutePosition <= axis.max) {
                    return;
                }
                // We need to adjust the axis's offset to make the handle in the range.
                const canvasCoords = position - (axisHandle.orientation === 'horizontal' ? plotOffset.left : plotOffset.top);
                const axisCoords = axis.c2p(canvasCoords);
                const delta = axisHandle.absolutePosition - axisCoords;
                const oldOffset = axis.options.offset;
                axis.options.offset = {
                    below: oldOffset.below + delta,
                    above: oldOffset.above + delta
                };
                plot.setupGrid(true);
                plot.draw();
            }
        }

        _onThumbMoveStart(event) {
            this.thumbMoveState = null;
            const thumb = ParkingLot._getThumb(event.target);
            if (thumb.classList.contains('draggable')) {
                let inParkingLot = false;
                let location;
                if (thumb.classList.contains('top')) {
                    if (this.topLeftHorizontalDocker.has(thumb)) {
                        inParkingLot = true;
                        location = 'topleft';
                    } else if (this.topRightHorizontalDocker.has(thumb)) {
                        inParkingLot = true;
                        location = 'topright';
                    }
                } else if (thumb.classList.contains('bottom')) {
                    if (this.bottomLeftHorizontalDocker.has(thumb)) {
                        inParkingLot = true;
                        location = 'bottomleft';
                    } else if (this.bottomRightHorizontalDocker.has(thumb)) {
                        inParkingLot = true;
                        location = 'bottomright';
                    }
                } else if (thumb.classList.contains('left')) {
                    if (this.bottomLeftVerticalDocker.has(thumb)) {
                        inParkingLot = true;
                        location = 'bottomleft';
                    } else if (this.topLeftVerticalDocker.has(thumb)) {
                        inParkingLot = true;
                        location = 'topleft';
                    }
                } else if (thumb.classList.contains('right')) {
                    if (this.bottomRightVerticalDocker.has(thumb)) {
                        inParkingLot = true;
                        location = 'bottomright';
                    } else if (this.topRightVerticalDocker.has(thumb)) {
                        inParkingLot = true;
                        location = 'topright';
                    }
                }
                this.thumbMoveState = {
                    selectedElement: thumb,
                    inParkingLot: inParkingLot,
                    parkingLotLocation: location
                };
            }
        }

        _unbindEvents(plot) {
            plot.getEventHolder().removeEventListener('thumbIntoRange', this._onThumbIntoRange);
            plot.getEventHolder().removeEventListener('thumbOutOfRange', this._onThumbOutOfRange);
            const placeHolder = plot.getPlaceholder()[0];
            placeHolder.removeEventListener('thumbCreated', this._onThumbCreated);
            placeHolder.removeEventListener('thumbWillBeRemoved', this._onThumbWillBeRemoved);
            placeHolder.removeEventListener('thumbVisibilityChanged', this._onThumbVisibilityChanged);
            this.thumbs.forEach((thumb) => {
                thumb.removeEventListener('mousedown', this._onThumbMoveStart);
                thumb.removeEventListener('touchstart', this._onThumbMoveStart);
            });
            this.thumbs.clear();
        }

        _getThumbXYCoordinates(thumb) {
            const matrix = thumb.getCTM();
            return [matrix.e, matrix.f];
        }

        static _updateThumbPosition(thumb, x, y) {
            const thumbPositionMatrix = thumb.getCTM();

            const matrix = `matrix(${thumbPositionMatrix.a} ${thumbPositionMatrix.b} ${thumbPositionMatrix.c} ${thumbPositionMatrix.d} ${x} ${y})`;
            thumb.setAttribute('transform', matrix);
        };

        static _getThumb(node) {
            let current = node;
            while (!current.classList.contains('thumb')) {
                current = current.parentNode;
            }
            return current;
        }
    }

    function init(plot) {
        let parkingLot;

        // plot hooks
        plot.hooks.processOptions.push(function (plot) {
            plot.getOptions().parkingLot && (parkingLot = new ParkingLot(plot, { offset: plot.getOptions().parkingLot.offset, show: plot.getOptions().parkingLot.show }));
        });

        plot.hooks.processOffset.push(function (plot, offset) {
            if (!parkingLot || !parkingLot._show) {
                return;
            }
            const offsetIncrement = parkingLot.reserveSpace();
            Object.keys(offset).forEach((key) => {
                offset[key] += offsetIncrement[key];
            });
        });

        plot.hooks.drawOverlay.push(function (plot, ctx) {
            parkingLot && parkingLot.render(plot);
        });

        plot.hooks.bindEvents.push(function (plot, eventHolder) {
            parkingLot && parkingLot.bindEvents(plot);
        });

        plot.hooks.shutdown.push(function (plot, eventHolder) {
            parkingLot && parkingLot.dispose(plot);
        });

        plot.getParkingLot = () => {
            return parkingLot;
        };
    }

    $.plot.plugins.push({
        init: init,
        name: 'parkingLot',
        version: '1.1.1'
    });
})(jQuery);
