/* * The MIT License
Copyright (c) 2010, 2011, 2012, 2013 by Juergen Marsch
Copyright (c) 2015 by Andrew Dove & Ciprian Ceteras
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

/**
# Intensity graph documentation
*/

(function (global, $) {
    var drawLegend = function(ctx, x, y, w, h, gradient, lowColor, highColor) {
        var highLowColorBoxHeight = 7,
            grad = ctx.createLinearGradient(0, y + h, 0, y),
            first = gradient[0].value, last = gradient[gradient.length - 1].value, offset, i;
        for (i = 0; i < gradient.length; i++) {
            offset = (gradient[i].value - first) / (last - first);
            if (offset >= 0 && offset <= 1.0) {
                grad.addColorStop(offset, gradient[i].color);
            }
        }

        ctx.fillStyle = grad;
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = lowColor;
        ctx.fillRect(x, y + h, w, highLowColorBoxHeight);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.strokeRect(x - 0.5, y + h + 0.5, w + 1, highLowColorBoxHeight);
        ctx.fillStyle = highColor;
        ctx.fillRect(x, y - highLowColorBoxHeight, w, highLowColorBoxHeight);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.strokeRect(x - 0.5, y - highLowColorBoxHeight + 0.5, w + 1, highLowColorBoxHeight);
    };

    function isColorScale(axis) {
        return axis.options.type === IntensityGraph.ColorScaleType;
    }

    function IntensityGraph() {
        this.pluginName = 'intensitygraph';
        this.pluginVersion = '0.2';
        this.defaultOptions = {
            series: {
                intensitygraph: {
                    data: [],
                    show: false,
                    lowColor: 'rgba(0,0,0,1)',
                    highColor: 'rgba(255,255,255,1)',
                    min: 0,
                    max: 1
                }
            }
        };

        var defaultGradient = [
                { value: 0, color: '#3182bd' },
                { value: 0.50, color: '#9ecae1' },
                { value: 1.0, color: '#deebf7' }
            ],
            defaultBoxPosition = { centerX: 20, centerY: 0 };

        /**
    ## Flot hooks
    */
        /**
    **processRawData(plot, s, sData, sDatapoints)**
    */
        function processRawData(plot, s, sData, sDatapoints) {
            var opts = plot.getOptions();
            if (opts.series.intensitygraph.show === true && sData[0].length > 0) {
                sDatapoints.pointsize = 2;

                // push two data points, one with xmin, ymin, the other one with xmax, ymax
                // so the autoscale algorithms can determine the draw size.
                sDatapoints.points.length = 0;
                sDatapoints.points.push(0, 0);
                sDatapoints.points.push(sData.length || 0, sData[0] ? sData[0].length : 0);
            }

        // TODO reserve enough space so the map is not drawn outside of the chart.
        }

        this.init = function(plot) {
            var opt = null, imageData, hiddenCanvas, hiddenImageData;

            plot.hooks.processOptions.push(processOptions);

            /**
        **processOptions(plot, options)**

         Used to parse gradient markers and init color palette
        */
            function processOptions(plot, options) {
                if (options.series.intensitygraph.show) {
                    if (!options.series.intensitygraph.gradient) {
                        options.series.intensitygraph.gradient = defaultGradient;
                    }

                    var yaxes = plot.getYAxes(),
                        colorScaleAxis = yaxes.filter(function (axis) { return IntensityGraph.prototype.isColorScale(axis); })[0];
                    if (colorScaleAxis && (!colorScaleAxis.boxPosition || colorScaleAxis.boxPosition.centerX === 0)) {
                        colorScaleAxis.boxPosition = defaultBoxPosition;
                    }

                    plot.hooks.drawSeries.push(drawSeries);
                    plot.hooks.processRawData.push(processRawData);
                    plot.hooks.findNearbyItems.push(findNearbyItems);

                    opt = options;

                    // caching all the colors of the gradient, min and max in one place
                    options.series.intensitygraph.palette = initColorPalette(options);
                }
            }

            function initColorPalette(opt) {
                var i, x,
                    canvas = document.createElement('canvas');
                canvas.width = '1';
                canvas.height = '256';
                var ctx = canvas.getContext('2d'),
                    grad = ctx.createLinearGradient(0, 0, 0, 256),
                    gradient = opt.series.intensitygraph.gradient,
                    first = gradient[0].value, last = gradient[gradient.length - 1].value, offset;

                if (last === first) {
                    grad.addColorStop(0, gradient[0].color);
                    grad.addColorStop(1, gradient[0].color);
                } else {
                    for (i = 0; i < gradient.length; i++) {
                        x = gradient[i].value;
                        offset = (x - first) / (last - first);
                        if (offset >= 0 && offset <= 1) {
                            grad.addColorStop(offset, gradient[i].color);
                        }
                    }
                }

                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, 1, 256);
                var palette = [],
                    imgDataPalette = ctx.getImageData(0, 0, 1, 256).data;
                for (i = 0; i < imgDataPalette.length; i++) {
                    palette[i] = imgDataPalette[i];
                }

                var colorLowStr = opt.series.intensitygraph.lowColor,
                    colorHighStr = opt.series.intensitygraph.highColor,
                    colorLow = $.color.parse(colorLowStr),
                    colorHigh = $.color.parse(colorHighStr);

                palette.push(colorLow.r | 0);
                palette.push(colorLow.g | 0);
                palette.push(colorLow.b | 0);
                palette.push(colorLow.a * 255 | 0);

                palette.push(colorHigh.r | 0);
                palette.push(colorHigh.g | 0);
                palette.push(colorHigh.b | 0);
                palette.push(colorHigh.a * 255 | 0);

                return palette;
            }

            function findNearbyItems (plot, canvasX, canvasY, series, seriesIndex, radius, computeDistance, items) {
                const seriesData = series[seriesIndex].data;
                const dataWidth = seriesData.length;
                const dataHeight = seriesData[0].length;
                const xaxis = series[seriesIndex].xaxis;
                const yaxis = series[seriesIndex].yaxis;
                const rectWidth = xaxis.p2c(1) - xaxis.p2c(0);
                const rectHeight = yaxis.p2c(0) - yaxis.p2c(1);

                for (let x = 0; x < dataWidth; x++) {
                    for (let y = 0; y < dataHeight; y++) {
                        const rectCenterPixelX = xaxis.p2c(x + 0.5);
                        const rectCenterPixelY = yaxis.p2c(y + 0.5);
                        // This computes the distance to the nearest edge of the rect, or 0 if the point is within the rect
                        const dx = Math.max(Math.abs(canvasX - rectCenterPixelX) - rectWidth / 2, 0);
                        const dy = Math.max(Math.abs(canvasY - rectCenterPixelY) - rectHeight / 2, 0);
                        const distance = computeDistance ? computeDistance(dx, dy) : Math.sqrt(dx * dx + dy * dy);
                        if (distance < radius) {
                            items.push({
                                datapoint: [x, y, seriesData[x][y]],
                                dataIndex: x * dataHeight + y,
                                series: series[seriesIndex],
                                seriesIndex: seriesIndex,
                                distance: distance
                            });
                        }
                    }
                }
            }

            /**
        **drawSeries(plot, ctx, serie)**

         Draws series as an intensity map.
        */
            function drawSeries(plot, ctx, serie) {
                var offset = plot.getPlotOffset(),
                    pixelRatio = plot.getSurface().pixelRatio,
                    yaxes = plot.getYAxes(),
                    colorScaleAxis = yaxes.filter(function (axis) { return isColorScale(axis); })[0],
                    minData = (colorScaleAxis && colorScaleAxis.options.autoScale !== 'none') ? colorScaleAxis.min : serie.intensitygraph.min,
                    maxData = (colorScaleAxis && colorScaleAxis.options.autoScale !== 'none') ? colorScaleAxis.max : serie.intensitygraph.max;

                //  The pixelRatio needs to be took into account because the size
                //of the element can be different from the canvas backing store size.
                //  The Flot CanvasWrapper adds a scaling transformation which helps
                //the user don't care about the pixelRatio. So most of the drawing
                //functions of the canvas are automatically scaling the drawings,
                //but putImageData() is ignoring the scale factor and is writing the
                //data dirrectly to the backing store matrix.

                if (serie.data.length > 0 && serie.data[0].length > 0) {
                //  Clipping is needed because the linear rect by rect mode is overflowing
                //when the limits of the rects are not perfectly alligned with the endpoint ticks.
                    ctx.save();
                    ctx.beginPath();
                    ctx.rect(offset.left, offset.top, plot.width(), plot.height());
                    ctx.clip();

                    if (isLinear(serie)) {
                        drawLinearSeries(serie, ctx);
                    } else {
                        drawLogSeries(serie, ctx);
                    }

                    ctx.restore();
                }

                drawLegend(plot, ctx, colorScaleAxis);

                function drawLegend(plot, ctx, colorScaleAxis) {
                    var colorScaleGradientWidth = 10,
                        x = colorScaleAxis && colorScaleAxis.show ? colorScaleAxis.box.left + colorScaleGradientWidth : offset.left + plot.width() + 20,
                        gradient = opt.series.intensitygraph.gradient,
                        lowColor = opt.series.intensitygraph.lowColor,
                        highColor = opt.series.intensitygraph.highColor;
                    if (colorScaleAxis && colorScaleAxis.show) {
                        IntensityGraph.prototype.drawLegend(ctx, x, offset.top, colorScaleGradientWidth, plot.height(), gradient, lowColor, highColor);
                    }
                }

                function drawLogSeries(serie, ctx) {
                    var wstart = Math.max(serie.xaxis.min, 0),
                        wstop = Math.min(serie.data.length, serie.xaxis.max),
                        hstart = Math.max(serie.yaxis.min, 0),
                        hstop = Math.min(serie.data[0].length, serie.yaxis.max),
                        xaxisStart = serie.xaxis.p2c(wstart),
                        xaxisStop = serie.xaxis.p2c(wstop),
                        yaxisStart = serie.yaxis.p2c(hstart),
                        yaxisStop = serie.yaxis.p2c(hstop),
                        w2Start = Math.floor(xaxisStart * pixelRatio),
                        w2Stop = Math.floor(xaxisStop * pixelRatio),
                        h2Start = Math.floor(yaxisStop * pixelRatio),
                        h2Stop = Math.floor(yaxisStart * pixelRatio),
                        w = w2Stop - w2Start,
                        h = h2Stop - h2Start;
                    if (w > 0 && h > 0) {
                        var imgData = getImageData(ctx, w, h);
                        drawLogSeriesPointByPoint(imgData, xaxisStart, xaxisStop, yaxisStart, yaxisStop, w, h, serie.xaxis.c2p, serie.yaxis.c2p,
                            serie.intensitygraph.palette, serie.data, minData, maxData, pixelRatio);
                        ctx.putImageData(imgData, Math.ceil((xaxisStart + offset.left) * pixelRatio), Math.ceil((yaxisStop + offset.top) * pixelRatio));
                    }
                }

                function drawLinearSeries(serie, ctx) {
                    var wstart = Math.floor(Math.max(serie.xaxis.min, 0)) | 0,
                        wstop = Math.ceil(Math.min(serie.data.length, serie.xaxis.max)) | 0,
                        hstart = Math.floor(Math.max(serie.yaxis.min, 0)) | 0,
                        hstop = Math.ceil(Math.min(serie.data[0].length, serie.yaxis.max)) | 0,
                        xaxisStart = serie.xaxis.p2c(wstart),
                        xaxisStop = serie.xaxis.p2c(wstop),
                        yaxisStart = serie.yaxis.p2c(hstart),
                        yaxisStop = serie.yaxis.p2c(hstop),
                        xpctsPerPx = Math.abs((wstop - wstart) / (xaxisStop - xaxisStart)) / pixelRatio,
                        ypctsPerPx = Math.abs((hstop - hstart) / (yaxisStop - yaxisStart)) / pixelRatio,
                        decimate = xpctsPerPx > 1 && ypctsPerPx > 1,
                        w, h, imgData;

                    if (decimate) {
                        var w2Start = Math.floor(xaxisStart * pixelRatio),
                            w2Stop = Math.floor(xaxisStop * pixelRatio),
                            h2Start = Math.floor(yaxisStop * pixelRatio),
                            h2Stop = Math.floor(yaxisStart * pixelRatio);
                        w = w2Stop - w2Start;
                        h = h2Stop - h2Start;
                        if (w > 0 && h > 0) {
                            imgData = getImageData(ctx, w, h);
                            drawSeriesPointByPoint(imgData, wstart, wstop, hstart, hstop, w, h, xpctsPerPx, ypctsPerPx,
                                serie.intensitygraph.palette, serie.data, minData, maxData);
                            ctx.putImageData(imgData, Math.ceil((xaxisStart + offset.left) * pixelRatio), Math.ceil((yaxisStop + offset.top) * pixelRatio));
                        }
                    } else {
                        w = wstop - wstart;
                        h = hstop - hstart;
                        if (w > 0 && h > 0) {
                            imgData = getHiddenImageData(w, h);
                            drawSeriesRectByRect(imgData, wstart, wstop, hstart, hstop, w, h,
                                serie.intensitygraph.palette, serie.data, minData, maxData);
                            hiddenCanvas.getContext('2d').putImageData(imgData, 0, 0);
                            ctx.imageSmoothingEnabled = false;
                            ctx.webkitImageSmoothingEnabled = false;
                            ctx.msImageSmoothingEnabled = false;
                            ctx.drawImage(hiddenCanvas, 0, 0, w, h,
                                xaxisStart + offset.left, yaxisStop + offset.top,
                                Math.max(xaxisStop - xaxisStart, 1), Math.max(yaxisStart - yaxisStop, 1));
                        }
                    }
                }

                function drawLogSeriesPointByPoint(imgData, xaxisStart, xaxisStop, yaxisStart, yaxisStop, w, h, xc2p, yc2p, palette, data, minValue, maxValue, pixelRatio) {
                    var i, j, x, y, x2, y2, x2limit, y2limit, value, value2, index, p, range = maxValue - minValue;
                    for (i = 0; i < w; i++) {
                        x = xc2p(xaxisStart + i / pixelRatio) | 0;
                        for (j = h - 1; j >= 0; j--) {
                            y = yc2p(yaxisStart - j / pixelRatio) | 0;
                            value = data[x][y];
                            x2limit = Math.min(xc2p(xaxisStart + i / pixelRatio + 1), data.length) | 0;
                            y2limit = Math.min(yc2p(yaxisStart - j / pixelRatio - 1), data[0].length) | 0;
                            for (x2 = x; x2 < x2limit; x2++) {
                                for (y2 = y; y2 < y2limit; y2++) {
                                    value2 = data[x2][y2];
                                    if (value2 > value) {
                                        value = value2;
                                    }
                                }
                            }
                            for (x2 = x; x2 < x2limit; x2++) {
                                value2 = data[x2][y];
                                if (value2 > value) {
                                    value = value2;
                                }
                            }
                            for (y2 = y; y2 < y2limit; y2++) {
                                value2 = data[x][y2];
                                if (value2 > value) {
                                    value = value2;
                                }
                            }
                            if (value < minValue) {
                                index = 256 * 4;
                            } else if (value > maxValue) {
                                index = 256 * 4 + 4;
                            } else {
                                index = 4 * Math.round((value - minValue) * 255 / range)
                            }
                            p = 4 * (h - j - 1) * w + 4 * i;
                            imgData.data[p + 0] = palette[index + 0];
                            imgData.data[p + 1] = palette[index + 1];
                            imgData.data[p + 2] = palette[index + 2];
                            imgData.data[p + 3] = palette[index + 3];
                        }
                    }
                }

                function drawSeriesPointByPoint(imgData, wstart, wstop, hstart, hstop, w, h, xpctsPerPx, ypctsPerPx, palette, data, minValue, maxValue) {
                    var i, j, x, y, x2, y2, x2limit, y2limit, value, value2, index, p, range = maxValue - minValue;
                    for (i = 0; i < w; i++) {
                        x = wstart + (i * xpctsPerPx) | 0;
                        for (j = 0; j < h; j++) {
                            y = hstart + (j * ypctsPerPx) | 0;
                            value = data[x][y];
                            x2limit = Math.floor(Math.min((x + xpctsPerPx), data.length)) | 0;
                            y2limit = Math.floor(Math.min(y + ypctsPerPx, data[0].length)) | 0;
                            for (x2 = x; x2 < x2limit; x2++) {
                                for (y2 = y; y2 < y2limit; y2++) {
                                    value2 = data[x2][y2];
                                    if (value2 > value) {
                                        value = value2;
                                    }
                                }
                            }
                            if (value < minValue) {
                                index = 256 * 4;
                            } else if (value > maxValue) {
                                index = 256 * 4 + 4;
                            } else {
                                index = 4 * Math.round((value - minValue) * 255 / range)
                            }
                            p = 4 * (h - j - 1) * w + 4 * i;
                            imgData.data[p + 0] = palette[index + 0];
                            imgData.data[p + 1] = palette[index + 1];
                            imgData.data[p + 2] = palette[index + 2];
                            imgData.data[p + 3] = palette[index + 3];
                        }
                    }
                }

                function drawSeriesRectByRect(imgData, wstart, wstop, hstart, hstop, w, h, palette, data, minValue, maxValue) {
                    var i, j, value, index, p, range = maxValue - minValue;
                    for (i = wstart; i < wstop; i++) {
                        for (j = hstart; j < hstop; j++) {
                            value = data[i][j];
                            if (value < minValue) {
                                index = 256 * 4;
                            } else if (value > maxValue) {
                                index = 256 * 4 + 4;
                            } else {
                                index = 4 * Math.round((value - minValue) * 255 / range)
                            }
                            p = 4 * (hstop - j - 1) * w + 4 * (i - wstart);
                            imgData.data[p + 0] = palette[index + 0];
                            imgData.data[p + 1] = palette[index + 1];
                            imgData.data[p + 2] = palette[index + 2];
                            imgData.data[p + 3] = palette[index + 3];
                        }
                    }
                }

                function getImageData(ctx, width, height) {
                    if (!imageData || imageData.width !== width || imageData.height !== height) {
                        imageData = ctx.createImageData(width, height);
                    }
                    return imageData;
                }

                function getHiddenImageData(width, height) {
                    if (!hiddenCanvas) {
                        hiddenCanvas = document.createElement('canvas');
                        hiddenCanvas.className = 'tempCanvas';
                        hiddenCanvas.style.visibility = 'hidden';
                        hiddenImageData = null;
                    }
                    if (!hiddenImageData || hiddenCanvas.width !== width || hiddenCanvas.height !== height) {
                        hiddenCanvas.width = width;
                        hiddenCanvas.style.width = width + 'px';
                        hiddenCanvas.height = height;
                        hiddenCanvas.style.height = height + 'px';
                        hiddenImageData = hiddenCanvas.getContext('2d').createImageData(width, height);
                    }
                    return hiddenImageData;
                }

                function isLinear(series) {
                    return (!serie.xaxis.options.mode || serie.xaxis.options.mode === 'linear') &&
                  (!serie.yaxis.options.mode || serie.yaxis.options.mode === 'linear');
                }
            }
        };
    }

    IntensityGraph.ColorScaleType = 'colorScale';
    IntensityGraph.prototype.drawLegend = drawLegend;
    IntensityGraph.prototype.isColorScale = isColorScale;

    var intensityGraph = new IntensityGraph();

    $.plot.plugins.push({
        init: intensityGraph.init,
        options: intensityGraph.defaultOptions,
        name: intensityGraph.pluginName,
        version: intensityGraph.pluginVersion
    });

    $.plot.IntensityGraph = IntensityGraph;
})(this, jQuery);
