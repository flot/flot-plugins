/* global setFixtures */
/* brackets-xunit: includes=../lib/cbuffer.js,../jquery.flot.historybuffer.js*,../jquery.flot.js,../jquery.flot.charting.js */

describe('Color scale', function() {
    'use strict';
    var $ = jQuery || NationalInstruments.Globals.jQuery;

    var fixture, placeholder, plot;

    beforeEach(function() {
        fixture = setFixtures('<div id="demo-container" style="width: 400px;height: 150px">').find('#demo-container').get(0);

        placeholder = $('<div id="placeholder" style="width: 100%;height: 100%">');
        placeholder.appendTo(fixture);
    });

    it('should not overlap yaxis when axis position is right', function() {
        plot = $.plot(placeholder, [createTestMatrix(40, 60)], {
            series: {
                intensitygraph: {
                    show: true
                }
            },
            yaxes: [{
                position: 'right',
                show: true,
                min: 0,
                max: 50,
                autoScale: 'none'
            }, {
                position: 'right',
                show: true,
                min: 0,
                max: 50,
                type: 'colorScale'
            }],
        });

        var yaxes = plot.getYAxes(),
            rightAxisBox = yaxes[0].box,
            colorscaleBox = yaxes[1].box;
        expect(rightAxisBox.left + rightAxisBox.width).toBeLessThan(colorscaleBox.left);
    });

    it('should not overlap yaxes when multiple yaxes exist', function() {
        ['left', 'right'].forEach(function(position) {
            plot = $.plot(placeholder, [createTestMatrix(40, 60)], {
                series: {
                    intensitygraph: {
                        show: true
                    }
                },
                yaxes: [{
                        position: position,
                        show: true,
                        min: 0,
                        max: 50,
                        autoScale: 'none'
                    }, {
                        position: 'right',
                        show: true,
                        min: 0,
                        max: 50,
                        autoScale: 'none'
                    }, {
                        position: 'right',
                        show: true,
                        min: 0,
                        max: 50,
                        type: 'colorScale'
                    },
                    {
                        position: position,
                        show: true,
                        min: 0,
                        max: 50,
                        autoScale: 'none'
                    }
                ],
            });

            var yaxes = plot.getYAxes(),
                rightAxisBox1 = yaxes[0].box,
                rightAxisBox2 = yaxes[1].box,
                colorscaleBox = yaxes[2].box;
            expect(rightAxisBox1.left + rightAxisBox1.width).toBeLessThan(colorscaleBox.left);
            expect(rightAxisBox2.left + rightAxisBox2.width).toBeLessThan(colorscaleBox.left);
        });
    });

    it('should call drawLegend when a visible colorScale is attached', function() {
        var spy = spyOn($.plot.IntensityGraph.prototype, 'drawLegend').and.callThrough();
        plot = $.plot(placeholder, [createTestMatrix(1, 1)], {
            series: {
                intensitygraph: {
                    show: true
                }
            },
            yaxes: [{
                position: 'right',
                show: true,
                min: 0,
                max: 50,
                type: 'colorScale'
            }]
        });

        expect(spy).toHaveBeenCalled();
    });

    it('should not call drawLegend when a hidden colorScale is attached', function() {
        var spy = spyOn($.plot.IntensityGraph.prototype, 'drawLegend').and.callThrough();
        plot = $.plot(placeholder, [createTestMatrix(1, 1)], {
            series: {
                intensitygraph: {
                    show: true
                }
            },
            yaxes: [{
                position: 'right',
                show: false,
                min: 0,
                max: 50,
                type: 'colorScale'
            }]
        });

        expect(spy).not.toHaveBeenCalled();
    });

    it('should not call drawLegend when a colorScale isn\'t attached', function() {
        var spy = spyOn($.plot.IntensityGraph.prototype, 'drawLegend').and.callThrough();
        plot = $.plot(placeholder, [createTestMatrix(1, 1)], {
            series: {
                intensitygraph: {
                    show: true
                }
            },
            yaxes: []
        });

        expect(spy).not.toHaveBeenCalled();
    });

    describe('drawLegend', function() {

        var intensityGraph = new $.plot.IntensityGraph();

        it('should add all the colors to the gradient according to the values of the markers', function() {
            var addColorStop = jasmine.createSpy(),
                ctx = {
                    fillRect: jasmine.createSpy(),
                    strokeRect: jasmine.createSpy(),
                    createLinearGradient: function() {
                        return {
                            addColorStop: addColorStop
                        };
                    }
                };

            var marker1 = {
                    value: 0,
                    color: 'red'
                },
                marker2 = {
                    value: 40,
                    color: 'yellow'
                },
                marker3 = {
                    value: 100,
                    color: 'green'
                };
            intensityGraph.drawLegend(ctx, 1, 1, 10, 50, [marker1, marker2, marker3], 'black', 'white');

            expect(addColorStop.calls.count()).toBe(3);
            expect(addColorStop.calls.argsFor(0)).toEqual([0.0, 'red']);
            expect(addColorStop.calls.argsFor(1)).toEqual([0.4, 'yellow']);
            expect(addColorStop.calls.argsFor(2)).toEqual([1.0, 'green']);
        });

        it('should use a gradient that perfectly fills the whole rectangle upside down', function() {
            var ctx = {
                fillRect: jasmine.createSpy(),
                strokeRect: jasmine.createSpy(),
                createLinearGradient: function() {
                    return {
                        addColorStop: jasmine.createSpy()
                    };
                }
            };
            spyOn(ctx, 'createLinearGradient').and.callThrough();

            var x = 1,
                y = 1,
                w = 10,
                h = 50;
            intensityGraph.drawLegend(ctx, x, y, w, h, [{
                value: 0,
                color: 'red'
            }, {
                value: 100,
                color: 'green'
            }], 'black', 'white');

            expect(ctx.createLinearGradient.calls.first().args).toEqual([0, y + h, 0, y]);
        });
    });

});
