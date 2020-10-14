/*globals NationalInstruments, createPatternTestMatrix*/

describe('An Intensity graph with log axes', function() {
    'use strict';
    var $ = jQuery || NationalInstruments.Globals.jQuery;
    var colors = window.colors;
    var rgba = colors.rgba;

    var fixture, placeholder, plot;

    beforeEach(function() {
        fixture = setFixtures('<div id="demo-container" style="width: 400px;height: 150px">').find('#demo-container').get(0);

        placeholder = $('<div id="placeholder" style="width: 100%;height: 100%">');
        placeholder.appendTo(fixture);

        jasmine.addMatchers(colors.jasmineMatchers);
    });

    [0, 1, 2].forEach(function(borderWidth) {
        it('should use the log mode of the x axis when borderWidth = ' + borderWidth, function () {
            plot = $.plot(placeholder, [[[0, 0], [1, 1], [2, 2]]], {
                grid: {show: borderWidth > 0, borderWidth: borderWidth},
                xaxis: {show: false, mode: 'log', autoScale: 'none', min: 0.01, max: 3},
                yaxis: {show: false, autoScale: 'none', min: 1, max: 2},
                series: {
                    intensitygraph: {
                        show: true,
                        min: 0,
                        max: 2,
                        gradient: [
                            { value: 0, color: 'red' },
                            { value: 1, color: 'lime' },
                            { value: 2, color: 'blue' }
                        ]
                    }
                }
            });

            var xaxis = plot.getXAxes()[0],
                yaxis = plot.getYAxes()[0];
            expect(rgba(255, 0, 0, 1)).toFillPixel(plot, xaxis.p2c(0.1), yaxis.p2c(1.5));
            expect(rgba(255, 0, 0, 1)).toFillPixel(plot, xaxis.p2c(0.9), yaxis.p2c(1.5));
            expect(rgba(0, 255, 0, 1)).toFillPixel(plot, xaxis.p2c(1.1), yaxis.p2c(1.5));
            expect(rgba(0, 255, 0, 1)).toFillPixel(plot, xaxis.p2c(1.9), yaxis.p2c(1.5));
            expect(rgba(0, 0, 255, 1)).toFillPixel(plot, xaxis.p2c(2.1), yaxis.p2c(1.5));
            expect(rgba(0, 0, 255, 1)).toFillPixel(plot, xaxis.p2c(2.9), yaxis.p2c(1.5));
        });

        it('should use the log mode of the y axis when borderWidth = ' + borderWidth, function () {
            plot = $.plot(placeholder, [[[0, 1, 2], [0, 1, 2]]], {
                grid: {show: borderWidth > 0, borderWidth: borderWidth},
                xaxis: {show: false, autoScale: 'none', min: 1, max: 2},
                yaxis: {show: false, mode: 'log', autoScale: 'none', min: 0.01, max: 3},
                series: {
                    intensitygraph: {
                        show: true,
                        min: 0,
                        max: 2,
                        gradient: [
                            { value: 0, color: 'red' },
                            { value: 1, color: 'lime' },
                            { value: 2, color: 'blue' }
                        ]
                    }
                }
            });

            var xaxis = plot.getXAxes()[0],
                yaxis = plot.getYAxes()[0];
            expect(rgba(255, 0, 0, 1)).toFillPixel(plot, xaxis.p2c(1.5), yaxis.p2c(0.1));
            expect(rgba(255, 0, 0, 1)).toFillPixel(plot, xaxis.p2c(1.5), yaxis.p2c(0.9));
            expect(rgba(0, 255, 0, 1)).toFillPixel(plot, xaxis.p2c(1.5), yaxis.p2c(1.1));
            expect(rgba(0, 255, 0, 1)).toFillPixel(plot, xaxis.p2c(1.5), yaxis.p2c(1.9));
            expect(rgba(0, 0, 255, 1)).toFillPixel(plot, xaxis.p2c(1.5), yaxis.p2c(2.1));
            expect(rgba(0, 0, 255, 1)).toFillPixel(plot, xaxis.p2c(1.5), yaxis.p2c(2.9));
        });

        it('should use the log mode of the x and y axes when borderWidth = ' + borderWidth, function () {
            plot = $.plot(placeholder, [[[-1, -2, -3], [0, 1, 2], [5, 3, 4]]], {
                grid: {show: borderWidth > 0, borderWidth: borderWidth},
                xaxis: {show: false, mode: 'log', autoScale: 'none', min: 0.1, max: 3},
                yaxis: {show: false, mode: 'log', autoScale: 'none', min: 0.1, max: 3},
                series: {
                    intensitygraph: {
                        show: true,
                        min: -3,
                        max: 5,
                        gradient: [
                            { value: -3, color: 'cyan' },
                            { value: -2, color: 'orange' },
                            { value: -1, color: 'brown' },
                            { value: 0, color: 'red' },
                            { value: 1, color: 'lime' },
                            { value: 2, color: 'blue' },
                            { value: 3, color: 'aqua' },
                            { value: 4, color: 'black' },
                            { value: 5, color: 'yellow' }
                        ]
                    }
                }
            });

            var xaxis = plot.getXAxes()[0],
                yaxis = plot.getYAxes()[0];
            expect(rgba(0, 255, 0, 1)).toFillPixel(plot, xaxis.p2c(1.9), yaxis.p2c(1.9));
            expect(rgba(0, 0, 255, 1)).toFillPixel(plot, xaxis.p2c(1.1), yaxis.p2c(2.1));
            expect(rgba(0, 255, 255, 1)).toFillPixel(plot, xaxis.p2c(2.1), yaxis.p2c(1.9));
            expect(rgba(0, 0, 0, 1)).toFillPixel(plot, xaxis.p2c(2.1), yaxis.p2c(2.1));
        });

        it('should draw using the higher color when there are more points per pixel in a horizontal line when borderWidth = ' + borderWidth, function () {
            /*
                0101010101010101010101010101010101 => 00011100110111111
            */
            plot = $.plot(placeholder, [createPatternTestMatrix(2000, 2)], {
                grid: {show: borderWidth > 0, borderWidth: borderWidth},
                xaxis: {show: false, mode: 'log', autoScale: 'none', min: 1, max: 2000},
                yaxis: {show: false, mode: 'log', autoScale: 'none', min: 1, max: 2},
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

            // check the color of random sequence of pixels in the right of the canvas
            // there are so many points squeezed per pixel that the drawing area should be blue
            for (var i = 1; i < 5; i++) {
                expect(rgba(0, 0, 255, 1)).toFillPixel(plot, plot.width() - i, plot.height() / 2);
            }
        });

        it('should draw using the higher color when there are more points per pixel in a vertical line when borderWidth = ' + borderWidth, function () {
            /*
                0101010101010101010101010101010101 => 00011100110111111
            */
            plot = $.plot(placeholder, [createPatternTestMatrix(2, 2000)], {
                grid: {show: borderWidth > 0, borderWidth: borderWidth},
                xaxis: {show: false, mode: 'log', autoScale: 'none', min: 1, max: 2},
                yaxis: {show: false, mode: 'log', autoScale: 'none', min: 1, max: 2000},
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

            // check the color of random sequence of pixels at the top of the canvas
            // there are so many points squeezed per pixel that the drawing area should be blue
            for (var i = 1; i < 5; i++) {
                expect(rgba(0, 0, 255, 1)).toFillPixel(plot, plot.width() / 2, 1);
            }
        });

        it('should draw using the higher color when there are more points per pixel in a matrix when borderWidth = ' + borderWidth, function () {
            /*
                01010101010101
                10101010101010              1111111
                01010101010101              1111111
                10101010101010      =>      0101111
                01010101010101              1011111
                10101010101010              0101111
                01010101010101
            */
            var dx = 1000, dy = 1000;
            plot = $.plot(placeholder, [createPatternTestMatrix(dx, dy)], {
                grid: {show: borderWidth > 0, borderWidth: borderWidth},
                xaxis: {show: false, mode: 'log', autoScale: 'none', min: 1, max: dx},
                yaxis: {show: false, mode: 'log', autoScale: 'none', min: 1, max: dy},
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

            // check the color of random sequence of pixels in the upper right corner of the canvas
            // there are so many points squeezed per pixel that the drawing area should be blue
            for (var i = 1; i < 5; i++) {
                for (var j = 1; j < 5; j++) {
                    expect(rgba(0, 0, 255, 1)).toFillPixel(plot, plot.width() - i, j);
                }
            }
        });
    });

    it('should use the minimum and maximum colors when the values are out of gradient range', function () {
        plot = $.plot(placeholder, [[[10, 11], [-11, -10]]], {
            grid: {show: false},
            xaxis: {show: false, mode: 'log', autoScale: 'none', min: 0.01, max: 2},
            yaxis: {show: false, mode: 'log', autoScale: 'none', min: 0.01, max: 2},
            series: {
                intensitygraph: {
                    show: true,
                    min: -10,
                    max: 10,
                    lowColor: 'rgba(255,0,0,1)',
                    highColor: 'rgba(0,255,0,1)',
                    gradient: [
                        { value: -10, color: 'white' },
                        { value: 10, color: 'blue' }
                    ]
                }
            }
        });

        var xaxis = plot.getXAxes()[0],
            yaxis = plot.getYAxes()[0];
        expect(rgba(0, 0, 255, 1)).toFillPixel(plot, xaxis.p2c(0.5), yaxis.p2c(0.5));
        expect(rgba(0, 255, 0, 1)).toFillPixel(plot, xaxis.p2c(0.5), yaxis.p2c(1.5));
        expect(rgba(255, 0, 0, 1)).toFillPixel(plot, xaxis.p2c(1.5), yaxis.p2c(0.5));
        expect(rgba(255, 255, 255, 1)).toFillPixel(plot, xaxis.p2c(1.5), yaxis.p2c(1.5));
    });
});
