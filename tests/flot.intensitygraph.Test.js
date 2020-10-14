/* brackets-xunit: includes=../lib/cbuffer.js,../jquery.flot.historybuffer.js*,../jquery.flot.js,../jquery.flot.charting.js */

describe('An Intensity graph', function() {
    'use strict';
    var $ = jQuery || NationalInstruments.Globals.jQuery;
    var colors = window.colors;
    var rgba = colors.rgba;
    var isClose = colors.isClose;
    var getPixelColor = colors.getPixelColor;
    var getScaledPixelColor = colors.getScaledPixelColor;

    var fixture, placeholder, plot;

    beforeEach(function() {
        fixture = setFixtures('<div id="demo-container" style="width: 400px;height: 150px">').find('#demo-container').get(0);

        placeholder = $('<div id="placeholder" style="width: 100%;height: 100%">');
        placeholder.appendTo(fixture);
    });

    it('should draw nothing when the graph is empty', function () {
        plot = $.plot(placeholder, [[[]]], {
            grid: {show: false},
            xaxis: {show: false},
            yaxis: {show: false},
            series: {
                intensitygraph: {
                    show: true
                }
            }
        });
        plot.draw();

        var ctx = $(placeholder).find('.flot-base').get(0).getContext('2d'),
            c = getPixelColor(ctx, ctx.canvas.width / 2, ctx.canvas.height / 2);
        expect(isClose(c, rgba(0, 0, 0, 0))).toBeTruthy();
    });

    it('should draw using the coresponding colors of the gradient', function () {
        plot = $.plot(placeholder, [[[0], [0.5], [1]]], {
            grid: {show: false},
            xaxis: {show: false},
            yaxis: {show: false},
            series: {
                intensitygraph: {
                    show: true,
                    gradient: [
                        { value: 0, color: 'red' },
                        { value: 1, color: 'blue' }
                    ]
                }
            }
        });
        plot.draw();

        var ctx = $(placeholder).find('.flot-base').get(0).getContext('2d'),
            c0 = getPixelColor(ctx, 1 * ctx.canvas.width / 8, ctx.canvas.height / 2),
            c1 = getPixelColor(ctx, 4 * ctx.canvas.width / 8, ctx.canvas.height / 2),
            c2 = getPixelColor(ctx, 7 * ctx.canvas.width / 8, ctx.canvas.height / 2);
        expect(isClose(c0, rgba(255, 0, 0, 1))).toBeTruthy();
        expect(isClose(c1, rgba(127, 0, 127, 1))).toBeTruthy();
        expect(isClose(c2, rgba(0, 0, 255, 1))).toBeTruthy();
    });

    it('should draw using the low and high colors', function () {
        plot = $.plot(placeholder, [[[0], [0.5], [1]]], {
            grid: {show: false},
            xaxis: {show: false},
            yaxis: {show: false},
            series: {
                intensitygraph: {
                    show: true,
                    min: 0.25,
                    max: 0.75,
                    lowColor: '#000000ff',
                    highColor: 'rgba(255,255,255,1)',
                    gradient: [
                        { value: 0.25, color: 'red' },
                        { value: 0.75, color: 'red' }
                    ]
                }
            }
        });
        plot.draw();

        var ctx = $(placeholder).find('.flot-base').get(0).getContext('2d'),
            c1 = getPixelColor(ctx, 1 * ctx.canvas.width / 8, ctx.canvas.height / 2),
            c2 = getPixelColor(ctx, 4 * ctx.canvas.width / 8, ctx.canvas.height / 2),
            c3 = getPixelColor(ctx, 7 * ctx.canvas.width / 8, ctx.canvas.height / 2);
        expect(isClose(c1, rgba(0, 0, 0, 1))).toBeTruthy();
        expect(isClose(c2, rgba(255, 0, 0, 1))).toBeTruthy();
        expect(isClose(c3, rgba(255, 255, 255, 1))).toBeTruthy();
    });

    it('should draw using the low color when there are more points per pixel', function () {
        plot = $.plot(placeholder, [createTestMatrix(1000, 1000, 0)], {
            grid: {show: false},
            xaxis: {show: false, autoScale: 'exact'},
            yaxis: {show: false, autoScale: 'exact'},
            series: {
                intensitygraph: {
                    show: true,
                    min: 0.25,
                    max: 0.75,
                    lowColor: 'rgba(0,0,0,1)',
                    highColor: 'rgba(255,255,255,1)',
                    gradient: [
                        { value: 0.25, color: 'red' },
                        { value: 0.75, color: 'red' }
                    ]
                }
            }
        });
        plot.draw();

        var ctx = $(placeholder).find('.flot-base').get(0).getContext('2d'),
            c = getPixelColor(ctx, ctx.canvas.width / 2, ctx.canvas.height / 2);
        expect(isClose(c, rgba(0, 0, 0, 1))).toBeTruthy();
    });

    it('should draw using the high color when there are more points per pixel', function () {
        plot = $.plot(placeholder, [createTestMatrix(1000, 1000, 1)], {
            grid: {show: false},
            xaxis: {show: false, autoScale: 'exact'},
            yaxis: {show: false, autoScale: 'exact'},
            series: {
                intensitygraph: {
                    show: true,
                    min: 0.25,
                    max: 0.75,
                    lowColor: 'rgba(0,0,0,1)',
                    highColor: 'rgba(255,255,255,1)',
                    gradient: [
                        { value: 0.25, color: 'red' },
                        { value: 0.75, color: 'red' }
                    ]
                }
            }
        });
        plot.draw();

        var ctx = $(placeholder).find('.flot-base').get(0).getContext('2d'),
            c = getPixelColor(ctx, ctx.canvas.width / 2, ctx.canvas.height / 2);
        expect(isClose(c, rgba(255, 255, 255, 1))).toBeTruthy();
    });

    it('should draw using the only color of the gradien when only one is specified', function () {
        plot = $.plot(placeholder, [[[0], [0.5], [1]]], {
            grid: {show: false},
            xaxis: {show: false},
            yaxis: {show: false},
            series: {
                intensitygraph: {
                    show: true,
                    min: 0,
                    max: 1,
                    lowColor: 'rgba(0,0,0,1)',
                    highColor: 'rgba(255,255,255,1)',
                    gradient: [
                        { value: 0.25, color: 'red' }
                    ]
                }
            }
        });
        plot.draw();

        var ctx = $(placeholder).find('.flot-base').get(0).getContext('2d'),
            c1 = getPixelColor(ctx, 1 * ctx.canvas.width / 8, ctx.canvas.height / 2),
            c2 = getPixelColor(ctx, 4 * ctx.canvas.width / 8, ctx.canvas.height / 2),
            c3 = getPixelColor(ctx, 7 * ctx.canvas.width / 8, ctx.canvas.height / 2);
        expect(isClose(c1, rgba(255, 0, 0, 1))).toBeTruthy();
        expect(isClose(c2, rgba(255, 0, 0, 1))).toBeTruthy();
        expect(isClose(c3, rgba(255, 0, 0, 1))).toBeTruthy();
    });

    it('should work with a gradient of a arbitrary limits', function () {
        plot = $.plot(placeholder, [[[-0.5], [0], [0.5], [1], [1.5]]], {
            grid: {show: false},
            xaxis: {show: false},
            yaxis: {show: false},
            series: {
                intensitygraph: {
                    show: true,
                    min: 0,
                    max: 1,
                    lowColor: 'rgba(0,0,0,1)',
                    highColor: 'rgba(255,255,255,1)',
                    gradient: [
                        { value: -0.5, color: 'red' },
                        { value: 0.5, color: 'yellow' },
                        { value: 1.5, color: 'blue' }
                    ]
                }
            }
        });
        plot.draw();

        var ctx = $(placeholder).find('.flot-base').get(0).getContext('2d'),
            c1 = getPixelColor(ctx, 1 * ctx.canvas.width / 10, ctx.canvas.height / 2),
            c2 = getPixelColor(ctx, 3 * ctx.canvas.width / 10, ctx.canvas.height / 2),
            c3 = getPixelColor(ctx, 5 * ctx.canvas.width / 10, ctx.canvas.height / 2),
            c4 = getPixelColor(ctx, 7 * ctx.canvas.width / 10, ctx.canvas.height / 2),
            c5 = getPixelColor(ctx, 9 * ctx.canvas.width / 10, ctx.canvas.height / 2);
        expect(isClose(c1, rgba(0, 0, 0, 1))).toBeTruthy();
        expect(isClose(c2, rgba(255, 0, 0, 1))).toBeTruthy();
        expect(isClose(c3, rgba(255, 255, 0, 1))).toBeTruthy();
        expect(isClose(c4, rgba(0, 0, 255, 1))).toBeTruthy();
        expect(isClose(c5, rgba(255, 255, 255, 1))).toBeTruthy();
    });

    it('should ignore the values of the gradient outside the minimum and maximum limits', function () {
        plot = $.plot(placeholder, [[[-0.5], [0], [0.5], [1], [1.5]]], {
            grid: {show: false},
            xaxis: {show: false},
            yaxis: {show: false},
            series: {
                intensitygraph: {
                    show: true,
                    min: 0,
                    max: 1,
                    lowColor: 'rgba(0,0,0,1)',
                    highColor: 'rgba(255,255,255,1)',
                    gradient: [
                        { value: -0.5, color: 'red' },
                        { value: 2.5, color: 'yellow' },
                        { value: 1.5, color: 'blue' }
                    ]
                }
            }
        });
        plot.draw();

        var ctx = $(placeholder).find('.flot-base').get(0).getContext('2d'),
            c1 = getPixelColor(ctx, 1 * ctx.canvas.width / 10, ctx.canvas.height / 2),
            c2 = getPixelColor(ctx, 3 * ctx.canvas.width / 10, ctx.canvas.height / 2),
            c3 = getPixelColor(ctx, 5 * ctx.canvas.width / 10, ctx.canvas.height / 2),
            c4 = getPixelColor(ctx, 7 * ctx.canvas.width / 10, ctx.canvas.height / 2),
            c5 = getPixelColor(ctx, 9 * ctx.canvas.width / 10, ctx.canvas.height / 2);
        expect(isClose(c1, rgba(0, 0, 0, 1))).toBeTruthy();
        expect(isClose(c2, rgba(255, 0, 0, 1))).toBeTruthy();
        expect(isClose(c3, rgba(127, 0, 127, 1))).toBeTruthy();
        expect(isClose(c4, rgba(0, 0, 255, 1))).toBeTruthy();
        expect(isClose(c5, rgba(255, 255, 255, 1))).toBeTruthy();
    });

    it('should draw nothing when the limits of the x axis are negative', function () {
        plot = $.plot(placeholder, [[[0], [0.5], [1]]], {
            grid: {show: false},
            xaxis: {show: true, min: -10, max: -5, autoScale: 'none'},
            yaxis: {show: true},
            series: {
                intensitygraph: {
                    show: true,
                    gradient: [
                        { value: 0, color: 'red' },
                        { value: 1, color: 'blue' }
                    ]
                }
            }
        });
        plot.draw();

        var ctx = $(placeholder).find('.flot-base').get(0).getContext('2d'),
            c0 = getPixelColor(ctx, 1 * ctx.canvas.width / 8, ctx.canvas.height / 2),
            c1 = getPixelColor(ctx, 4 * ctx.canvas.width / 8, ctx.canvas.height / 2),
            c2 = getPixelColor(ctx, 7 * ctx.canvas.width / 8, ctx.canvas.height / 2);
        expect(isClose(c0, rgba(0, 0, 0, 0))).toBeTruthy();
        expect(isClose(c1, rgba(0, 0, 0, 0))).toBeTruthy();
        expect(isClose(c2, rgba(0, 0, 0, 0))).toBeTruthy();
    });

    it('should draw nothing when the limits of the x axis are above the data width', function () {
        plot = $.plot(placeholder, [[[0], [0.5], [1]]], {
            grid: {show: false},
            xaxis: {show: false, min: 5, max: 10, autoScale: 'none'},
            yaxis: {show: false},
            series: {
                intensitygraph: {
                    show: true,
                    gradient: [
                        { value: 0, color: 'red' },
                        { value: 1, color: 'blue' }
                    ]
                }
            }
        });
        plot.draw();

        var ctx = $(placeholder).find('.flot-base').get(0).getContext('2d'),
            c0 = getPixelColor(ctx, 1 * ctx.canvas.width / 8, ctx.canvas.height / 2),
            c1 = getPixelColor(ctx, 4 * ctx.canvas.width / 8, ctx.canvas.height / 2),
            c2 = getPixelColor(ctx, 7 * ctx.canvas.width / 8, ctx.canvas.height / 2);
        expect(isClose(c0, rgba(0, 0, 0, 0))).toBeTruthy();
        expect(isClose(c1, rgba(0, 0, 0, 0))).toBeTruthy();
        expect(isClose(c2, rgba(0, 0, 0, 0))).toBeTruthy();
    });

    it('should draw nothing when the limits of the y axis are negative', function () {
        plot = $.plot(placeholder, [[[0], [0.5], [1]]], {
            grid: {show: false},
            xaxis: {show: false},
            yaxis: {show: false, min: -10, max: -5, autoScale: 'none'},
            series: {
                intensitygraph: {
                    show: true,
                    gradient: [
                        { value: 0, color: 'red' },
                        { value: 1, color: 'blue' }
                    ]
                }
            }
        });
        plot.draw();

        var ctx = $(placeholder).find('.flot-base').get(0).getContext('2d'),
            c0 = getPixelColor(ctx, 1 * ctx.canvas.width / 8, ctx.canvas.height / 2),
            c1 = getPixelColor(ctx, 4 * ctx.canvas.width / 8, ctx.canvas.height / 2),
            c2 = getPixelColor(ctx, 7 * ctx.canvas.width / 8, ctx.canvas.height / 2);
        expect(isClose(c0, rgba(0, 0, 0, 0))).toBeTruthy();
        expect(isClose(c1, rgba(0, 0, 0, 0))).toBeTruthy();
        expect(isClose(c2, rgba(0, 0, 0, 0))).toBeTruthy();
    });

    it('should draw nothing when the limits of the y axis are above the data height', function () {
        plot = $.plot(placeholder, [[[0], [0.5], [1]]], {
            grid: {show: false},
            xaxis: {show: false},
            yaxis: {show: false, min: 5, max: 10, autoScale: 'none'},
            series: {
                intensitygraph: {
                    show: true,
                    gradient: [
                        { value: 0, color: 'red' },
                        { value: 1, color: 'blue' }
                    ]
                }
            }
        });
        plot.draw();

        var ctx = $(placeholder).find('.flot-base').get(0).getContext('2d'),
            c0 = getPixelColor(ctx, 1 * ctx.canvas.width / 8, ctx.canvas.height / 2),
            c1 = getPixelColor(ctx, 4 * ctx.canvas.width / 8, ctx.canvas.height / 2),
            c2 = getPixelColor(ctx, 7 * ctx.canvas.width / 8, ctx.canvas.height / 2);
        expect(isClose(c0, rgba(0, 0, 0, 0))).toBeTruthy();
        expect(isClose(c1, rgba(0, 0, 0, 0))).toBeTruthy();
        expect(isClose(c2, rgba(0, 0, 0, 0))).toBeTruthy();
    });

    it('should draw a piece of data when the axis limits are not perfectly matching the data width and height 1', function () {
        /*
                        y  +--------------------------------+
                           |                                |
                           |                   view         |
                           |                                |
                +--------------------------------+          |
                |          |          |          |          |
                |          |          |   blue   |          |
                |          |   c00    |   c01    |   c02    |
                +----------O--------------------------------+
                |          |          |          |
                |   red    |          |          |          x
                |          |          |          |
                +--------------------------------+
        */
        plot = $.plot(placeholder, [[[0.0, 0.6],
            [0.2, 0.8],
            [0.4, 1.0]]], {
            grid: {show: true},
            xaxis: {show: true, min: 1, max: 4, autoScale: 'none'},
            yaxis: {show: true, min: 1, max: 3, autoScale: 'none'},
            series: {
                intensitygraph: {
                    show: true,
                    gradient: [
                        { value: 0, color: 'red' },
                        { value: 1, color: 'blue' }
                    ]
                }
            }
        });
        plot.draw();

        var ctx = $(placeholder).find('.flot-base').get(0).getContext('2d'),
            c00 = getPixelColor(ctx, 1 * ctx.canvas.width / 8, 2 * ctx.canvas.height / 3),
            c01 = getPixelColor(ctx, 4 * ctx.canvas.width / 8, 2 * ctx.canvas.height / 3),
            c02 = getPixelColor(ctx, 7 * ctx.canvas.width / 8, 2 * ctx.canvas.height / 3);
        expect(isClose(c00, rgba(1 * 255 / 5, 0, 4 * 255 / 5, 1))).toBeTruthy();
        expect(isClose(c01, rgba(0 * 255 / 5, 0, 5 * 255 / 5, 1))).toBeTruthy();
        expect(isClose(c02, rgba(0, 0, 0, 0))).toBeTruthy();
    });

    it('should draw a piece of data when the axis limits are not perfectly matching the data width and height 2', function () {
        /*
                           +--------------------------------+
                           |          |          |          |
                           |          |          |   blue   |
                           |          |          |          |
            y   +-------------------------------------------+
                |          |          |          |          |
                |          |   red    |          |          |
                |   c10    |   c11    |   c12    |          |
                |          +--------------------------------+
                |                                |
                |      view                      |
                |                                |
                O--------------------------------+

                                                 x
        */
        plot = $.plot(placeholder, [[[0.0, 0.6],
            [0.2, 0.8],
            [0.4, 1.0]]], {
            grid: {show: true},
            xaxis: {show: true, min: -1, max: 2, autoScale: 'none'},
            yaxis: {show: true, min: -1, max: 1, autoScale: 'none'},
            series: {
                intensitygraph: {
                    show: true,
                    gradient: [
                        { value: 0, color: 'red' },
                        { value: 1, color: 'blue' }
                    ]
                }
            }
        });
        plot.draw();

        var ctx = $(placeholder).find('.flot-base').get(0).getContext('2d'),
            c10 = getPixelColor(ctx, 1 * ctx.canvas.width / 8, 1 * ctx.canvas.height / 3),
            c11 = getPixelColor(ctx, 4 * ctx.canvas.width / 8, 1 * ctx.canvas.height / 3),
            c12 = getPixelColor(ctx, 7 * ctx.canvas.width / 8, 1 * ctx.canvas.height / 3);
        expect(isClose(c10, rgba(0, 0, 0, 0))).toBeTruthy();
        expect(isClose(c11, rgba(5 * 255 / 5, 0, 0 * 255 / 5, 1))).toBeTruthy();
        expect(isClose(c12, rgba(4 * 255 / 5, 0, 1 * 255 / 5, 1))).toBeTruthy();
    });

    it('should not throw when the size of the plot is not an integer value', function () {
        $(placeholder).css('padding', '10%');
        $(placeholder).css('width', '89.43px');
        $(placeholder).css('height', '98.76px');

        var run = function() {
            plot = $.plot(placeholder, [createTestMatrix(60, 80)], {
                series: {
                    intensitygraph: {
                        show: true
                    }
                },
                xaxes: [{
                    show: false,
                    min: -100,
                    max: 1000,
                    autoScale: 'none'
                }],
                yaxes: [{
                    show: false,
                    min: -9.3,
                    max: 1000,
                    autoScale: 'none'
                }],
                plotWidth: 123.45,
                plotHeight: 234.56
            });
            plot.draw();
        };
        expect(run).not.toThrow();
    });

    [true, false].forEach(function(type) {
        var typeStr = type ? 'point by point' : 'rect by rect',
            size = type ? 1000 : 100;
        [1, 2, 3].forEach(function(borderWidth) {
            it('should not overflow over a border having width = ' + borderWidth + ' when completely filling ' + typeStr, function() {
                plot = $.plot(placeholder, [createTestMatrix(size, size, 1)], {
                    grid: {show: true, borderColor: 'rgba(0,255,0,1)', borderWidth: borderWidth, minBorderMargin: 0},
                    xaxis: {show: false, autoScale: 'exact'},
                    yaxis: {show: false, autoScale: 'exact'},
                    series: {
                        intensitygraph: {
                            show: true,
                            gradient: [
                                { value: 1, color: 'rgba(255,0,0,1)' }
                            ]
                        }
                    }
                });

                var ctx = $(placeholder).find('.flot-base').get(0).getContext('2d'),
                    borderColors = [];
                for (var i = 0; i < borderWidth; i++) {
                    borderColors.push(getPixelColor(ctx, ctx.canvas.width / 2, i));
                    borderColors.push(getPixelColor(ctx, ctx.canvas.width - 1 - i, ctx.canvas.height / 2));
                    borderColors.push(getPixelColor(ctx, ctx.canvas.width / 2, ctx.canvas.height - 1 - i));
                    borderColors.push(getPixelColor(ctx, i, ctx.canvas.height / 2));
                }
                borderColors.forEach(function(bc) {
                    expect(isClose(bc, rgba(0, 255, 0, 1))).toBeTruthy();
                });

                var nearBorderColors = [];
                nearBorderColors.push(getPixelColor(ctx, ctx.canvas.width / 2, borderWidth));
                nearBorderColors.push(getPixelColor(ctx, ctx.canvas.width - 1 - borderWidth, ctx.canvas.height / 2));
                nearBorderColors.push(getPixelColor(ctx, ctx.canvas.width / 2, ctx.canvas.height - 1 - borderWidth));
                nearBorderColors.push(getPixelColor(ctx, borderWidth, ctx.canvas.height / 2));
                nearBorderColors.forEach(function(nbc) {
                    expect(isClose(nbc, rgba(255, 0, 0, 1))).toBeTruthy();
                });
            });
        });
    });

    [[true, 4, 2], [true, 4, 1], [false, 4, 2], [false, 4, 1]].forEach(function(tc) {
        var typeStr = tc[0] ? 'point by point' : 'rect by rect',
            size = tc[0] ? 1000 : 50,
            borderWidth = tc[1], pixelRatio = tc[2];
            //  1. borderWidth * pixelRatio must be int to make sure the border is crisp
            //or at least almost crisp so this test doesn't have to include roundings
            //  2. When testing using pixelRatio smaller than 1 (for example 0.5)
            //the test is failing in Edge and IE even though the algorithm of the
            //intensity graph is producing the same side effects on the target canvas.
            //The main difference must be the scaling algorithm, but not sure because
            //while debugging the canvas is not visible.
        it('should not overflow over a border having width = ' + borderWidth + ' when completely filling ' + typeStr + ' pixelRatio = ' + pixelRatio, function() {
            plot = $.plot(placeholder, [createTestMatrix(size, size, 1)], {
                grid: {show: true, borderColor: 'rgba(0,255,0,1)', borderWidth: borderWidth, minBorderMargin: 0},
                xaxis: {show: false, autoScale: 'exact'},
                yaxis: {show: false, autoScale: 'exact'},
                series: {
                    intensitygraph: {
                        show: true,
                        gradient: [
                            { value: 1, color: 'rgba(255,0,0,1)' }
                        ]
                    }
                }
            });

            //  This function will increase the backing store matrix size and
            //scales the with and height with the specified pixelRatio. The
            //element style size remains the same so the user will not notice
            //the scaling because the backing strore matrix will be squeezed
            //or streched to fill element style size.
            setPixelRatio(plot, pixelRatio);

            var ctx = $(placeholder).find('.flot-base').get(0).getContext('2d'),
                //  These are the width and height of the element (the visible matrix)
                width = px(ctx.canvas.style.width), height = px(ctx.canvas.style.height),
                borderColors = [];
            for (var i = 0; i < borderWidth; i++) {
                //  Here the actual backing store matrix is probed so the
                //element coordinates have to be translated to the backing store
                //coordinates.
                borderColors.push(getScaledPixelColor(ctx, pixelRatio, width / 2, i));
                borderColors.push(getScaledPixelColor(ctx, pixelRatio, width - 1 - i, height / 2));
                borderColors.push(getScaledPixelColor(ctx, pixelRatio, width / 2, height - 1 - i));
                borderColors.push(getScaledPixelColor(ctx, pixelRatio, i, height / 2));
            }
            borderColors.forEach(function(bc) {
                expect(isClose(bc, rgba(0, 255, 0, 1))).toBeTruthy();
            });

            var nearBorderColors = [];
            nearBorderColors.push(getScaledPixelColor(ctx, pixelRatio, width / 2, borderWidth));
            nearBorderColors.push(getScaledPixelColor(ctx, pixelRatio, width - 1 - borderWidth, height / 2));
            nearBorderColors.push(getScaledPixelColor(ctx, pixelRatio, width / 2, height - 1 - borderWidth));
            nearBorderColors.push(getScaledPixelColor(ctx, pixelRatio, borderWidth, height / 2));
            nearBorderColors.forEach(function(nbc) {
                expect(isClose(nbc, rgba(255, 0, 0, 1))).toBeTruthy();
            });
        });
    });

    [false, true].forEach(function(visibleBorder, index) {
        var visibleBorderText = visibleBorder ? 'visible' : 'not visible';

        it('should fill the entire area when the axes limits are non integers and the data is zoomed in and the border is ' + visibleBorderText, function () {
            plot = $.plot(placeholder, [createTestMatrix(40, 60)], {
                grid: {show: visibleBorder},
                xaxis: {show: visibleBorder, min: 1.123, max: 3.456, autoScale: 'none'},
                yaxis: {show: visibleBorder, min: 2.345, max: 5.678, autoScale: 'none'},
                series: {
                    intensitygraph: {
                        show: true,
                        gradient: [
                            { value: 0, color: 'rgba(255,0,0,0.5)' },
                            { value: 1, color: 'rgba(0,0,255,0.5)' }
                        ]
                    }
                }
            });
            plot.draw();

            // check the color of random pixels not to be empty
            // avoid the border and axes when they are visible
            var ctx = $(placeholder).find('.flot-base').get(0).getContext('2d'),
                steps = 10, start = visibleBorder ? 2 : 0, stop = visibleBorder ? steps - 2 : 0;
            for (var i = start; i < stop; i++) {
                for (var j = start; j < stop; j++) {
                    var c = getPixelColor(ctx, i * ctx.canvas.width / steps, j * ctx.canvas.height / steps);
                    expect(isClose(c, rgba(0, 0, 0, 0))).toBeFalsy();
                }
            }
        });

        it('should align the points with the axis ticks when the border is ' + visibleBorderText, function () {
            /*
            test matrix:

                    ^ y
                    |
                3   | M B G R
                2   | R M B G
                1   | G R M B
                0   | B G R M    x
                    ------------->
                      0 1 2 3
            */
            var testMatrix = [[0, 1, 2, 3], [1, 2, 3, 0], [2, 3, 0, 1], [3, 0, 1, 2]];
            plot = $.plot(placeholder, [testMatrix], {
                grid: {show: visibleBorder},
                xaxis: {show: visibleBorder, min: 1.234, max: 3.456, autoScale: 'none'},
                yaxis: {show: visibleBorder, min: 0.123, max: 2.345, autoScale: 'none'},
                series: {
                    intensitygraph: {
                        show: true,
                        min: 0,
                        max: 3,
                        gradient: [
                            { value: 0, color: 'rgba(0,0,255,0.5)' },
                            { value: 1, color: 'rgba(0,255,0,0.5)' },
                            { value: 2, color: 'rgba(255,0,0,0.5)' },
                            { value: 3, color: 'rgba(255,0,255,0.5)' }
                        ]
                    }
                }
            });

            var ctx = $(placeholder).find('.flot-base').get(0).getContext('2d');

            // testing the colors of the center of the test matrix which is
            //not aligned with the center of the canvas/drawing area
            var e = 0.1; //error caused by scaling up the pixel in rect by rect mode
            expect(isClose(
                getPixelColor(ctx, cx(2 - e), cy(2 - e)), rgba(255, 0, 0, 0.5))).toBeTruthy();
            expect(isClose(
                getPixelColor(ctx, cx(2 - e), cy(2 + e)), rgba(255, 0, 255, 0.5))).toBeTruthy();
            expect(isClose(
                getPixelColor(ctx, cx(2 + e), cy(2 - e)), rgba(255, 0, 255, 0.5))).toBeTruthy();
            expect(isClose(
                getPixelColor(ctx, cx(2 + e), cy(2 + e)), rgba(0, 0, 255, 0.5))).toBeTruthy();
        });

        function cx(value) {
            var axis = plot.getXAxes()[0],
                offset = plot.getPlotOffset();
            return axis.p2c(value) + offset.left;
        }

        function cy(value) {
            var axis = plot.getYAxes()[0],
                offset = plot.getPlotOffset();
            return axis.p2c(value) + offset.top;
        }
    });

    it('should draw using the higher color when there are more points per pixel', function () {
        /*
            0101010101
            1010101010              11111
            0101010101      =>      11111
            1010101010              11111
            0101010101
        */
        plot = $.plot(placeholder, [createPatternTestMatrix(500, 300)], {
            grid: {show: true},
            xaxis: {show: true, min: -100, max: 600, autoScale: 'none'},
            yaxis: {show: true, min: -100, max: 400, autoScale: 'none'},
            series: {
                intensitygraph: {
                    show: true,
                    gradient: [
                        { value: 0, color: 'red' },
                        { value: 1, color: 'blue' }
                    ]
                }
            }
        });
        plot.draw();

        var ctx = $(placeholder).find('.flot-base').get(0).getContext('2d');

        // check the color of random sequence of pixels in the center of the canvas
        // there are so many points squeezed per pixel that the drawing area should be blue
        for (var i = 0; i < 5; i++) {
            for (var j = 0; j < 5; j++) {
                var c = getPixelColor(ctx, ctx.canvas.width / 2 + i, ctx.canvas.height / 2 + j);
                expect(isClose(c, rgba(0, 0, 255, 1))).toBeTruthy();
            }
        }
    });

    it('should draw using the higher color when there are more points per pixel 2', function () {
        /*
            000000000000
            011111111110              1xxxxx
            010000000010              10000x
            010000000010      =>      10000x
            010000000010              10000x
            011111111110              111111
            000000000000

            0 = red, 1 = blue, x = unknown
        */
        plot = $.plot(placeholder, [createBorderTestMatrix(1000, 1000)], {
            grid: {show: false},
            xaxis: {show: false, autoScale: 'exact'},
            yaxis: {show: false, autoScale: 'exact'},
            series: {
                intensitygraph: {
                    show: true,
                    gradient: [
                        { value: 0, color: 'red' },
                        { value: 1, color: 'blue' }
                    ]
                }
            }
        });
        plot.draw();

        var ctx = $(placeholder).find('.flot-base').get(0).getContext('2d'),
            insideColor = getPixelColor(ctx, ctx.canvas.width / 2, ctx.canvas.height / 2),
            leftBorderColor = getPixelColor(ctx, 0, ctx.canvas.height / 2),
            bottomBorderColor = getPixelColor(ctx, ctx.canvas.width / 2, ctx.canvas.height - 1);
        expect(isClose(insideColor, rgba(255, 0, 0, 1))).toBeTruthy();
        expect(isClose(leftBorderColor, rgba(0, 0, 255, 1))).toBeTruthy();
        expect(isClose(bottomBorderColor, rgba(0, 0, 255, 1))).toBeTruthy();
    });

    it('should use colorscale limits for data color when autoScale = exact', function() {
        plot = $.plot(placeholder, [[[0.1, 0.5]]], {
            xaxis: {show: false, autoScale: 'exact'},
            yaxes: [{show: false, autoScale: 'exact'
            }, {
                position: 'right',
                show: true,
                min: 0.1,
                max: 0.5,
                autoScale: 'exact',
                type: 'colorScale'
            }],
            series: {
                intensitygraph: {
                    show: true,
                    gradient: [
                        { value: 0, color: 'red' },
                        { value: 1, color: 'blue' }
                    ]
                }
            }
        });

        plot.draw();

        var colorScaleAxis = plot.getYAxes()[1];
        expect(colorScaleAxis.min).toEqual(0.1);
        expect(colorScaleAxis.max).toEqual(0.5);
        var ctx = $(placeholder).find('.flot-base').get(0).getContext('2d'),
            bottomColor = getPixelColor(ctx, ctx.canvas.width / 2 + 20, ctx.canvas.height - 30),
            topColor = getPixelColor(ctx, 10, ctx.canvas.height / 2 - 20);
        expect(isClose(topColor, rgba(0, 0, 255, 1))).toBeTruthy();
        expect(isClose(bottomColor, rgba(255, 0, 0, 1))).toBeTruthy();
    });

    it('should draw all values for axis min = 0.1', function() {
        plot = $.plot(placeholder, [[[0, 1]]], {
            xaxis: {show: true, autoScale: 'none', min: 0.1, max: 1, showTickLabels: 'all'},
            yaxis: {show: true, autoScale: 'none', min: 0.1, max: 2, showTickLabels: 'all'},
            series: {
                intensitygraph: {
                    show: true,
                    gradient: [
                        { value: 0, color: 'red' },
                        { value: 1, color: 'blue' }
                    ]
                }
            }
        });

        plot.draw();
        var ctx = $(placeholder).find('.flot-base').get(0).getContext('2d'),
            topColor = getPixelColor(ctx, ctx.canvas.width / 2, ctx.canvas.height / 2 - 20),
            bottomColor = getPixelColor(ctx, ctx.canvas.width / 2, ctx.canvas.height / 2 + 20);
        expect(isClose(topColor, rgba(0, 0, 255, 1))).toBeTruthy();
        expect(isClose(bottomColor, rgba(255, 0, 0, 1))).toBeTruthy();
    });

    it('should return nearby item when given coordinates within drawn rects', function () {
        plot = $.plot(placeholder, [[[0], [0.5], [1]]], {
            grid: {show: false},
            xaxis: {show: false},
            yaxis: {show: false},
            series: {
                intensitygraph: {
                    show: true,
                    gradient: [
                        { value: 0, color: 'red' },
                        { value: 1, color: 'blue' }
                    ]
                }
            }
        });
        plot.draw();

        let ctx = $(placeholder).find('.flot-base').get(0).getContext('2d');
        let seriesFilter = () => true;
        let nearbyItem1 = plot.findNearbyItem(1 * ctx.canvas.width / 8, ctx.canvas.height / 2, seriesFilter, 1);
        expect(nearbyItem1.datapoint).toEqual([0, 0, 0]);
        let nearbyItem2 = plot.findNearbyItem(4 * ctx.canvas.width / 8, ctx.canvas.height / 2, seriesFilter, 1);
        expect(nearbyItem2.datapoint).toEqual([1, 0, 0.5]);
        let nearbyItem3 = plot.findNearbyItem(7 * ctx.canvas.width / 8, ctx.canvas.height / 2, seriesFilter, 1);
        expect(nearbyItem3.datapoint).toEqual([2, 0, 1]);
    });

    it('should return multiple nearby items when search radius is large', function () {
        plot = $.plot(placeholder, [[[0], [0.5], [1]]], {
            grid: {show: false},
            xaxis: {show: false},
            yaxis: {show: false},
            series: {
                intensitygraph: {
                    show: true,
                    gradient: [
                        { value: 0, color: 'red' },
                        { value: 1, color: 'blue' }
                    ]
                }
            }
        });
        plot.draw();

        let ctx = $(placeholder).find('.flot-base').get(0).getContext('2d');
        let seriesFilter = () => true;
        let nearbyItems = plot.findNearbyItems(3 * ctx.canvas.width / 8, ctx.canvas.height / 2, seriesFilter, 100);
        expect(nearbyItems[0].datapoint).toEqual([1, 0, 0.5]);
        expect(nearbyItems[1].datapoint).toEqual([0, 0, 0]);
    });

    it('should not return nearby item when given coordinates far from drawn rects', function () {
        plot = $.plot(placeholder, [[[0], [0.5], [1]]], {
            grid: {show: false},
            xaxis: {show: false},
            yaxis: {show: false},
            series: {
                intensitygraph: {
                    show: true,
                    gradient: [
                        { value: 0, color: 'red' },
                        { value: 1, color: 'blue' }
                    ]
                }
            }
        });
        plot.draw();

        let ctx = $(placeholder).find('.flot-base').get(0).getContext('2d');
        let seriesFilter = () => true;
        let nearbyItem1 = plot.findNearbyItem(ctx.canvas.width * 1.1, ctx.canvas.height / 2, seriesFilter, 1);
        expect(nearbyItem1).toBeNull();
        let nearbyItem2 = plot.findNearbyItem(ctx.canvas.width / 2, ctx.canvas.height * 1.1, seriesFilter, 1);
        expect(nearbyItem2).toBeNull();
    });
});
