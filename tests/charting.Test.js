/*globals NITimestamp, NIAnalogWaveform, HistoryBufferWaveform, HistoryBuffer*/

describe('A chart', function () {
    'use strict';

    var plot;
    var placeholder;

    beforeEach(function () {
        var fixture = setFixtures('<div id="demo-container" style="width: 800px;height: 600px">').find('#demo-container').get(0);
        placeholder = $('<div id="placeholder" style="width: 100%;height: 100%">');
        placeholder.appendTo(fixture);
    });

    afterEach(function () {
        if (plot) {
            plot.shutdown();
        }
    });

    it('allows to specify a historyBuffer when creating the plot', function () {
        var hb = new HistoryBuffer(10, 1);
        hb.push(33);

        plot = $.plot(placeholder, [{}], {
            series: {
                historyBuffer: hb
            }
        });

        expect(plot.getData()[0].datapoints.points).toEqual([0, 33]);
    });

    it('works with an empty historyBuffer', function () {
        var hb = new HistoryBuffer(10, 1);
        plot = $.plot(placeholder, [{}], {
            series: {
                historyBuffer: hb
            }
        });

        expect(plot.getData()[0].datapoints.points).toEqual([]);
    });

    it('works with an small amount of data in the historyBuffer', function () {
        var hb = new HistoryBuffer(10, 1);

        hb.push(33);
        hb.push(34);

        plot = $.plot(placeholder, [{}], {
            series: {
                historyBuffer: hb
            }
        });

        expect(plot.getData()[0].datapoints.points).toEqual([0, 33, 1, 34]);
    });

    it('provides enough points to cover the visible range', function () {
        var hb = new HistoryBuffer(10, 1);

        hb.appendArray([33, 34, 35, 36, 37]);

        plot = $.plot(placeholder, [{}], {
            series: {
                historyBuffer: hb
            },
            xaxes: [{
                min: 1.5,
                max: 2.5,
                autoScale: 'none'
            }]
        });

        expect(plot.getData()[0].datapoints.points).toEqual([1, 34, 2, 35, 3, 36]);
    });

    it('keeps track of the total number of elements introduced in the buffer', function () {
        var hb = new HistoryBuffer(1, 1);
        hb.push(33);
        hb.push(34);
        plot = $.plot(placeholder, [[]], {
            series: {
                historyBuffer: hb
            }
        });

        expect(plot.getData()[0].datapoints.points).toEqual([1, 34]);
    });

    it('should not redraw if the plot was shutdown', function (done) {
        var firstHistoryBuffer = new HistoryBuffer(1, 1),
            options = {
                series: {
                    historyBuffer: firstHistoryBuffer
                },
                xaxes: [
                    { position: 'bottom', autoScale: 'exact' }
                ],
                yaxes: [
                    { position: 'left', autoScale: 'exact' }
                ]
            };
        firstHistoryBuffer.push(10);
        plot = $.plot(placeholder, [[]], options);

        var secondHistoryBuffer = new HistoryBuffer(1, 1);
        options.series.historyBuffer = secondHistoryBuffer;
        secondHistoryBuffer.push(20);
        var newPlot = $.plot(placeholder, [[]], options);

        // continue pushing to an obsolete history buffer
        firstHistoryBuffer.push(30);

        requestAnimationFrame(function() {
            expect(plot.getData()[0].datapoints.points).toEqual([0, 10]);
            expect(newPlot.getData()[0].datapoints.points).toEqual([0, 20]);
            done();
        });
    });

    it('allows the plot styles to be specified in the initial data series', function () {
        var hb = new HistoryBuffer(10, 1);
        hb.push(33);
        hb.push(34);

        plot = $.plot(placeholder, [{data: [], color: 'red', lines: { lineWidth: 5 }}], {
            series: {
                historyBuffer: hb
            }
        });

        expect(plot.getData()[0].color).toEqual('red');
        expect(plot.getData()[0].lines.lineWidth).toEqual(5);
    });

    it('allows more plot styles than history buffers', function () {
        var hb = new HistoryBuffer(10, 1);
        hb.push(33);
        hb.push(34);

        plot = $.plot(placeholder,
            [
                {data: [], color: 'red', lines: { lineWidth: 5 }},
                {data: [], color: 'blue', lines: { lineWidth: 3 }}
            ]
            , {
                series: {
                    historyBuffer: hb
                }
            });

        expect(plot.getData()[0].color).toEqual('red');
        expect(plot.getData()[0].lines.lineWidth).toEqual(5);
        expect(plot.getData()[1].color).toEqual('blue');
        expect(plot.getData()[1].lines.lineWidth).toEqual(3);
    });

    it('when history buffer is widened the additional plot settings are taken into account', function (done) {
        var hb = new HistoryBuffer(10, 1);
        hb.push(33);
        hb.push(34);

        plot = $.plot(placeholder,
            [
                {data: [], color: 'red', lines: { lineWidth: 5 }},
                {data: [], color: 'blue', lines: { lineWidth: 3 }}
            ]
            , {
                series: {
                    historyBuffer: hb
                }
            });

        hb.setWidth(2);
        hb.push([2, 3]);
        hb.push([3, 4]);

        requestAnimationFrame(function() {
            expect(plot.getData()[0].color).toEqual('red');
            expect(plot.getData()[0].lines.lineWidth).toEqual(5);
            expect(plot.getData()[1].color).toEqual('blue');
            expect(plot.getData()[1].lines.lineWidth).toEqual(3);
            done();
        });
    });

    it('given multi-dimensional empty data maintains valid y-axis range', function () {
        var hb = new HistoryBuffer(10, 2);
        plot = $.plot(placeholder, [[], []], {
            series: {
                historyBuffer: hb
            }
        });

        var yAxis = plot.getYAxes()[0];
        expect(isNaN(yAxis.min)).toEqual(false);
        expect(isNaN(yAxis.max)).toEqual(false);
    });

    describe('visible range ', function () {
        it('updates OY axis datamin and datamax', function () {
            var hb = new HistoryBuffer(10, 1);

            hb.appendArray([37, 35, 34, 32, 33]);

            plot = $.plot(placeholder, [{}], {
                series: {
                    historyBuffer: hb
                },
                xaxes: [{
                    min: 1.5,
                    max: 2.5,
                    autoScale: 'none'
                }],
                yaxis: {
                    autoScale: 'exact'
                }
            });

            expect(plot.getData()[0].datapoints.points).toEqual([1, 35, 2, 34, 3, 32]);
            var yaxis = plot.getYAxes()[0];
            expect(yaxis.datamin).toEqual(32);
            expect(yaxis.datamax).toEqual(35);
            expect(yaxis.autoScaledMin).toEqual(32);
            expect(yaxis.autoScaledMax).toEqual(35);
        });

        it('scales for multiple dataseries', function () {
            var hb = new HistoryBuffer(20, 2);

            hb.appendArray([[10, 2], [11, 3], [12, 4], [13, 5], [14, 6]]);

            plot = $.plot(placeholder, [[], []], {
                series: {
                    historyBuffer: hb
                },
                xaxes: [{
                    min: 1.5,
                    max: 2.5,
                    autoScale: 'none'
                }],
                yaxis: {
                    autoScale: 'exact'
                }
            });

            expect(plot.getData()[0].datapoints.points).toEqual([1, 11, 2, 12, 3, 13]);
            expect(plot.getData()[1].datapoints.points).toEqual([1, 3, 2, 4, 3, 5]);
            var yaxis = plot.getYAxes()[0];
            expect(yaxis.datamin).toEqual(3);
            expect(yaxis.datamax).toEqual(13);
        });

        it('works for multiple dataseries with multiple Y axes', function () {
            var hb = new HistoryBuffer(20, 2);

            hb.appendArray([[10, 6], [11, 5], [12, 4], [13, 3], [14, 2]]);

            plot = $.plot(placeholder, [{data: []}, {data: [], yaxis: 2}], {
                series: {
                    historyBuffer: hb
                },
                xaxes: [{
                    min: 1.5,
                    max: 2.5,
                    autoScale: 'none'
                }],
                yaxes: [{
                    autoScale: 'exact'
                }, {
                    autoScale: 'exact'
                }
                ]
            });

            expect(plot.getData()[0].datapoints.points).toEqual([1, 11, 2, 12, 3, 13]);
            expect(plot.getData()[1].datapoints.points).toEqual([1, 5, 2, 4, 3, 3]);
            var yaxis = plot.getYAxes()[0];
            var yaxis2 = plot.getYAxes()[1];
            expect(yaxis.datamin).toEqual(11);
            expect(yaxis.datamax).toEqual(13);
            expect(yaxis2.datamin).toEqual(3);
            expect(yaxis2.datamax).toEqual(5);
        });
    });

    describe('with bars', function () {
        it('sets barWidth to 0.8 for numeric buffer', function() {
            var hb = new HistoryBuffer(20, 2);
            hb.appendArray([[10, 2], [11, 3], [12, 4], [13, 5], [14, 6]]);

            plot = $.plot(placeholder, [[], []], {
                series: {
                    historyBuffer: hb,
                    bars: {
                        lineWidth: 1,
                        show: true,
                        fillColor: 'blue'
                    }
                }
            });

            expect(plot.getData()[0].bars.barWidth).toBe(0.8);
        });

        it('should compute the barWidth based on minimum point distance for analogWaveform', function() {
            var aw1 = new NIAnalogWaveform({
                    t0: new NITimestamp() + 3,
                    dt: 10,
                    Y: [3, 5, 9]
                }),
                aw2 = new NIAnalogWaveform({
                    t0: new NITimestamp() + 4,
                    dt: 1,
                    Y: [7, 11, 15]
                }),
                hb = new HistoryBufferWaveform(10);

            hb.appendArray([aw1, aw2]);

            plot = $.plot(placeholder, [[]], {
                series: {
                    historyBuffer: hb,
                    bars: {
                        lineWidth: 1,
                        show: true,
                        fillColor: 'blue'
                    }
                }
            });

            expect(plot.getData()[0].bars.barWidth).toBe(0.8);
        });

        it('should work with multiple series of analogWaveform', function() {
            var aw1 = new NIAnalogWaveform({
                    t0: new NITimestamp() + 3,
                    dt: 10,
                    Y: [3, 5, 9]
                }),
                aw2 = new NIAnalogWaveform({
                    t0: new NITimestamp() + 4,
                    dt: 1,
                    Y: [7, 11, 15]
                }),
                hb = new HistoryBufferWaveform(10, 2);

            hb.push([aw1, aw2]);

            plot = $.plot(placeholder, [[], []], {
                series: {
                    historyBuffer: hb,
                    bars: {
                        lineWidth: 1,
                        show: true,
                        fillColor: 'blue'
                    }
                }
            });

            expect(plot.getData()[0].bars.barWidth).toBe(8);
            expect(plot.getData()[1].bars.barWidth).toBe(0.8);
        });

        it('should consider barWidth 0.8 * dt for empty analogWaveform', function() {
            var emptyAw = new NIAnalogWaveform({
                    t0: new NITimestamp() + 10,
                    dt: 1,
                    Y: []
                }),
                hb = new HistoryBufferWaveform(10);

            hb.appendArray([emptyAw]);

            plot = $.plot(placeholder, [[], []], {
                series: {
                    historyBuffer: hb,
                    bars: {
                        lineWidth: 1,
                        show: true,
                        fillColor: 'blue'
                    }
                }
            });

            expect(plot.getData()[0].bars.barWidth).toBe(0.8);
        });

        it('should work for an analogWaveform with a single point', function() {
            var emptyAw = new NIAnalogWaveform({
                    t0: new NITimestamp() + 10,
                    dt: 100,
                    Y: [1]
                }),
                hb = new HistoryBufferWaveform(10);

            hb.appendArray([emptyAw]);

            plot = $.plot(placeholder, [[], []], {
                series: {
                    historyBuffer: hb,
                    bars: {
                        lineWidth: 1,
                        show: true,
                        fillColor: 'blue'
                    }
                }
            });

            expect(plot.getData()[0].bars.barWidth).toBe(80);
        });

        it('should consider barWidth 0.8 for not defined dt of analogWaveform', function() {
            var emptyAw = new NIAnalogWaveform({
                    t0: new NITimestamp() + 10,
                    Y: [2]
                }),
                hb = new HistoryBufferWaveform(10);

            hb.appendArray([emptyAw]);

            plot = $.plot(placeholder, [[], []], {
                series: {
                    historyBuffer: hb,
                    bars: {
                        lineWidth: 1,
                        show: true,
                        fillColor: 'blue'
                    }
                }
            });

            expect(plot.getData()[0].bars.barWidth).toBe(0.8);
        });

        it('should work with negative dt', function() {
            var emptyAw = new NIAnalogWaveform({
                    t0: new NITimestamp() + 10,
                    dt: -1,
                    Y: [2, 3, 4, 5]
                }),
                hb = new HistoryBufferWaveform(10);

            hb.appendArray([emptyAw]);

            plot = $.plot(placeholder, [[], []], {
                series: {
                    historyBuffer: hb,
                    bars: {
                        lineWidth: 1,
                        show: true,
                        fillColor: 'blue'
                    }
                }
            });

            expect(plot.getData()[0].bars.barWidth).toBe(0.8);
        });
    });
});
