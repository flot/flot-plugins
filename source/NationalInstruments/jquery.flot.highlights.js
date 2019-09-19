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

    class Highlights {
        static get defaultOptions() {
            return {
                series: {
                    highlights: {
                        selectedRange: [], // the selected index range inside which points will be highlighted
                        selectedIndexes: [], // the selected indexes of the points that will be highlighted
                        show: false,
                        highlightLineWidth: 1, // the line width of the highlight
                        highlightColor: '#ffffff', // the color to draw the highlights - there will be a faint black shadow around them
                        highlightPoints: true, // highlight points
                        highlightLines: false, // highlight entires lines - if any point in selectedIndexes belongs to the line highlight the entire line
                        highlightBars: false, // highlight bars
                    }
                }
            }
        }

        constructor(plot, options) {
            this._processOptions(options);
            this._createHooks(plot);
        }

        _createHooks(plot) {
            plot.hooks.drawOverlay.push((plot, ctx, overlay) => {
                this._drawOverlay(plot, ctx, overlay)
            });
        }

        _processOptions(options) {
            $.extend(true, options, this.defaultOptions);
            this._options = options.series.highlights;
        }

        _drawOverlay(plot, ctx) {
            const series = plot.getData();
            if (!this._options.show) {
                return;
            }

            const plotOffset = plot.getPlotOffset();
            ctx.save();
            ctx.translate(plotOffset.left, plotOffset.top);
            ctx.lineWidth = this._options.lineWidth;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            let lastPointIndex;
            for (let j = 0; j < series.length; j++) {
                let ps = series[j].datapoints.pointsize;
                let highlightIndexes = this._options.selectedIndexes[j];
                if (highlightIndexes) {
                    for (let i = 0; i < highlightIndexes.length; i++) {
                        let pointIndex = highlightIndexes[i];
                        if (this._options.highlightPoints) {
                            this._drawPointHighlight(series[j], plot, ctx, pointIndex);
                        }

                        if (this._options.highlightBars) {
                            this._drawBarHighlight(series[j], [series[j].datapoints.points[pointIndex * ps], series[j].datapoints.points[pointIndex * ps + 1]], ctx);
                        }
                    }
                }

                let highlightRange = this._options.selectedRange[j];
                if (highlightRange) {
                    for (let i = highlightRange[0]; i < highlightRange[1]; i++) {
                        if (this._options.highlightPoints) {
                            this._drawPointHighlight(series[j], plot, ctx, i);
                        }

                        if (this._options.highlightBars) {
                            this._drawBarHighlight(series[j], [series[j].datapoints.points[i * ps], series[j].datapoints.points[i * ps + 1]], ctx);
                        }
                    }
                    if (this._options.highlightLines) {
                        this._drawLineHighlight(series[j], plot, ctx, highlightRange);
                    }
                }

                if (this._options.highlightLines && highlightIndexes && highlightIndexes.length > 0) {
                    this._drawLineHighlight(series[j], plot, ctx);
                }
            }

            ctx.restore();
        }

        _drawPointHighlight(series, plot, ctx, pointIndex) {
            const ps = series.datapoints.pointsize;
            let x = series.datapoints.points[pointIndex * ps];
            let y = series.datapoints.points[pointIndex * ps + 1];
            const axisx = series.xaxis;
            const axisy = series.yaxis;
            const highlightColor = (typeof this._options.highlightColor === "string") ? this._options.highlightColor : $.color.parse(series.color).scale('a', 0.5).toString();

            if (x < axisx.min || x > axisx.max || y < axisy.min || y > axisy.max) {
                return;
            }

            ctx.save();
            const pointRadius = series.points.radius + series.points.lineWidth / 2;
            ctx.lineWidth = pointRadius;
            ctx.strokeStyle = highlightColor;
            ctx.fillStyle = highlightColor;
            ctx.shadowColor = 'black';
            ctx.shadowBlur = 3;
            ctx.shadowOffsetY = 1;
            let radius = 1.5 * pointRadius;
            x = axisx.p2c(x);
            y = axisy.p2c(y);

            ctx.beginPath();
            const symbol = series.points.symbol;
            if (symbol === 'circle') {
                ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
            } else if (typeof symbol === 'string' && plot.drawSymbol && plot.drawSymbol[symbol]) {
                plot.drawSymbol[symbol](ctx, x, y, radius, false);
            }

            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }

        _drawLineHighlight(series, plot, ctx, highlightRange) {
            const ps = series.datapoints.pointsize;
            let originalPoints;
            const plotOffset = plot.getPlotOffset();
            ctx.translate(-plotOffset.left, -plotOffset.top);
            const originalWidth = series.lines.lineWidth;
            const originalColor = series.color;
            series.lines.lineWidth += this._options.lineWidth;
            series.color = this._options.highlightColor;
            if (highlightRange) {
                originalPoints = [...series.datapoints.points];
                series.datapoints.points.splice(highlightRange[1] * ps);
                series.datapoints.points.splice(0, highlightRange[0] * ps);
            }

            $.plot.drawSeries.drawSeriesLines(series, ctx, plotOffset, plot.width(), plot.height(), plot.drawSymbol, () => this._options.highlightColor);
            if (highlightRange) {
                series.datapoints.points = originalPoints;
            }

            series.lines.lineWidth = originalWidth;
            series.color = originalColor;
            $.plot.drawSeries.drawSeriesLines(series, ctx, plotOffset, plot.width(), plot.height(), plot.drawSymbol, () => this._options.highlightColor);
            $.plot.drawSeries.drawSeriesPoints(series, ctx, plotOffset, plot.width(), plot.height(), plot.drawSymbol, () => this._options.highlightColor);
            ctx.translate(plotOffset.left, plotOffset.top);
        }

        _drawBarHighlight(series, point, octx) {
            const highlightColor = (typeof this._options.highlightColor === "string") ? this._options.highlightColor : $.color.parse(series.color).scale('a', 0.5).toString();
            let barLeft;

            const barWidth = series.bars.barWidth[0] || series.bars.barWidth;
            switch (series.bars.align) {
                case "left":
                    barLeft = 0;
                    break;
                case "right":
                    barLeft = -barWidth;
                    break;
                default:
                    barLeft = -barWidth / 2;
            }

            octx.lineWidth = series.bars.lineWidth;
            octx.strokeStyle = highlightColor;

            var fillTowards = series.bars.fillTowards || 0,
                bottom = fillTowards > series.yaxis.min ? Math.min(series.yaxis.max, fillTowards) : series.yaxis.min;

            $.plot.drawSeries.drawBar(point[0], point[1], point[2] || bottom, barLeft, barLeft + barWidth,
                function() {
                    return 'transparent';
                }, series.xaxis, series.yaxis, octx, series.bars.horizontal, series.bars.lineWidth);
        }
    };

    function init(plot) {
        let highlights;

        plot.hooks.processOptions.push((plot, options) => {
            if (options.series.highlights && options.series.highlights.show) {
                highlights = new Highlights(plot, options);
            }
        });

        plot.getHighlights = function() {
            return highlights;
        }
    }

    $.plot.plugins.push({
        init: init,
        options: Highlights.defaultOptions,
        name: 'highlights',
        version: '1.0'
    });
})(jQuery);
