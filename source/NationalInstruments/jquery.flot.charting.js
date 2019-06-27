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
/* Flot plugin that makes charting easier and more efficient.
*/
/*global jQuery, requestAnimationFrame*/

(function ($) {
    'use strict';

    // flot hook which decimates the data from the historyBuffer and converts it into a format that flot understands
    function processRawData(plot, dataSeries, x, datapoints) {
        var indexMap; // this a "dictionary" from 0 based indexes in the history buffer to target values
        if (dataSeries.historyBuffer) {
            var historyBuffer = dataSeries.historyBuffer;
            indexMap = historyBuffer.indexMap;
            var data;

            var index = plot.getData().indexOf(dataSeries);

            if (index < historyBuffer.width) {
                data = dataRange(historyBuffer, index);
                dataSeries.index = index;
            } else {
                data = [];
            }

            var points = datapoints.points;

            for (var i = 0; i < data.length; i+=2) {
                points[i] = indexMap ? indexMap[data[i]] : data[i];
                points[i + 1] = data[i + 1];
            }

            points.length = data.length;
            datapoints.pointsize = 2;
            dataSeries.decimate = decimateChartData;
            dataSeries.decimatePoints = decimateChartData;
        }
    }

    function dataRange(historyBuffer, index) {
        var data = historyBuffer.rangeX(index);
        var result = [];

        if (data.xmin === undefined || data.xmax === undefined || data.deltamin === undefined) {
            return [];
        }

        result[0] = data.xmin;
        result[2] = data.xmax;
        result[4] = data.xmax - data.deltamin;
        result[1] = 0;
        result[3] = 1;
        result[5] = 2;


        return result;
    }

    function decimateChartData (series, start, end, width) {
        var historyBuffer = series.historyBuffer,
            size = end - start,
            indexMap = historyBuffer.indexMap,
            datapoints = series.datapoints,
            step = Math.floor(size / width),
            data;

        var index = series.index;
        if (index < historyBuffer.width) {
            var data = series.historyBuffer.query(start, end, step, index);
        } else {
            data = [];
        }

        var points = datapoints.points;
        for (var i = 0; i < data.length; i+=2) {
            points[i] = indexMap ? indexMap[data[i]] : data[i];
            points[i+1] = data[i+1];
        }

        points.length = data.length;
        datapoints.pointsize = 2;

        return points;
    }

    // remove old data series and trigger the computation of a new one from the history buffer
    function updateSeries(plot, historyBuffer) {
        var dataSeries = plot.getData();
        for (var i = 0; i < historyBuffer.width; i++) {
            if (typeof dataSeries[i] === 'object') {
                dataSeries[i].data = [];
                // although it would be nice to reuse data points, flot does nasty
                // things with the dataSeries (deep copy, showing with ~50% percent
                // on the timeline)
                dataSeries[i].datapoints = undefined;
            } else {
                dataSeries[i] = {
                    data: [],
                };
            }
        }

        plot.setData(dataSeries);
    }

    //readjust xmin to account for large deltamin
    function adjustDataRange(plot, s, range) {
        if (s.datapoints.points) {
            range.xmin = s.datapoints.points[0];
        }
    }

    function setYAxisRange(plot, yaxis) {
        if (yaxis.direction !== 'y' || yaxis.options.autoScale === "none")
            return;
        var i, j, k, points, pointsLength, xmin, xmax, range, index,
            dataSeries = plot.getData(),
            yseries = dataSeries
                .filter(function(series) {
                    return series.yaxis === yaxis;
                }),
            yseriesLength = yseries.length;
        for (j = 0; j < yseriesLength; j++) {
            index = yseries[j].index;
            xmin =  yseries[j].xaxis.min ? yseries[j].xaxis.min : yseries[j].xaxis.options.min;
            xmax =  yseries[j].xaxis.max ? yseries[j].xaxis.max : yseries[j].xaxis.options.max;
            if (j < yseries[j].historyBuffer.width) {
                range =  yseries[j].historyBuffer.rangeY(xmin, xmax, index);
                if (j === 0) {
                    yaxis.datamin = range.ymin;
                    yaxis.datamax = range.ymax;
                } else {
                    yaxis.datamin = Math.min(yaxis.datamin, range.ymin) || undefined;
                    yaxis.datamax = Math.max(yaxis.datamax, range.ymax) || undefined;
                }
            }
        }
    }

    // draw the chart
    function drawChart(plot) {
        plot.setupGrid(true);
        plot.draw();
    }

    // plugin entry point
    function init(plot) {
        var isShutdown = false;
        const keyForOnChangeHistoryBuffer = 'setDataCallback';
        // called on every history buffer change.
        function triggerDataUpdate(plot, historyBuffer) {
            if (!plot.dataUpdateTriggered) {
                plot.dataUpdateTriggered = requestAnimationFrame(function () { // throttle charting computation/drawing to the browser frame rate
                    if (!isShutdown) {
                        updateSeries(plot, historyBuffer);
                        drawChart(plot);
                    }
                    plot.dataUpdateTriggered = null;
                });
            }
        }

        plot.hooks.processOptions.push(function (plot) {
            var historyBuffer = plot.getOptions().series.historyBuffer; // looks for the historyBuffer option
            if (historyBuffer) {
                plot.hooks.processRawData.push(processRawData); // enable charting plugin for this flot chart
                historyBuffer.registerOnChange(keyForOnChangeHistoryBuffer, function () {
                    triggerDataUpdate(plot, historyBuffer); // call triggerDataUpdate on every historyBuffer modification
                });
                updateSeries(plot, historyBuffer);

                plot.hooks.adjustSeriesDataRange.push(adjustDataRange);

                plot.hooks.setRange.push(setYAxisRange);

                plot.hooks.shutdown.push(function () {
                    historyBuffer.deregisterOnChange(keyForOnChangeHistoryBuffer);
                    isShutdown = true;
                });
            }
        });
    }

    $.plot.plugins.push({
        init: init,
        name: 'charting',
        version: '0.3'
    });
})(jQuery);
