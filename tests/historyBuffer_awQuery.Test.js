/* global describe, it, expect, HistoryBuffer */
/* jshint browser: true*/

/* brackets-xunit: includes=../lib/cbuffer.js,../lib/jsverify.standalone.js,../lib/jasmineHelpers2.js,../jquery.flot.historybuffer.js */

describe('A HistoryBufferWaveform', function () {
    'use strict';

    var aw, aw1, aw2, aw3, aw4, empty_aw;
    var utc = new Date(Date.UTC(1904, 0, 1, 0, 0, 0));
    var TimeZero = new NITimestamp(utc);

    beforeEach(function () {
        aw = new NIAnalogWaveform({
            t0: TimeZero + 4,
            dt: 1,
            Y:[1, 2, 3]
        });

        aw1 = new NIAnalogWaveform({
            t0: TimeZero + 1,
            dt: 1,
            Y:[1, 2, 3]
        });

        aw2 = new NIAnalogWaveform({
            t0: TimeZero + 8,
            dt: 1,
            Y:[4, 3, 2]
        });

        aw3 = new NIAnalogWaveform({
            t0: TimeZero + 10,
            dt: 1,
            Y:[0, 1, 2]
        });

        aw4 = new NIAnalogWaveform({
            t0: TimeZero + 1,
            dt: 1,
            Y:[1, 2, 3, 4, 5, 6, 7]
        });

        empty_aw = new NIAnalogWaveform({
            t0: TimeZero + 10,
            dt: 1,
            Y:[]
        });
    });

    it('has a query method', function () {
        var hb = new HistoryBufferWaveform(10);

        expect(hb.query).toEqual(jasmine.any(Function));
    });

    it('has a rangeX method', function () {
        var hb = new HistoryBufferWaveform(10);

        expect(hb.rangeX).toEqual(jasmine.any(Function));
    });

    it('has a rangeY method', function () {
        var hb = new HistoryBufferWaveform(10);

        expect(hb.rangeY).toEqual(jasmine.any(Function));
    });

    it('has basic query capabilities', function () {
        var hb = new HistoryBufferWaveform(10);

        hb.push(aw);

        expect(hb.query(0, 10, 1)).toEqual([4, 1, 5, 2, 6, 3]);
    });

    it('has basic rangeX capabilities', function () {
        var hb = new HistoryBufferWaveform(10);

        hb.push(aw4);

        expect(hb.rangeX(0)).toEqual({xmin:1, xmax: 7, deltamin: 1});
    });

    it('has basic rangeY capabilities', function () {
        var hb = new HistoryBufferWaveform(10);

        hb.push(aw4);

        expect(hb.rangeY(3, 5, 0)).toEqual({ymin: 3, ymax: 5});
    });

    it('works with empty parameters for rangeX', function () {
        var hb = new HistoryBufferWaveform(10);

        hb.push(aw4);

        expect(hb.rangeX()).toEqual({xmin:1, xmax: 7, deltamin: 1});
    });

    it('works with empty parameters for rangeY', function () {
        var hb = new HistoryBufferWaveform(10);

        hb.push(aw4);

        expect(hb.rangeY(null, null, null)).toEqual({ymin: 1, ymax: 7});
    });

    it('rangeY ignores NaN, null, undefined values', function () {
        var hb = new HistoryBufferWaveform(10);

        aw = new NIAnalogWaveform({
            t0: TimeZero + 4,
            dt: 1,
            Y: [2, 5, NaN, null, undefined, 4, 6]
        });

        hb.push(aw);

        expect(hb.rangeY(0, 10, 0)).toEqual({ymin: 2, ymax: 6});
    });

    it('can deal with empty waveforms', function () {
        var hb = new HistoryBufferWaveform(10);

        hb.appendArray([aw, empty_aw, aw1]);

        expect(hb.query(0, 10, 1)).toEqual([4, 1, 5, 2, 6, 3, 1, 1, 2, 2, 3, 3]);
    });

    it('returns empty rangeX when querying an empty history Buffer', function () {
        var hb = new HistoryBufferWaveform(10);

        expect(hb.rangeX()).toEqual({});
    });

    it('returns empty rangeY when querying an empty history Buffer', function () {
        var hb = new HistoryBufferWaveform(10);

        expect(hb.rangeY()).toEqual({});
    });

    it('has basic query capabilities for buffers with multiple data series', function () {
        var hb = new HistoryBufferWaveform(10, 2);

        hb.push([aw, aw1]);

        expect(hb.query(0, 10, 1, 0)).toEqual([4, 1, 5, 2, 6, 3]);
        expect(hb.query(0, 10, 1, 1)).toEqual([1, 1, 2, 2, 3, 3]);
    });

    it('returns empty data series when querying outside of the bounds', function () {
        var hb = new HistoryBufferWaveform(10);

        hb.appendArray([aw, aw1]);

        expect(hb.query(12, 13, 1)).toEqual([]);
        expect(hb.query(-1, 0, 1)).toEqual([]);
    });

    it('returns partial data when querying an interval that fits inside an analogWaveform', function () {
        var hb = new HistoryBufferWaveform(10);
        var largeAW = new NIAnalogWaveform({
            t0: TimeZero + 1,
            dt: 0.5,
            Y:[0, 1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
        });

        hb.push(largeAW);

        expect(hb.query(5, 5.5, 1)).toEqual([4.5, 8, 5, 9, 5.5, 10, 6, 11]);
    });


    it('returns proper data series after the buffer overflows', function () {
        var hb = new HistoryBufferWaveform(1);

        hb.appendArray([aw, aw1]);

        expect(hb.query(0, 10, 1)).toEqual([1, 1, 2, 2, 3, 3]);
    });

    it('returns first single point waveform that is out of visible range (on min side) when connected to waveform in visible range', function () {
        var hb = new HistoryBufferWaveform(10);
        var singlePointWaveform = new NIAnalogWaveform({
            t0: TimeZero,
            dt: 1,
            Y:[3.5]
        });
        var onlyVisibleWaveform = new NIAnalogWaveform({
            t0: TimeZero + 3, // start this waveform more than 2x the previous dt
            dt: 1,
            Y:[0, 1, 2, 3]
        });

        hb.push(singlePointWaveform);
        hb.push(onlyVisibleWaveform);

        // start the visible range before the last appended waveform, but beyond the visible area of the first waveform
        expect(hb.query(2, 6)).toEqual([0, 3.5, 3, 0, 4, 1, 5, 2, 6, 3]);
    });

    it('returns only last waveform in visible range (on min side) when previous waveform has more than one point and a delta requiring a gap but is completely out of visible range', function () {
        var hb = new HistoryBufferWaveform(10);
        var multiPointWaveform = new NIAnalogWaveform({
            t0: TimeZero,
            dt: 1,
            Y:[3.5, 4.5]
        });
        var onlyVisibleWaveform = new NIAnalogWaveform({
            t0: TimeZero + 4, // start this waveform more than 2x the previous dt
            dt: 1,
            Y:[0, 1, 2, 3]
        });

        hb.push(multiPointWaveform);
        hb.push(onlyVisibleWaveform);

        // start the visible range before the last appended waveform, but beyond the visible area of the first waveform
        expect(hb.query(3, 7)).toEqual([null, null, 4, 0, 5, 1, 6, 2, 7, 3]);
    });

    it('returns last point of last waveform out of visible range (on min side) when delta is close enough to not have gap.', function () {
        var hb = new HistoryBufferWaveform(10);
        var multiPointWaveform = new NIAnalogWaveform({
            t0: TimeZero,
            dt: 1,
            Y:[3.5, 4.5]
        });
        var onlyVisibleWaveform = new NIAnalogWaveform({
            t0: TimeZero + 2.5, // start this waveform less than 2x the previous dt
            dt: 1,
            Y:[0, 1, 2, 3]
        });

        hb.push(multiPointWaveform);
        hb.push(onlyVisibleWaveform);

        // start the visible range before the last appended waveform, but beyond the visible area of the first waveform
        expect(hb.query(2.4, 6.4)).toEqual([1, 4.5, 2.5, 0, 3.5, 1, 4.5, 2, 5.5, 3]);
    });

    it('returns first single point waveform that is out of visible range (on max side) when connected to waveform in visible range', function () {
        var hb = new HistoryBufferWaveform(10);
        var onlyVisibleWaveform = new NIAnalogWaveform({
            t0: TimeZero, 
            dt: 1,
            Y:[0, 1, 2, 3]
        });
        var singlePointWaveform = new NIAnalogWaveform({
            t0: 7, // start this waveform more than 2x the previous dt
            dt: 1,
            Y:[3.5]
        });

        hb.push(onlyVisibleWaveform);
        hb.push(singlePointWaveform);

        expect(hb.query(1.5, 4.5)).toEqual([1, 1, 2, 2, 3, 3, 7, 3.5]);
    });

    it('returns first point of first waveform out of visible range (on max side) when delta is close enough to not have gap.', function () {
        var hb = new HistoryBufferWaveform(10);
        var onlyVisibleWaveform = new NIAnalogWaveform({
            t0: TimeZero, // start this waveform less than 2x the previous dt
            dt: 1,
            Y:[0, 1, 2, 3]
        });
        var multiPointWaveform = new NIAnalogWaveform({
            t0: TimeZero + 4.5,
            dt: 1,
            Y:[3.5, 4.5]
        });

        hb.push(onlyVisibleWaveform);
        hb.push(multiPointWaveform);

        // start the visible range before the last appended waveform, but beyond the visible area of the first waveform
        expect(hb.query(2.4, 3.4)).toEqual([2, 2, 3, 3, 4.5, 3.5]);
    });
});
