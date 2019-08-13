/* history buffer data structure for charting.

Copyright (c) 2007-2015 National Instruments
Licensed under the MIT license.
*/
/*globals CBuffer, SegmentTree, module*/

/**
# HistoryBufferWaveform

> A historyBuffer is a data structure that enables efficient charting operations
on a sliding window of data points. HistoryBufferWaveform enables a charting of analog waveforms.

Example:
```javascript
var hb1 = new HistoryBufferWaveform(10);

aw = new NIAnalogWaveform({
    t0: 4,
    dt: 1,
    Y:[1, 2, 3]
});

aw1 = new NIAnalogWaveform({
    t0: 1,
    dt: 1,
    Y:[1, 2, 3]
});

// in an analog waveform history buffer with width 1 we can push analog waveforms
hb1.push(aw);
hb1.push(aw1);

console.log(hb1.toArray()); //[aw, aw2]

console.log(hb1.toDataSeries()); //[[4, 1], [5, 2], [6, 3], [null, null], [1, 1], [2, 2], [3, 3]]
```

*/

/** ## HistoryBufferWaveform methods*/
(function (global) {
    'use strict';

    /** **HistoryBufferWaveform(capacity, width)** - the History buffer constructor creates
    a new history buffer with the specified capacity (default: 1024) and width (default: 1)*/
    var HistoryBufferWaveform = function (capacity, width) {
        this.capacity = capacity || 1024;
        this.width = width || 1;

        this.buffers = []; // circular buffers for data

        for (var i = 0; i < this.width; i++) {
            this.buffers.push(new CBuffer(capacity));
        }

        this.buffer = this.buffers[0];

        this.count = 0;
        this.callbacks = new Map();
        this.changed = false;
    };

    HistoryBufferWaveform.prototype.__proto__ = HistoryBufferNumeric.prototype; // delegate to HistoryBuffer

    HistoryBufferWaveform.prototype.rebuildSegmentTrees = function () { // no segment tree is used for waveforms
    };

    /* store an element in the history buffer, don't update stats */
    HistoryBufferWaveform.prototype.pushNoStatsUpdate = function (item) {
        if (this.width === 1 && !Array.isArray(item)) {
            this.buffer.push(item);
        } else if (Array.isArray(item) && item.length === this.width) {
            for (var i = 0; i < this.width; i++) {
                this.buffers[i].push(item[i]);
            }
        }
    };

    /* get the tree nodes at the specified level that keeps the information for the specified interval*/
    HistoryBufferWaveform.prototype.getTreeNodes = function (level, start, end) { // no segment tree is used for waveforms
    };

    /* update the segment tree with the newly added values*/
    HistoryBufferWaveform.prototype.updateSegmentTrees = function () {
    };

    function waveformInRange(aw, start, end) {
        if (aw.Y.length === 0) {
            return false;
        }

        var t0 = new NITimestamp(aw.t0);

        var waveformStart = t0.valueOf();
        var waveformEnd = t0.valueOf() + aw.Y.length * aw.dt;

        if (waveformStart < start && waveformEnd < start) {
            return false;
        }

        if (waveformStart > end && waveformEnd > end) {
            return false;
        }

        return true;
    }

    function waveformsSeparated(aw1, aw2) {
        if (aw1.Y.length == 1 || aw2.Y.length == 1) {
            return false;
        }

        var lastSampleOfFirstWaveform = (new NITimestamp(aw1.t0)).add(aw1.dt * (aw1.Y.length - 1)).valueOf();
        var firstSampleOfSecondWaveform = new NITimestamp(aw2.t0).valueOf();

        return firstSampleOfSecondWaveform - lastSampleOfFirstWaveform >= 2.0 * aw1.dt;
    }

    function appendWaveformToDecimateBuffer(aw, start, end, buffer) {
        var Y = aw.Y,
            TS = aw.t0,
            currentTS = new NITimestamp(TS),
            floatCurrentTS;

        for (var i=0; i < Y.length; i++) {
            floatCurrentTS = currentTS.valueOf();

            if (floatCurrentTS >= (start - aw.dt) && floatCurrentTS <= (end + aw.dt)) {
                buffer.push(floatCurrentTS);
                buffer.push(Y[i]);
            }
            currentTS.add(aw.dt);
        }
    }

    function appendWaveformToDataSeries(aw, buffer) {
        var Y = aw.Y,
            TS = aw.t0,
            currentTS = new NITimestamp(TS),
            floatCurrentTS;

        for (var i=0; i < Y.length; i++) {
            floatCurrentTS = currentTS.valueOf();
            buffer.push([floatCurrentTS, Y[i]]);
            currentTS.add(aw.dt);
        }
    }

    /** **query(start, end, step, index)** - decimates the data set at the
    provided *index*, starting at the start sample, ending at the end sample
    with the provided step */
    HistoryBufferWaveform.prototype.query = function (start, end, step, index) {
        if (index === undefined) {
            index = 0;
        }

        var result = [];
        var waveforms = this.buffers[index].toArray();
        var previousWaveform = waveforms[0];

        waveforms.forEach(function (waveform) {
            if (!waveformInRange(waveform, start, end)) {
                return;
            }

            if (waveformsSeparated(previousWaveform, waveform)) {
                // add a "gap" to separate the analog waveforms
                result.push(null);
                result.push(null);
            }

            previousWaveform = waveform;
            appendWaveformToDecimateBuffer(waveform, start, end, result);
        });

        return result;
    };

    /** **toDataSeries()** - returns the content of the history buffer into a
    flot data series*/
    HistoryBufferWaveform.prototype.toDataSeries = function (index) {
        if (index === undefined) {
            index = 0;
        }

        var result = [];
        var waveforms = this.buffers[index].toArray();
        var previousWaveform = waveforms[0];

        waveforms.forEach(function (waveform) {
            if (waveformsSeparated(previousWaveform, waveform)) {
                // add a "gap" to separate the analog waveforms
                result.push([null, null]);
            }

            previousWaveform = waveform;
            appendWaveformToDataSeries(waveform, result);
        });

        return result;
    };

    HistoryBufferWaveform.prototype.rangeX = function (index) {
        var minTS = Infinity,
            maxTS = -Infinity,
            deltamin = Infinity,
            t0, startTS, endTS;

        if (index === undefined) {
            index = 0;
        }

        var waveforms = this.buffers[index].toArray();

        if (waveforms.length === 0) {
            return {};
        }

        waveforms.forEach(function (aw) {
            t0 = new NITimestamp(aw.t0);
            startTS = t0.valueOf();
            endTS = (new NITimestamp(t0)).add(aw.dt * (aw.Y.length - 1)).valueOf();

            if (startTS < minTS) {
                minTS = startTS;
            }

            if (endTS > maxTS) {
                maxTS = endTS;
            }

            if (deltamin > Math.abs(aw.dt)) {
                deltamin = Math.abs(aw.dt);
            }
        });

        if (deltamin === 0) {
            deltamin = 1;
        }

        if (minTS > maxTS) {
            var temp = minTS;
            minTS = maxTS;
            maxTS = temp;
        }

        return {
            xmin: minTS,
            xmax: maxTS,
            deltamin: deltamin
        }
    };

    HistoryBufferWaveform.prototype.rangeY = function (start, end, index) {
        var minMax = {min : Infinity,
                      max : -Infinity}

        if (index === null || index === undefined) {
            index = 0;
        }

        var waveforms = this.buffers[index].toArray();

        if (waveforms.length === 0) {
            return {};
        }

        if (start === null || start === undefined){
            start = (new NITimestamp(waveforms[0].t0)).valueOf();
        }
        if (end === null || end === undefined){
            var aw = waveforms[waveforms.length - 1];
            end = (new NITimestamp(aw.t0)).add(aw.dt * aw.Y.length).valueOf();
        }

        waveforms.forEach(function (waveform) {
            updateMinMax(waveform, minMax, start, end);
        });

        return {
            ymin: minMax.min,
            ymax: minMax.max
        }

    }

    function updateMinMax(aw, minMax, start, end) {
        var startTS, endTS, t,
            Y = aw.Y,
            t0 = new NITimestamp(aw.t0);

        if (Y.length === 0) {
            return;
        }

        startTS = t0.valueOf();
        endTS = (new NITimestamp(t0)).add(aw.dt * aw.Y.length).valueOf();

        if (startTS > end || endTS < start) {
            return;
        }

        for (var i = 0; i < Y.length; i++) {
            t = (new NITimestamp(t0)).add(aw.dt * i).valueOf();
            if (t < start || t > end) {
                continue;
            }

            if (Y[i] == null || Y[i] === Infinity || Y[i] === -Infinity || isNaN(Y[i])) {
                continue;
            }

            if (Y[i] > minMax.max) {
                minMax.max = Y[i];
            }

            if (Y[i] < minMax.min) {
                minMax.min = Y[i];
            }
        }
    }


    HistoryBufferWaveform.prototype.toJSON = function() {
        var serializedHb = {
            data: this.toArray(),
            width: this.width,
            capacity: this.capacity,
            valueType: 'HistoryBuffer',
            startIndex: this.startIndex(),
            count: this.count
        };

        return serializedHb;
    };

    if (typeof module === 'object' && module.exports) {
        module.exports = HistoryBufferWaveform;
    } else {
        global.HistoryBufferWaveform = HistoryBufferWaveform;
    }
})(window);
