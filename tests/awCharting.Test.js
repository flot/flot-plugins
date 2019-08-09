/* global $, describe, it, beforeEach, afterEach, expect, HistoryBuffer, setFixtures */
/* jshint browser: true*/
/* brackets-xunit: includes=../lib/cbuffer.js,../jquery.flot.historybuffer.js*,../jquery.flot.js,../jquery.flot.charting.js */

describe('A chart', function () {
    'use strict';

    var plot;
    var placeholder;
    var utc = new Date(Date.UTC(1904, 0, 1, 0, 0, 0));
    var TimeZero = new NITimestamp(utc);

    var aw = new NIAnalogWaveform({
        t0: TimeZero + 4,
        dt: 1,
        Y:[1, 2, 3]
    });

    var aw1 = new NIAnalogWaveform({
        t0: TimeZero + 1,
        dt: 1,
        Y:[1, 2, 3]
    });

    var aw2 = new NIAnalogWaveform({
        t0: TimeZero + 1,
        dt: 1,
        Y:[1, 2, 3, 4, 5]
    });

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

    it('allows to specify a HistoryBufferWaveform when creating the plot', function () {
        var hb = new HistoryBufferWaveform(10, 1);

        hb.push(aw);
        plot = $.plot(placeholder, [{}], {
            series: {
                historyBuffer: hb
            },
        });

        expect(plot.getData()[0].datapoints.points).toEqual([4, 1, 5, 2, 6, 3]);
    });

    it('creates gaps between waveforms correctly', function () {
        var hb = new HistoryBufferWaveform(10, 1);

        hb.push(aw1);

        var delayedAW = new NIAnalogWaveform({
            t0: TimeZero + 5,
            dt: 1,
            Y:[1, 2, 3]
        });

        hb.push(delayedAW);

        plot = $.plot(placeholder, [{}], {
            series: {
                historyBuffer: hb
            }
        });

        expect(plot.getData()[0].datapoints.points).toEqual([1, 1, 2, 2, 3, 3, null, null, 5, 1, 6, 2, 7, 3]);
    });

    it('creates no gaps between waveforms when one waveform has only one value', function () {
        var hb = new HistoryBufferWaveform(10, 1);
        var awOneValue = new NIAnalogWaveform({
            t0: TimeZero + 1,
            dt: 1,
            Y:[1]
        });

        var awTwoValue = new NIAnalogWaveform({
            t0: TimeZero + 12,
            dt: 1,
            Y:[1, 2]
        });
    
        hb.push(awOneValue);
        hb.push(awTwoValue);

        plot = $.plot(placeholder, [{}], {
            series: {
                historyBuffer: hb
            }
        });

        expect(plot.getData()[0].datapoints.points).toEqual([1, 1, 12, 1, 13, 2]);
    });

    it('works with multiple analogWaveforms in the HistoryBufferWaveform', function () {
        var hb = new HistoryBufferWaveform(10, 1);

        hb.push(aw);
        hb.push(aw1);

        plot = $.plot(placeholder, [{}], {
            series: {
                historyBuffer: hb
            }
        });

        expect(plot.getData()[0].datapoints.points).toEqual([4, 1, 5, 2, 6, 3, 1, 1, 2, 2, 3, 3]);
    });

    it('works with analogWaveforms in which the t0 is passed as a serialized string', function () {
        var hb = new HistoryBufferWaveform(10, 1);

        hb.push(new NIAnalogWaveform({
            t0: (TimeZero + 4) + ':0',
            dt: 1,
            Y:[1, 2, 3]})
        );

        hb.push(new NIAnalogWaveform({
            t0: (TimeZero + 1) + ':0',
            dt: 1,
            Y:[1, 2, 3]})
        );

        plot = $.plot(placeholder, [{}], {
            series: {
                historyBuffer: hb
            }
        });

        expect(plot.getData()[0].datapoints.points).toEqual([4, 1, 5, 2, 6, 3, 1, 1, 2, 2, 3, 3]);
    });

    it('provides enough points to cover the visible range when working with analogWaveforms', function () {
        var hb = new HistoryBufferWaveform(10, 1);

        hb.push(aw2);

        plot = $.plot(placeholder, [{}], {
            series: {
                historyBuffer: hb
            },
            xaxes: [{
                min: 2.5,
                max: 3.5,
                autoScale: 'none'
            }]
        });

        expect(plot.getData()[0].datapoints.points).toEqual([2, 2, 3, 3, 4, 4]);
    });

    it('works with array of single analog waveform', function () {
        var hb = new HistoryBufferWaveform(10);

        hb.push([aw]);

        plot = $.plot(placeholder, [{}], {
            series: {
                historyBuffer: hb
            }
        });

        expect(plot.getData()[0].datapoints.points).toEqual([4, 1, 5, 2, 6, 3]);
    });
});
