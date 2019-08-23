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
(function (global, $) {
    function ScatterGraph () {
        this.pluginName = 'scattergraph';
        this.pluginVersion = '1.0';
        this.defaultOptions = {
            series: {
                scattergraph: {
                    data: [],
                    show: false,
                    lineWidth: 2,
                    filled: false,
                    drawLines: false,
                    color: 'black',
                    shape: 'circle',
                    size: 5
                }
            }
        };

        var defaultColors = new Map([
                [0, 'red'],
                [1, 'green'],
                [2, 'blue'],
                [3, 'cyan'],
                [4, 'yellow'],
                [5, 'magenta'],
                [6, 'salmon'],
                [7, 'teal'],
                [8, 'grey'],
                [9, 'black']
            ]),
            defaultShapes = new Map([
                [0, 'circle'],
                [1, 'square'],
                [2, 'triangle_n'],
                [3, 'triangle_s'],
                [4, 'triangle_e'],
                [5, 'triangle_w'],
                [6, 'cross_v'],
                [7, 'cross_d'],
                [8, 'diamond'],
                [9, 'asterisk']
            ]),
            defaultSizes = new Map([
                [0, 1],
                [1, 2],
                [2, 3],
                [3, 4],
                [4, 5],
                [5, 9],
                [6, 14],
                [7, 23],
                [8, 37],
                [9, 60]
            ]);

        /**
        ## Flot hooks
        */
        this.init = function (plot) {
            var opt = null, isArrayOfObject = false, isArrayOfArray = false, isObjectOfArray = false, dataLen;
            plot.hooks.processOptions.push(processOptions);

            function processRawData (plot, s, sData, sDatapoints) {
                var opts = plot.getOptions();
                if (opts.series.scattergraph.show === true && sData[0]) {
                    if (!Array.isArray(sData[0]) && Array.isArray(sData[0].x)) {
                        isObjectOfArray = true;
                        dataLen = sData[0].x.length;
                    } else if (Array.isArray(sData[0]) && Array.isArray(sData[0][0]) && !Array.isArray(sData[0][0][0])) {
                        isArrayOfArray = true;
                        dataLen = sData[0].length;
                    } else if (Array.isArray(sData[0]) && typeof sData[0][0] === 'object') {
                        isArrayOfObject = true;
                        dataLen = sData[0].length;
                    } else {
                        console.log('unknown data type for scatter graph');
                        return;
                    }

                    var xmax = Number.NEGATIVE_INFINITY;
                    var ymax = Number.NEGATIVE_INFINITY;
                    var ymin = Number.POSITIVE_INFINITY;
                    var xmin = Number.POSITIVE_INFINITY;
                    var x, y;
                    for (var i = 0; i < dataLen; i++) {
                        if (isArrayOfObject) {
                            x = sData[0][i].x;
                            y = sData[0][i].y;
                        } else if (isObjectOfArray) {
                            x = sData[0].x[i];
                            y = sData[0].y[i];
                        } else if (isArrayOfArray) {
                            x = sData[0][i][0];
                            y = sData[0][i][1];
                        }
                        
                        if (x > xmax) {
                            xmax = x;
                        }

                        if (y > ymax) {
                            ymax = y;
                        }

                        if (x < xmin) {
                            xmin = x;
                        }

                        if (y < ymin) {
                            ymin = y;
                        }
                    }

                    sDatapoints.pointsize = 2;

                    // push two data points, one with xmin, ymin, the other one with xmax, ymax
                    // so the autoscale algorithms can determine the draw size.
                    sDatapoints.points.length = 0;
                    sDatapoints.points.push(xmin, ymin);
                    sDatapoints.points.push(xmax, ymax);
                    sDatapoints.format = [
                        {x: true, y: false, number: true, computeRange: true},
                        {x: false, y: true, number: true, computeRange: true}
                    ];
                }
            };

            /**
            **processOptions(plot, options)**

             Used to parse gradient markers and init color palette
            */
            function processOptions (plot, options) {
                if (options.series.scattergraph.show) {
                    if (!options.series.scattergraph.colors) {
                        options.series.scattergraph.colors = defaultColors;
                    } else if (typeof options.series.scattergraph.colors === 'string') {
                        options.series.scattergraph.colors = createColorMap(JSON.parse(options.series.scattergraph.colors));
                    } else if (Array.isArray(options.series.scattergraph.colors)) {
                        options.series.scattergraph.colors = createColorMap(options.series.scattergraph.colors);
                    } else if (typeof options.series.scattergraph.colors !== 'function') {
                        console.log('colors is unknown type');
                    }

                    if (!options.series.scattergraph.sizes) {
                        options.series.scattergraph.sizes = defaultSizes;
                    } else if (typeof options.series.scattergraph.sizes === 'string') {
                        options.series.scattergraph.sizes = createSizeMap(JSON.parse(options.series.scattergraph.sizes));
                    } else if (Array.isArray(options.series.scattergraph.sizes)) {
                        options.series.scattergraph.sizes = createSizeMap(options.series.scattergraph.sizes);
                    } else if (typeof options.series.scattergraph.sizes !== 'function') {
                        console.log('sizes is unknown type');
                    }

                    if (!options.series.scattergraph.shapes) {
                        options.series.scattergraph.shapes = defaultShapes;
                    } else if (typeof options.series.scattergraph.shapes === 'string') {
                        options.series.scattergraph.shapes = createShapeMap(JSON.parse(options.series.scattergraph.shapes));
                    } else if (Array.isArray(options.series.scattergraph.shapes)) {
                        options.series.scattergraph.shapes = createShapeMap(options.series.scattergraph.shapes);
                    } else if (typeof options.series.scattergraph.shapes !== 'function') {
                        console.log('sizes is unknown type');
                    }

                    plot.hooks.drawSeries.push(drawSeries);
                    plot.hooks.processRawData.push(processRawData);

                    opt = options;
                }
            };

            function createColorMap (colors) {
                var i;
                var colorMap = new Map();
                for (i = 0; i < colors.length; i++) {
                    colorMap.set(colors[i].value, colors[i].color);
                }

                return colorMap;
            };

            function lookupColor (colorValue) {
                var colorOut;
                if (colorValue !== undefined) {
                    if (typeof opt.series.scattergraph.colors === 'function') {
                        colorOut = opt.series.scattergraph.colors(colorValue);
                    } else if (opt.series.scattergraph.colors) {
                        colorOut = opt.series.scattergraph.colors.get(colorValue);
                    }
                }

                if (!colorOut) {
                    return opt.series.scattergraph.color;
                }

                return colorOut;
            }

            function createShapeMap (shapes) {
                var i;
                var shapeMap = new Map();
                for (i = 0; i < shapes.length; i++) {
                    shapeMap.set(shapes[i].value, shapes[i].shape);
                }

                return shapeMap;
            };

            function lookupShape (shapeValue) {
                var shapeOut;
                if (shapeValue !== undefined) {
                    if (typeof opt.series.scattergraph.shapes === 'function') {
                        shapeOut = opt.series.scattergraph.shapes(shapeValue);
                    } else if (opt.series.scattergraph.shapes) {
                        shapeOut = opt.series.scattergraph.shapes.get(shapeValue);
                    }
                }

                if (!shapeOut) {
                    return opt.series.scattergraph.shape;
                }

                return shapeOut;
            }

            function createSizeMap (sizes) {
                var i;
                var sizeMap = new Map();
                for (i = 0; i < sizes.length; i++) {
                    sizeMap.set(sizes[i].value, parseFloat(sizes[i].size));
                }

                return sizeMap;
            };

            function lookupSize (sizeValue) {
                var sizeOut;
                if (sizeValue !== undefined) {
                    if (typeof opt.series.scattergraph.sizes === 'function') {
                        sizeOut = opt.series.scattergraph.sizes(sizeValue);
                    } else if (opt.series.scattergraph.sizes) {
                        sizeOut = opt.series.scattergraph.sizes.get(sizeValue);
                    }
                }

                if (sizeOut === undefined) {
                    return opt.series.scattergraph.size;
                }

                return sizeOut;
            }

            function drawLine (ctx, xaxis, yaxis, x1, y1, x2, y2, color) {
                ctx.save();
                ctx.strokeStyle = color;
                ctx.beginPath();
                ctx.moveTo(xaxis.p2c(x1), yaxis.p2c(y1));
                ctx.lineTo(xaxis.p2c(x2), yaxis.p2c(y2));
                ctx.stroke();
                ctx.restore();
            }

            function drawCircle (ctx, x, y, size, filled) {
                ctx.beginPath();
                ctx.arc(x, y, size / 2, 0, 2 * Math.PI);
                if (filled) {
                    ctx.fill();
                } else {
                    ctx.stroke();
                }
            }

            function drawSquare (ctx, x, y, size, filled) {
                if (filled) {
                    ctx.fillRect(x - size / 2, y - size / 2, size, size);
                } else {
                    ctx.strokeRect(x - size / 2, y - size / 2, size, size);
                }
            }

            function drawTriangleN (ctx, x, y, size, filled) {
                var h = size * (Math.sqrt(3) / 2);
                ctx.beginPath();
                ctx.moveTo(x, y - h / 2);
                ctx.lineTo(x - size / 2, y + h / 2);
                ctx.lineTo(x + size / 2, y + h / 2);
                ctx.lineTo(x, y - h / 2);
                ctx.lineTo(x - size / 2, y + h / 2);
                if (filled) {
                    ctx.fill();
                } else {
                    ctx.stroke();
                }
            }

            function drawTriangleS (ctx, x, y, size, filled) {
                var h = size * (Math.sqrt(3) / 2);
                ctx.beginPath();
                ctx.moveTo(x, y + h / 2);
                ctx.lineTo(x - size / 2, y - h / 2);
                ctx.lineTo(x + size / 2, y - h / 2);
                ctx.lineTo(x, y + h / 2);
                ctx.lineTo(x - size / 2, y - h / 2);
                if (filled) {
                    ctx.fill();
                } else {
                    ctx.stroke();
                }
            }

            function drawTriangleE (ctx, x, y, size, filled) {
                var h = size * (Math.sqrt(3) / 2);
                ctx.beginPath();
                ctx.moveTo(x + h / 2, y);
                ctx.lineTo(x - h / 2, y + h / 2);
                ctx.lineTo(x - h / 2, y - h / 2);
                ctx.lineTo(x + h / 2, y);
                ctx.lineTo(x - h / 2, y + h / 2);
                if (filled) {
                    ctx.fill();
                } else {
                    ctx.stroke();
                }
            }

            function drawTriangleW (ctx, x, y, size, filled) {
                var h = size * (Math.sqrt(3) / 2);
                ctx.beginPath();
                ctx.moveTo(x - h / 2, y);
                ctx.lineTo(x + h / 2, y + h / 2);
                ctx.lineTo(x + h / 2, y - h / 2);
                ctx.lineTo(x - h / 2, y);
                ctx.lineTo(x + h / 2, y + h / 2);
                if (filled) {
                    ctx.fill();
                } else {
                    ctx.stroke();
                }
            }

            function drawCrossV (ctx, x, y, size) {
                var h = size;
                ctx.beginPath();
                ctx.moveTo(x, y - h / 2);
                ctx.lineTo(x, y + h / 2);
                ctx.moveTo(x - h / 2, y);
                ctx.lineTo(x + h / 2, y);
                ctx.stroke();
            }

            function drawCrossD (ctx, x, y, size) {
                var h = size;
                ctx.beginPath();
                ctx.moveTo(x - h / 2, y - h / 2);
                ctx.lineTo(x + h / 2, y + h / 2);
                ctx.moveTo(x - h / 2, y + h / 2);
                ctx.lineTo(x + h / 2, y - h / 2);
                ctx.stroke();
            }

            function drawDiamond (ctx, x, y, size, filled) {
                var h = size;
                ctx.beginPath();
                ctx.moveTo(x, y - h / 2);
                ctx.lineTo(x + h / 2, y);
                ctx.lineTo(x, y + h / 2);
                ctx.lineTo(x - h / 2, y);
                ctx.lineTo(x, y - h / 2);
                ctx.lineTo(x + h / 2, y);
                if (filled) {
                    ctx.fill();
                } else {
                    ctx.stroke();
                }
            }

            function drawAsterisk (ctx, x, y, size) {
                var h = size;
                var hroot2 = h / (2 * Math.sqrt(2));
                ctx.beginPath();
                ctx.moveTo(x - hroot2, y - hroot2 );
                ctx.lineTo(x + hroot2, y + hroot2);
                ctx.moveTo(x - hroot2, y + hroot2);
                ctx.lineTo(x + hroot2, y - hroot2);
                ctx.moveTo(x, y - h / 2);
                ctx.lineTo(x, y + h / 2);
                ctx.moveTo(x - h / 2, y);
                ctx.lineTo(x + h / 2, y);
                ctx.stroke();
            }

            function drawPoint (ctx, x, y, axisx, axisy, xoffset, yoffset, color, shape, size, lineWidth, filled) {
                if (x === undefined || y === undefined) {
                    return;
                }

                ctx.strokeStyle = color;
                ctx.fillStyle = color;
                ctx.lineWidth = lineWidth;
                ctx.moveTo(axisx.p2c(x) + xoffset, axisy.p2c(y) + yoffset);
                switch (shape) {
                    case 'circle':
                        drawCircle(ctx, axisx.p2c(x), axisy.p2c(y), size, filled);
                        break;
                    case 'square':
                        drawSquare(ctx, axisx.p2c(x), axisy.p2c(y), size, filled);
                        break;
                    case 'triangle_n':
                        drawTriangleN(ctx, axisx.p2c(x), axisy.p2c(y), size, filled);
                        break;
                    case 'triangle_s':
                        drawTriangleS(ctx, axisx.p2c(x), axisy.p2c(y), size, filled);
                        break;
                    case 'triangle_e':
                        drawTriangleE(ctx, axisx.p2c(x), axisy.p2c(y), size, filled);
                        break;
                    case 'triangle_w':
                        drawTriangleW(ctx, axisx.p2c(x), axisy.p2c(y), size, filled);
                        break;
                    case 'cross_v':
                        drawCrossV(ctx, axisx.p2c(x), axisy.p2c(y), size, filled);
                        break;
                    case 'cross_d':
                        drawCrossD(ctx, axisx.p2c(x), axisy.p2c(y), size);
                        break;
                    case 'diamond':
                        drawDiamond(ctx, axisx.p2c(x), axisy.p2c(y), size, filled);
                        break;
                    case 'asterisk':
                        drawAsterisk(ctx, axisx.p2c(x), axisy.p2c(y), size);
                        break;
                }
            }

            function decimate (serie, x, y, color, shape, size, buffer) {
                var found = false;
                var px = Math.round(serie.xaxis.p2c(x));
                var py = Math.round(serie.yaxis.p2c(y));
                var key = {x: px, y: py};
                var used = buffer.get(key);
                if (!used) {
                    buffer.set(key, [{color: color, size: size, shape: shape}]);
                } else {
                    for (var i = 0; i < used.length; i++) {
                        if (used[i].color === color &&
                            used[i].shape === shape &&
                            used[i].size === size) {
                            found = true;
                        }
                    }

                    used.push({color: color, size: size, shape: shape});
                    buffer.set(key, used);
                }

                return found;
            }

            /**
            **drawSeries(plot, ctx, serie)**

             Draws series as an scatter graph.
            */
            function drawSeries (plot, ctx, series) {
                var lastX, lastY;
                if (!series.data || !Array.isArray(series.data) || series.data.length === 0) {
                    return;
                }

                var buffer = new Map();
                var plotOffset = plot.getPlotOffset();
                ctx.save();
                ctx.translate(plotOffset.left, plotOffset.top);
                for (var i = 0; i < dataLen; i++) {
                    var x, y, color, shape, size;
                    if (isArrayOfObject) {
                        x = series.data[0][i].x;
                        y = series.data[0][i].y;
                        color = lookupColor(series.data[0][i].color);
                        shape = lookupShape(series.data[0][i].shape);
                        size = lookupSize(series.data[0][i].size);
                    } else if (isObjectOfArray) {
                        x = series.data[0].x[i];
                        y = series.data[0].y[i];
                        color = lookupColor(series.data[0].color ? series.data[0].color[i] : undefined);
                        shape = lookupShape(series.data[0].shape ? series.data[0].shape[i] : undefined);
                        size = lookupSize(series.data[0].size ? series.data[0].size[i] : undefined);
                    } else if (isArrayOfArray) {
                        x = series.data[0][i][0];
                        y = series.data[0][i][1];
                        color = lookupColor(series.data[0][i][2]);
                        shape = lookupShape(series.data[0][i][3]);
                        size = lookupSize(series.data[0][i][4]);
                    }

                    if (color.toLowerCase() === 'transparent' ||
                        shape.toLowerCase() === 'none' ||
                        size === 0 ||
                        (!opt.series.scattergraph.drawLines && decimate(series, x, y, color, shape, size, buffer))) {
                        continue;
                    }

                    drawPoint(ctx, x, y, series.xaxis, series.yaxis, 0, 0, color, shape, size, opt.series.scattergraph.lineWidth, opt.series.scattergraph.filled);
                    if (i > 0 && opt.series.scattergraph.drawLines) {
                        drawLine(ctx, series.xaxis, series.yaxis, lastX, lastY, x, y, series.color);
                    }

                    lastX = x;
                    lastY = y;
                }

                ctx.restore();
            };
        };
    };

    var scattergraph = new ScatterGraph();

    $.plot.plugins.push({
        init: scattergraph.init,
        options: scattergraph.defaultOptions,
        name: scattergraph.pluginName,
        version: scattergraph.pluginVersion
    });

    $.plot.scattergraph = scattergraph;
})(this, jQuery);
