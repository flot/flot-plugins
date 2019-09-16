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

(function ($) {
    'use strict';

    const SIGNAL_HEIGHT = 0.8;
    const SIGNAL_OFFSET = 1;
    const BUS_CROSS_DISTANCE = 0.1;
    const BUS_LABEL_ELLIPSIS = '...';
    const COLOR_GREEN = '#4da74d';
    const COLOR_BLUE = '#3b7fed';
    const COLOR_RED = '#cb4b4b';
    const COLOR_YELLOW = '#edc240';

    class DigitalShapesRenderer {
        drawStep(ctx, x1, x2, y, lastY, color) {
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.moveTo(x1, lastY === null ? y : lastY);
            if (lastY !== null && y !== lastY) {
                ctx.lineTo(x1, y);
            }
            ctx.lineTo(x2, y);
            ctx.stroke();
        }

        drawRect(ctx, x1, x2, y1, y2, color, filled, closeLeft, closeRight) {
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y1);
            if (closeRight) {
                ctx.lineTo(x2, y2);
            } else {
                ctx.moveTo(x2, y2);
            }
            ctx.lineTo(x1, y2);
            if (closeLeft) {
                ctx.lineTo(x1, y1);
            }
            ctx.stroke();

            if (filled) {
                ctx.fillStyle = $.color.parse(color).add('a', -0.6);
                ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
            }
        }

        drawRectCrossX(ctx, x1, x2, x11, x21, y1, y2, color, startX, endX) {
            const drawSegment = (ctx, x1, x2, x11, x21, y1, y2, startX, endX) => {
                if (startX) {
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x11, y2);
                } else {
                    ctx.moveTo(x1, y2);
                }
                if (endX) {
                    ctx.lineTo(x21, y2);
                    ctx.lineTo(x2, y1);
                } else {
                    ctx.lineTo(x2, y2);
                }
            }

            ctx.beginPath();
            ctx.strokeStyle = color;
            drawSegment(ctx, x1, x2, x11, x21, (y1 + y2) / 2, y1, startX, endX);
            drawSegment(ctx, x1, x2, x11, x21, (y1 + y2) / 2, y2, startX, endX);
            ctx.stroke();
        }
    }

    class DigitalSample {
        constructor(x, state, strength) {
            this._x = x;
            this._state = state;
            this._strength = strength;
        }

        get x() {
            return this._x;
        }

        get state() {
            return this._state;
        }

        get strength() {
            return this._strength;
        }

        equals(other) {
            return this.state === other.state && this.strength === other.strength;
        }

        static fromDatapoints(datapoints, i) {
            return new DigitalSample(datapoints.points[i], datapoints.points[i + 1], datapoints.points[i + 2]);
        }
    }

    class DigitalWaveform {
        static get defaultOptions() {
            return {
                buses: [],
                series: {
                    digitalWaveform: {
                        show: false,
                        lineWidth: 1,
                        signal: {
                            show: true,
                            bus: 0,
                            states: [
                                { value: 0, shape: 'step_down' },
                                { value: 1, shape: 'step_up' },
                                { value: 255, shape: 'rect_filled', color: COLOR_RED },
                                { value: 254, shape: 'step_center', color: COLOR_RED }
                            ],
                            strengths: [
                                { value: 0, color: COLOR_GREEN },
                                { value: 1, color: COLOR_BLUE },
                                { value: 2, color: COLOR_RED }
                            ]
                        }
                    }
                }
            }
        }

        static get defaultBusOptions() {
            return {
                value: DigitalWaveform.defaultLookupBusValue,
                shape: DigitalWaveform.defaultLookupBusShape,
                color: DigitalWaveform.defaultLookupBusColor,
                collapsed: false,
                bitNumbering: 'lsb',
                showLabels: true,
                labelPosition: 'center',
                labelFormatter: 'binary'
            }
        }

        static get defaultLookupBusValue() {
            return (samples) => {
                let states = samples.map(sample => sample.state);
                let invalidState = states.find(state => state !== 0 && state !== 1);
                if (invalidState) {
                    switch (invalidState) {
                        case 255:
                            return 'X';
                        case 254:
                            return 'Z';
                        default:
                            return null;
                    }
                } else {
                    return states.join('');
                }
            }
        }

        static get defaultLookupBusShape() {
            return (samples) => {
                let states = samples.map(sample => sample.state);
                let invalidState = states.some(state => state !== 0 && state !== 1);
                return invalidState ? 'rect' : 'rect_cross_x';
            }
        }

        static get defaultLookupBusColor() {
            return (samples) => {
                let states = samples.map(sample => sample.state);
                let invalidState = states.some(state => state !== 0 && state !== 1);
                if (invalidState) {
                    return COLOR_RED;
                } else {
                    let allDriving = samples.every(sample => sample.strength === 0);
                    return allDriving ? COLOR_GREEN : COLOR_YELLOW;
                }
            }
        }

        get renderer() {
            if (!this._renderer) {
                this._renderer = new DigitalShapesRenderer();
            }
            return this._renderer;
        }

        constructor(plot, options) {
            this._initialize(options);
            this._processOptions(options);
            this._createHooks(plot);
            this._createPlotApi(plot);
        }

        _initialize(options) {
            this._states = new Map();
            options.series.digitalWaveform.signal.states.forEach(state => {
                this._states.set(state.value, {
                    shape: state.shape,
                    color: state.color
                });
            });

            this._strengths = new Map();
            options.series.digitalWaveform.signal.strengths.forEach(strength => {
                this._strengths.set(strength.value, {
                    color: strength.color
                });
            });
        }

        _processOptions(options) {
            options.buses = options.buses.map(bus => Object.assign(DigitalWaveform.defaultBusOptions, bus));
        }

        _createHooks(plot) {
            plot.hooks.processRawData.push((plot, series, data, datapoints) => {
                this._processRawData(plot, series, data, datapoints);
            });
            plot.hooks.adjustSeriesDataRange.push((plot, series, range) => {
                this._adjustSeriesDataRange(plot, series, range);
            });
            plot.hooks.setRange.push((plot, axis) => {
                this._setRange(plot, axis)
            });
            plot.hooks.draw.push((plot, ctx) => {
                this._draw(plot, ctx)
            });
        }

        _createPlotApi(plot) {
            let me = this;

            plot.expandBus = function(bus) {
                me._expandCollapseBus(this, bus, true);
            }

            plot.collapseBus = function(bus) {
                me._expandCollapseBus(this, bus, false);
            }
        }

        _expandCollapseBus(plot, bus, expand) {
            bus.collapsed = !expand;
            this._initializeSignalAndBusPositions(plot);
        }

        _processRawData(plot, series, data, datapoints) {
            if (series.digitalWaveform.show) {
                // data may have changed so we need to recalculate signal and bus values
                this._initializeSignalsAndBuses = true;
                datapoints.points = [];
                // convert data to format with 3 points
                // 1. x value, 2. state, 3. strength
                let start = series.start || 0;
                let step = series.step || 1;
                for (let i = 0, j = 0; i < data.length; i++, j = 0) {
                    if (series.flatdata) {
                        datapoints.points.push(start + (i * step));
                    } else {
                        datapoints.points.push(data[i][j++]);
                    }

                    if (Array.isArray(data[i])) {
                        datapoints.points.push(data[i][j++]);
                        datapoints.points.push(data[i][j] ? data[i][j] : 0);
                    } else {
                        datapoints.points.push(data[i], 0);
                    }
                }

                datapoints.pointsize = 3;
            }
        }

        _lazyInitialize(plot) {
            if (this._initializeSignalsAndBuses) {
                this._busTransitionWidth = Number.POSITIVE_INFINITY;
                plot.getOptions().buses.forEach(bus => {
                    this._initializeBusValues(plot, bus);
                });
                this._initializeSignalAndBusPositions(plot);

                this._initializeSignalsAndBuses = false;
            }
        }

        _initializeBusValues(plot, bus) {
            let signals = this._getBusSignals(plot, bus);
            bus.visible = signals.length > 0;
            if (bus.visible) {
                bus.samples = this._getBusSamples(signals);
                bus.values = bus.samples.map(samples => bus.value(samples.samples));
                bus.shapes = bus.samples.map(samples => bus.shape(samples.samples));
                bus.colors = bus.samples.map(samples => bus.color(samples.samples));
            }
        }

        _getBusSignals(plot, bus) {
            let index = plot.getOptions().buses.indexOf(bus);
            let signals = plot.getData().filter(series => series.digitalWaveform.signal.bus === index);
            switch (bus.bitNumbering) {
                case 'lsb':
                    signals = signals.reverse();
                    break;
                case 'msb':
                    // nothing to do because signals are already in most significant bit first order
                    break;
            }
            return signals;
        }

        _getBusSamples(signals) {
            let samples = signals.map(signal => {
                let signalSamples = [];
                for (let i = 0; i < signal.datapoints.points.length; i += signal.datapoints.pointsize) {
                    signalSamples.push(DigitalSample.fromDatapoints(signal.datapoints, i));
                }
                return signalSamples;
            }).filter(samples => samples.length > 0);

            let busSamples = [];
            if (samples.length > 0) {
                const startX = Math.max(...samples.map(s => s[0].x));
                const endX = Math.max(...samples.map(s => s[s.length - 1].x));
                // contains indexes of samples for the current x
                const indexes = samples.map(() => 0);
                let x = startX;
                while (x <= endX) {
                    busSamples.push({
                        x: x,
                        samples: samples.map((s, i) => s[indexes[i]])
                    });
                    // search next greater x
                    let prevx = x;
                    x = indexes.reduce((acc, index, i) => {
                        const nextSample = samples[i][index + 1];
                        if (nextSample !== undefined && nextSample.x < acc) {
                            acc = nextSample.x;
                        }
                        return acc;
                    }, Number.POSITIVE_INFINITY);
                    this._busTransitionWidth = Math.min(this._busTransitionWidth, (x - prevx) * BUS_CROSS_DISTANCE);
                    // increment indexes where next x is still smaller than x
                    indexes.forEach((index, i) => {
                        const nextSample = samples[i][index + 1];
                        if (nextSample !== undefined && nextSample.x <= x) {
                            indexes[i]++;
                        }
                    });
                }
            }

            return busSamples;
        }

        _initializeSignalAndBusPositions(plot) {
            this._setSignalsVisibility(plot);
            this._initializeBusPositions(plot);
            plot.getData().forEach(series => {
                if (series.digitalWaveform.signal.visible) {
                    this._initializeSignalPosition(plot, series);
                }
            });
        }

        _setSignalsVisibility(plot) {
            let buses = plot.getOptions().buses;
            plot.getData().forEach(series => {
                let bus = buses[series.digitalWaveform.signal.bus];
                series.digitalWaveform.signal.visible = series.digitalWaveform.signal.show && (bus ? !bus.collapsed : true);
            });
        }

        _initializeBusPositions(plot) {
            let data = plot.getData();
            let nonVisibleData = data.filter(series => !series.digitalWaveform.signal.visible);
            let buses = plot.getOptions().buses.filter(bus => bus.visible);
            buses.forEach(bus => {
                let signals = this._getBusSignals(plot, bus);
                let signalIndexes = signals.map(series => data.indexOf(series));
                let maxSignalIndex = Math.max(...signalIndexes);
                bus.index = maxSignalIndex + 1;
            });
            buses.sort((a, b) => a.index - b.index);
            buses.forEach((bus, index) => {
                let originalIndex = bus.index;
                let indexWithoutNonVisibleData = originalIndex - nonVisibleData.filter(series => data.indexOf(series) < originalIndex).length;
                let indexWithPreviousBuses = indexWithoutNonVisibleData + index;
                bus.index = indexWithoutNonVisibleData;
                bus.top = this._calculateTopBoundary(indexWithPreviousBuses);
                bus.bottom = this._calculateBottomBoundary(indexWithPreviousBuses);
            });
        }

        _initializeSignalPosition(plot, series) {
            let data = plot.getData();
            let buses = plot.getOptions().buses;
            let nonVisibleData = data.filter(series => !series.digitalWaveform.signal.visible);
            let originalIndex = data.indexOf(series);
            let indexWithoutNonVisibleData = originalIndex - nonVisibleData.filter(series => data.indexOf(series) < originalIndex).length;
            let indexWithPreviousBuses = indexWithoutNonVisibleData + buses.filter((bus) => bus.index <= indexWithoutNonVisibleData).length;
            series.digitalWaveform.signal.top = this._calculateTopBoundary(indexWithPreviousBuses);
            series.digitalWaveform.signal.bottom = this._calculateBottomBoundary(indexWithPreviousBuses);
        }

        _adjustSeriesDataRange(plot, series, range) {
            this._lazyInitialize(plot);
            if (series.digitalWaveform.show) {
                if (series.data.length > 1) {
                    let points = series.datapoints.points;
                    let ps = series.datapoints.pointsize;
                    let lastStep = points[points.length - ps] - points[points.length - 2 * ps];
                    range.xmax += lastStep;
                }
            }
        }

        _setRange(plot, axis) {
            this._lazyInitialize(plot);
            switch (axis.direction) {
                case 'y':
                    let signals = plot.getData().filter(series => series.digitalWaveform.signal.visible);
                    let buses = plot.getOptions().buses.filter(bus => bus.visible);
                    let boundaries = signals.map(series => series.digitalWaveform.signal.bottom)
                        .concat(signals.map(series => series.digitalWaveform.signal.top))
                        .concat(buses.map(bus => bus.bottom))
                        .concat(buses.map(bus => bus.top));
                    axis.datamin = Math.min(...boundaries);
                    axis.datamax = Math.max(...boundaries);
                    break;
            }
        }

        _draw(plot, ctx) {
            this._lazyInitialize(plot);
            const options = plot.getOptions();
            const plotOffset = plot.getPlotOffset();
            ctx.save();
            ctx.translate(plotOffset.left, plotOffset.top);
            ctx.lineWidth = options.series.digitalWaveform.lineWidth;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            this._drawSignals(plot, ctx);
            this._drawBuses(plot, ctx);
            ctx.restore();
        }

        _drawSignals(plot, ctx) {
            plot.getData().forEach(series => {
                if (series.digitalWaveform.signal.visible) {
                    this._drawSignal(ctx, series);
                }
            });
        }

        _drawSignal(ctx, series) {
            const y1 = series.digitalWaveform.signal.top;
            const y2 = series.digitalWaveform.signal.bottom;
            if (y1 < series.yaxis.min || y2 > series.yaxis.max) {
                return;
            }

            ctx.save();
            this._clipCanvasToAxes(ctx, series.xaxis, series.yaxis);
            const y1c = series.yaxis.p2c(y1);
            const y2c = series.yaxis.p2c(y2);
            for (let i = 0, lastY = null; i < series.datapoints.points.length; i += series.datapoints.pointsize) {
                const x1 = series.datapoints.points[i];
                const x2 = i + series.datapoints.pointsize < series.datapoints.points.length
                    ? series.datapoints.points[i + series.datapoints.pointsize]
                    : series.datapoints.points[i] + series.datapoints.points[i] - series.datapoints.points[i - series.datapoints.pointsize];
                if (x1 > series.xaxis.max || x2 < series.xaxis.min) {
                    continue;
                }

                const sample = DigitalSample.fromDatapoints(series.datapoints, i);
                const shape = this._lookupStateShape(sample);
                const color = this._lookupStateColor(sample);
                if (shape && color) {
                    const x1c = series.xaxis.p2c(x1);
                    const x2c = series.xaxis.p2c(x2);
                    const lastSample = DigitalSample.fromDatapoints(series.datapoints, i - series.datapoints.pointsize);
                    const nextSample = DigitalSample.fromDatapoints(series.datapoints, i + series.datapoints.pointsize);
                    lastY = this._drawState(ctx, x1c, x2c, y1c, y2c, lastY, shape, color, sample.equals(lastSample), sample.equals(nextSample));
                } else {
                    lastY = null;
                }
            }
            ctx.restore();
        }

        _clipCanvasToAxes(ctx, xaxis, yaxis) {
            let xmin = xaxis.p2c(xaxis.min),
                xmax = xaxis.p2c(xaxis.max),
                ymin = yaxis.p2c(yaxis.min),
                ymax = yaxis.p2c(yaxis.max);
            ctx.beginPath();
            ctx.rect(xmin, ymax, xmax - xmin, ymin - ymax);
            ctx.clip();
        }

        _lookupStateShape(sample) {
            let state = this._states.get(sample.state);
            return state ? state.shape : null;
        }

        _lookupStateColor(sample) {
            let state = this._states.get(sample.state);
            if (state && state.color) {
                return state.color;
            } else {
                let strength = this._strengths.get(sample.strength);
                return strength ? strength.color : null;
            }
        }

        _drawState(ctx, x1, x2, y1, y2, lastY, shape, color, equalsLast, equalsNext) {
            switch (shape) {
                case 'step_down':
                    this.renderer.drawStep(ctx, x1, x2, y2, lastY, color);
                    lastY = y2;
                    break;
                case 'step_up':
                    this.renderer.drawStep(ctx, x1, x2, y1, lastY, color);
                    lastY = y1;
                    break;
                case 'step_center':
                    let center = (y1 + y2) / 2
                    this.renderer.drawStep(ctx, x1, x2, center, lastY, color);
                    lastY = center;
                    break;
                case 'rect_filled':
                    this.renderer.drawRect(ctx, x1, x2, y1, y2, color, true, !equalsLast, !equalsNext);
                    lastY = null;
                    break;
            }

            return lastY;
        }

        _drawBuses(plot, ctx) {
            plot.getOptions().buses.forEach(bus => {
                if (bus.visible && bus.samples.length > 1) {
                    this._drawBus(plot, ctx, bus);
                };
            });
        }

        _drawBus(plot, ctx, bus) {
            this._drawBusLines(plot, ctx, bus);
            if (bus.showLabels) {
                this._drawBusLabels(plot, ctx, bus);
            }
        }

        _drawBusLines(plot, ctx, bus) {
            const axes = plot.getAxes();
            const y1 = bus.top;
            const y2 = bus.bottom;
            if (y1 < axes.yaxis.min || y2 > axes.yaxis.max) {
                return;
            }

            ctx.save();
            this._clipCanvasToAxes(ctx, axes.xaxis, axes.yaxis);
            const y1c = axes.yaxis.p2c(y1);
            const y2c = axes.yaxis.p2c(y2);
            for (let i = 0; i < bus.samples.length; i++) {
                const x1 = bus.samples[i].x;
                const x2 = i + 1 < bus.samples.length
                    ? bus.samples[i + 1].x
                    : bus.samples[i].x + bus.samples[i].x - bus.samples[i - 1].x;
                if (x1 > axes.xaxis.max || x2 < axes.xaxis.min) {
                    continue;
                }

                const value = bus.values[i];
                const shape = bus.shapes[i];
                const color = bus.colors[i];
                if (value && shape && color) {
                    const x1c = axes.xaxis.p2c(x1);
                    const x2c = axes.xaxis.p2c(x2);
                    const x11c = axes.xaxis.p2c(x1 + this._busTransitionWidth / 2);
                    const x21c = axes.xaxis.p2c(x2 - this._busTransitionWidth / 2);
                    const lastValue = bus.values[i - 1];
                    const nextValue = bus.values[i + 1];
                    switch (shape) {
                        case 'rect':
                            this.renderer.drawRect(ctx, x1c, x2c, y1c, y2c, color, false, value !== lastValue, value !== nextValue);
                            break;
                        case 'rect_cross_x':
                            this.renderer.drawRectCrossX(ctx, x1c, x2c, x11c, x21c, y1c, y2c, color, value !== lastValue, value !== nextValue);
                            break;
                    }
                }
            };
            ctx.restore();
        }

        _drawBusLabels(plot, ctx, bus) {
            const axes = plot.getAxes();
            const y1 = bus.top;
            const y2 = bus.bottom;
            if (y1 < axes.yaxis.min || y2 > axes.yaxis.max) {
                return;
            }

            ctx.save();
            this._clipCanvasToAxes(ctx, axes.xaxis, axes.yaxis);
            ctx.font = plot.getPlaceholder().css('font');
            ctx.textBaseline = 'middle';
            switch (bus.labelPosition) {
                case 'center':
                    ctx.textAlign = 'center';
                    break;
                case 'left':
                    ctx.textAlign = 'left';
                    break;
                case 'right':
                    ctx.textAlign = 'right';
                    break;
            }

            const y1c = axes.yaxis.p2c(y1);
            const y2c = axes.yaxis.p2c(y2);
            const y = (y1c + y2c) / 2;
            for (let i = 0, x1 = null; i < bus.samples.length; i++) {
                const value = bus.values[i];
                const nextValue = bus.values[i + 1];
                if (value) {
                    if (x1 === null) {
                        x1 = bus.samples[i].x;
                    }
                    if (value !== nextValue) {
                        let x2 = i + 1 < bus.samples.length
                            ? bus.samples[i + 1].x
                            : bus.samples[i].x + bus.samples[i].x - bus.samples[i - 1].x;
                        if (x1 <= axes.xaxis.max && x2 >= axes.xaxis.min) {
                            let transitionWidth = this._busTransitionWidth;
                            let x;
                            switch (bus.labelPosition) {
                                case 'center':
                                    x = axes.xaxis.p2c((x1 + x2) / 2);
                                    break;
                                case 'left':
                                    x = axes.xaxis.p2c(x1 + transitionWidth / 2);
                                    break;
                                case 'right':
                                    x = axes.xaxis.p2c(x2 - transitionWidth / 2);
                                    break;
                            }
                            let text = this._getFormattedBusValue(bus, value);
                            let maxWidth = (axes.xaxis.p2c(x2 - transitionWidth) - axes.xaxis.p2c(x1 + transitionWidth));
                            this._drawText(ctx, x, y, text, maxWidth);
                        }
                        x1 = null;
                    }
                }
            }
            ctx.restore();
        }

        _getFormattedBusValue(bus, value) {
            let intValue = parseInt(value, 2);
            switch (bus.labelFormatter) {
                case 'binary': {
                    let maxDigits = value.length;
                    return isNaN(intValue) ? value : intValue.toString(2).padStart(maxDigits, 0);
                }
                case 'decimal': {
                    let maxDigits = Math.ceil(Math.log10(Math.pow(2, value.length)));
                    return isNaN(intValue) ? value : intValue.toString(10).padStart(maxDigits, 0);
                }
                case 'hex': {
                    let maxDigits = Math.ceil(Math.log(Math.pow(2, value.length)) / Math.log(16));
                    return isNaN(intValue) ? value : intValue.toString(16).toUpperCase().padStart(maxDigits, 0);
                }
                default:
                    return value;
            }
        }

        _drawText(ctx, x, y, text, maxWidth) {
            const fittingText = this._getFittingText(ctx, text, maxWidth);
            ctx.fillText(fittingText, x, y);
        }

        _getFittingText(ctx, text, maxWidth) {
            const ellipsisWidth = ctx.measureText(BUS_LABEL_ELLIPSIS).width;
            let textWidth = ctx.measureText(text).width;
            if (textWidth > maxWidth && textWidth > ellipsisWidth) {
                while (textWidth + ellipsisWidth > maxWidth && text.length > 1) {
                    text = text.substring(0, text.length - 1);
                    textWidth = ctx.measureText(text).width
                }
                text = text + BUS_LABEL_ELLIPSIS;
            }
            return text;
        }

        _calculateTopBoundary(index) {
            return SIGNAL_OFFSET - (SIGNAL_OFFSET - SIGNAL_HEIGHT) / 2 + index * SIGNAL_OFFSET;
        }

        _calculateBottomBoundary(index) {
            return (SIGNAL_OFFSET - SIGNAL_HEIGHT) / 2 + index * SIGNAL_OFFSET;
        }
    }

    function init(plot) {
        let digitalWaveform;

        plot.hooks.processOptions.push((plot, options) => {
            if (options.series.digitalWaveform && options.series.digitalWaveform.show) {
                digitalWaveform = new DigitalWaveform(plot, options);
            }
        });

        plot.getDigitalWaveform = function() {
            return digitalWaveform;
        }
    }

    $.plot.plugins.push({
        init: init,
        options: DigitalWaveform.defaultOptions,
        name: 'digitalWaveform',
        version: '1.0'
    });
})(jQuery);
