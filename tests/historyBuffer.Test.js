/*globals HistoryBuffer, NITimestamp, NIAnalogWaveform*/

describe('A HistoryBuffer works with numeric data', function () {
    'use strict';
    var onChangekey = 'key';

    it('has a clear method', function () {
        var hb = new HistoryBuffer(10);

        hb.clear();
        expect(hb.capacity).toBe(10);
    });

    it('clear method clears the data', function () {
        var hb = new HistoryBuffer(10);
        hb.appendArray([1, 2, 3]);

        hb.clear();
        expect(hb.count).toBe(0);
    });

    it('has a capacity property', function () {
        var hb = new HistoryBuffer(10);

        expect(hb.capacity).toBe(10);
    });

    it('has a setCapacity method', function () {
        var hb = new HistoryBuffer(10);

        hb.setCapacity(20);
        expect(hb.capacity).toBe(20);
    });

    it('setCapacity method clears the data', function () {
        var hb = new HistoryBuffer(10);
        hb.appendArray([1, 2, 3]);

        hb.setCapacity(20);
        expect(hb.count).toBe(0);
    });

    it('has a width property', function () {
        var hb = new HistoryBuffer(10, 3);

        expect(hb.width).toBe(3);
    });

    it('has a setWidth method', function () {
        var hb = new HistoryBuffer(10, 1);

        hb.setWidth(2);
        expect(hb.width).toBe(2);
    });

    it('setWidth method clears the data', function () {
        var hb = new HistoryBuffer(10, 1);
        hb.appendArray([1, 2, 3]);

        hb.setWidth(2);
        expect(hb.count).toBe(0);
    });

    it('has a startIndex and lastIndex method', function () {
        var hb = new HistoryBuffer(10, 1);

        hb.appendArray([1, 2, 3]);

        expect(hb.startIndex()).toBe(0);
        expect(hb.lastIndex()).toBe(3);
    });

    it('startIndex and lastIndex methods work for an empty buffer', function () {
        var hb = new HistoryBuffer(10, 1);

        expect(hb.startIndex()).toBe(0);
        expect(hb.lastIndex()).toBe(0);
    });

    it('startIndex and lastIndex methods work for an overflowed buffer', function () {
        var hb = new HistoryBuffer(4, 1);

        hb.appendArray([1, 2, 3, 4, 5, 6, 7]);

        expect(hb.startIndex()).toBe(3);
        expect(hb.lastIndex()).toBe(7);
    });

    it('has an appendArray method', function () {
        var hb = new HistoryBuffer(10);

        hb.appendArray([1, 2, 3]);

        [1, 2, 3, undefined].forEach(function (exp, i) {
            expect(hb.get(i)).toBe(exp);
        });
    });

    it('appendArray method works with arrays bigger that the hb capacity', function () {
        var hb = new HistoryBuffer(3);

        hb.appendArray([1, 2, 3, 4]);

        [2, 3, 4].forEach(function (exp, i) {
            expect(hb.get(i + 1)).toBe(exp);
        });
    });

    it('appendArray method works for plots with two data series', function () {
        var hb = new HistoryBuffer(10, 2);

        hb.appendArray([[1, 1], [2, 2], [3, 3]]);

        [[1, 1], [2, 2], [3, 3], [undefined, undefined]].forEach(function (exp, i) {
            expect(hb.get(i)).toEqual(exp);
        });
    });

    it('has a toArray method', function () {
        var hb = new HistoryBuffer(10);

        hb.appendArray([1, 2, 3]);

        expect(hb.toArray()).toEqual([1, 2, 3]);
    });

    it('toArray method works for plots with two data series', function () {
        var hb = new HistoryBuffer(10, 2);

        hb.appendArray([[1, 2], [2, 3], [3, 4]]);

        expect(hb.toArray()).toEqual([[1, 2], [2, 3], [3, 4]]);
    });

    it('has a toDataSeries method', function () {
        var hb = new HistoryBuffer(10);

        hb.appendArray([1, 2, 3]);

        expect(hb.toDataSeries()).toEqual([[ 0, 1 ], [ 1, 2 ], [ 2, 3 ]]);
    });

    it('toDataSeries method works for plots with two data series', function () {
        var hb = new HistoryBuffer(10, 2);

        hb.appendArray([[1, 2], [2, 3], [3, 4]]);

        expect(hb.toDataSeries(0)).toEqual([[ 0, 1 ], [ 1, 2 ], [ 2, 3 ]]);
        expect(hb.toDataSeries(1)).toEqual([[ 0, 2 ], [ 1, 3 ], [ 2, 4 ]]);
    });

    it('stringify method works for plots with a single data series', function () {
        var hb = new HistoryBuffer(10);

        hb.appendArray([1, 2, 3]);

        var serializedHb = JSON.parse(JSON.stringify(hb));

        expect(serializedHb['width']).toBe(1);
        expect(serializedHb['startIndex']).toBe(0);
        expect(serializedHb['capacity']).toBe(10);
        expect(serializedHb['valueType']).toBe('HistoryBuffer');
        expect(serializedHb['count']).toBe(3);
        expect(serializedHb['data']).toEqual([1, 2, 3]);
    });

    it('stringify method works for plots with multiple data series', function () {
        var hb = new HistoryBuffer(10, 3);

        hb.appendArray([[1, 2, 3], [11, 22, 33]]);

        var serializedHb = JSON.parse(JSON.stringify(hb));

        expect(serializedHb['width']).toBe(3);
        expect(serializedHb['startIndex']).toBe(0);
        expect(serializedHb['capacity']).toBe(10);
        expect(serializedHb['valueType']).toBe('HistoryBuffer');
        expect(serializedHb['count']).toBe(2);
        expect(serializedHb['data']).toEqual([[1, 11], [2, 22], [3, 33]]);
    });

    describe('registerOnChange notification', function () {
        it('has an registerOnChange method', function () {
            var hb = new HistoryBuffer(10, 1);

            expect(hb.registerOnChange).toEqual(jasmine.any(Function));
        });

        it('registerOnChange is called on push', function () {
            var hb = new HistoryBuffer(10);

            var spy = jasmine.createSpy('registerOnChange');
            hb.registerOnChange(onChangekey, spy);
            hb.push(1);
            expect(spy).toHaveBeenCalled();
        });

        it('registerOnChange is called on appendArray', function () {
            var hb = new HistoryBuffer(10);
            var spy = jasmine.createSpy('registerOnChange');

            hb.registerOnChange(onChangekey, spy);
            hb.appendArray([1, 2]);

            expect(spy).toHaveBeenCalled();
        });

        it('registerOnChange is called on setCapacity', function () {
            var hb = new HistoryBuffer(10);
            var spy = jasmine.createSpy('registerOnChange');
            hb.appendArray([1, 2]);

            hb.registerOnChange(onChangekey, spy);
            hb.setCapacity(20);

            expect(spy).toHaveBeenCalled();
        });

        it('registerOnChange is called on setWidth', function () {
            var hb = new HistoryBuffer(10);
            var spy = jasmine.createSpy('registerOnChange');
            hb.appendArray([1, 2]);

            hb.registerOnChange(onChangekey, spy);
            hb.setWidth(2);

            expect(spy).toHaveBeenCalled();
        });

        it('registerOnChange is called on clear', function () {
            var hb = new HistoryBuffer(10);
            var spy = jasmine.createSpy('registerOnChange');
            hb.appendArray([1, 2]);

            hb.registerOnChange(onChangekey, spy);
            hb.clear();

            expect(spy).toHaveBeenCalled();
        });

        it('registerOnChange is called when changing types from numeric to analogWaveform', function () {
            var hb = new HistoryBuffer(10);
            var spy = jasmine.createSpy('registerOnChange');
            hb.registerOnChange(onChangekey, spy);
            hb.setType('analogWaveform');

            expect(spy).toHaveBeenCalled();
        });

        it('registerOnChange is called when changing types from analogWaveform  to numeric', function () {
            var hb = new HistoryBuffer(10);
            hb.setType('analogWaveform');

            var spy = jasmine.createSpy('registerOnChange');
            hb.registerOnChange(onChangekey, spy);
            hb.setType('numeric');

            expect(spy).toHaveBeenCalled();
        });

        it('registerOnChange is not called when the type of the buffer is the desired one already', function () {
            var hb = new HistoryBuffer(10);

            var spy = jasmine.createSpy('registerOnChange');
            hb.registerOnChange(onChangekey, spy);
            hb.setType('numeric');

            expect(spy).not.toHaveBeenCalled();
        });

        it('multiple callBacks can be registered and all of them get called', function () {
            var hb = new HistoryBuffer(10);
            var key2 = 'key2';
            var spy1 = jasmine.createSpy('registerOnChange');
            var spy2 = jasmine.createSpy('registerOnChange');

            hb.registerOnChange(onChangekey, spy1);
            hb.registerOnChange(key2, spy2);
            hb.appendArray([1, 2]);

            expect(spy1).toHaveBeenCalled();
            expect(spy2).toHaveBeenCalled();
        });

        it('able to deregister calback.', function () {
            var hb = new HistoryBuffer(10);
            var spy = jasmine.createSpy('registerOnChange');

            hb.registerOnChange(onChangekey, spy);
            hb.deregisterOnChange(onChangekey);

            hb.appendArray([1, 2]);
            expect(spy).not.toHaveBeenCalled();
        });
    });
});

describe('A History Buffer works with analogWaveform data', function () {
    'use strict';
    var onChangekey = 'key';
    var aw, aw1, aw2, aw3, serializedHb;
    var utc = new Date(Date.UTC(1904, 0, 1, 0, 0, 0));
    var TimeZero = new NITimestamp(utc);

    function analogWaveformHB(capacity, width) {
        var hb = new HistoryBuffer(capacity, width);
        hb.setType('analogWaveform');

        return hb
    }

    beforeEach(function () {
        aw = new NIAnalogWaveform({
            t0: TimeZero + 4,
            dt: 1,
            Y: [1, 2, 3]
        });

        aw1 = new NIAnalogWaveform({
            t0: TimeZero + 1,
            dt: 1,
            Y: [1, 2, 3]
        });

        aw2 = new NIAnalogWaveform({
            t0: TimeZero + 8,
            dt: 1,
            Y: [4, 3, 2]
        });

        aw3 = new NIAnalogWaveform({
            t0: TimeZero + 10,
            dt: 1,
            Y: [0, 1, 2]
        });

        serializedHb = {
            data: [[aw, aw1], [aw2, aw3]],
            width: 2,
            capacity: 10,
            valueType: 'HistoryBuffer',
            startIndex: 0,
            count: 2
        };
    });

    it('has a setter and getter for count', function () {
        var hb = analogWaveformHB(10);

        expect(hb.count).toBe(0);
        hb.count = 10;
        expect(hb.count).toBe(10);
    });

    it('has a clear method', function () {
        var hb = analogWaveformHB(10);

        hb.clear();
        expect(hb.capacity).toBe(10);
    });

    it('clear method clears the data', function () {
        var hb = analogWaveformHB(10);

        hb.push(aw);
        hb.clear();
        expect(hb.count).toBe(0);
    });

    it('has a capacity property', function () {
        var hb = analogWaveformHB(10);

        expect(hb.capacity).toBe(10);
    });

    it('has a setCapacity method', function () {
        var hb = analogWaveformHB(10);

        hb.setCapacity(20);
        expect(hb.capacity).toBe(20);
    });

    it('setCapacity method clears the data', function () {
        var hb = analogWaveformHB(10);

        hb.appendArray([aw, aw1]);
        hb.setCapacity(20);

        expect(hb.count).toBe(0);
    });

    it('has a width property', function () {
        var hb = analogWaveformHB(10, 3);

        expect(hb.width).toBe(3);
    });

    it('has a setWidth method', function () {
        var hb = analogWaveformHB(10, 1);

        hb.setWidth(2);
        expect(hb.width).toBe(2);
    });

    it('setWidth method clears the data', function () {
        var hb = analogWaveformHB(10, 1);

        hb.appendArray([aw, aw1]);
        hb.setWidth(2);

        expect(hb.count).toBe(0);
    });

    it('has an appendArray method', function () {
        var hb = analogWaveformHB(10);

        hb.appendArray([aw, aw1]);

        [aw, aw1, undefined].forEach(function (exp, i) {
            expect(hb.get(i)).toBe(exp);
        });
    });

    it('appendArray method works with arrays bigger that the hb capacity', function () {
        var hb = analogWaveformHB(2);

        hb.appendArray([aw, aw1, aw2]);

        [aw1, aw2].forEach(function (exp, i) {
            expect(hb.get(i + 1)).toBe(exp);
        });
    });

    it('appendArray method works for plots with two data series', function () {
        var hb = analogWaveformHB(10, 2);

        hb.appendArray([[aw, aw1], [aw2, aw3]]);

        [[aw, aw1], [aw2, aw3], [undefined, undefined]].forEach(function (exp, i) {
            expect(hb.get(i)).toEqual(exp);
        });
    });

    it('has a toArray method', function () {
        var hb = analogWaveformHB(10);

        hb.appendArray([aw, aw1]);

        expect(hb.toArray()).toEqual([aw, aw1]);
    });

    it('has a toJSON method', function () {
        var hb = analogWaveformHB(10, 2);

        hb.appendArray([[aw, aw1], [aw2, aw3]]);

        expect(hb.toJSON()).toEqual(serializedHb);
    });

    it('toArray method works for plots with two data series', function () {
        var hb = analogWaveformHB(10, 2);

        hb.appendArray([[aw, aw1], [aw2, aw3]]);

        expect(hb.toArray()).toEqual([[aw, aw1], [aw2, aw3]]);
    });

    it('has a toDataSeries method', function () {
        var hb = analogWaveformHB(10);

        hb.appendArray([aw, aw1]);

        expect(hb.toDataSeries(0)).toEqual([[4, 1], [5, 2], [6, 3], [1, 1], [2, 2], [3, 3]]);
    });

    it('toDataSeries method works for history buffers with width > 1', function () {
        var hb = analogWaveformHB(10, 2);

        hb.appendArray([[aw, aw2], [aw1, aw3]]);

        expect(hb.toDataSeries(0)).toEqual([[4, 1], [5, 2], [6, 3], [1, 1], [2, 2], [3, 3]]);
        expect(hb.toDataSeries(1)).toEqual([[8, 4], [9, 3], [10, 2], [10, 0], [11, 1], [12, 2]]);
    });

    describe('registerOnChange notification', function () {
        it('has an registerOnChange method', function () {
            var hb = analogWaveformHB(10, 1);

            expect(hb.registerOnChange).toEqual(jasmine.any(Function));
        });

        it('registerOnChange is called on push', function () {
            var hb = analogWaveformHB(10);

            var spy = jasmine.createSpy('registerOnChange');

            hb.registerOnChange(onChangekey, spy);
            hb.push(aw);
            expect(spy).toHaveBeenCalled();
        });

        it('registerOnChange is called on appendArray', function () {
            var hb = analogWaveformHB(10);
            var spy = jasmine.createSpy('registerOnChange');

            hb.registerOnChange(onChangekey, spy);
            hb.appendArray([aw, aw1]);

            expect(spy).toHaveBeenCalled();
        });

        it('registerOnChange is called on setCapacity', function () {
            var hb = analogWaveformHB(10);
            var spy = jasmine.createSpy('registerOnChange');
            hb.appendArray([aw, aw1]);

            hb.registerOnChange(onChangekey, spy);
            hb.setCapacity(20);

            expect(spy).toHaveBeenCalled();
        });

        it('registerOnChange is called on setWidth', function () {
            var hb = analogWaveformHB(10);
            var spy = jasmine.createSpy('registerOnChange');
            hb.appendArray([aw, aw1]);

            hb.registerOnChange(onChangekey, spy);
            hb.setWidth(2);

            expect(spy).toHaveBeenCalled();
        });

        it('registerOnChange is called on clear', function () {
            var hb = analogWaveformHB(10);
            var spy = jasmine.createSpy('registerOnChange');
            hb.appendArray([aw, aw1]);

            hb.registerOnChange(onChangekey, spy);
            hb.clear();

            expect(spy).toHaveBeenCalled();
        });
    });
});
