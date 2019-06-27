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
/* history buffer data structure for charting, supporting numeric and waveform data
*/
/*globals CBuffer, SegmentTree, module*/

/**
# HistoryBuffer

> A historyBuffer is a data structure that enables efficient charting operations
on a sliding window of data points.

Example:
```javascript
var hb1 = new HistoryBuffer(1024);

// in a history buffer with width 1 we can push scalars
hb1.push(1);
hb1.push(2);

console.log(hb1.toArray()); //[1, 2]

// as well as 1 elements arrays
hb1.push([3]);
hb1.push([4]);

console.log(hb1.toArray()); //[1, 2, 3, 4]

// or append an array
hb1.appendArray([5, 6]);

console.log(hb1.toArray()); //[1, 2, 3, 4, 5, 6]
```

The history buffer is able to store multiple "parallel" data sets. Example:

```javascript
var hb2 = new HistoryBuffer(1024, 2);

// in a history buffer with width > 1 we can only push arrays
hb2.push([1, 11]);
hb2.push([2, 12]);
hb2.push([3, 13]);

console.log(hb2.toArray()); //[[1, 11], [2, 12], [3, 13]]

// or append an array of arrays
hb2.appendArray([[4, 14], [5, 15], [6, 16]]);

console.log(hb2.toArray()); //[[1, 11], [2, 12], [3, 13], [4, 14], [5, 15], [6, 16]]
```

Operations accelerated by a historyBuffer
-----------------------------------------
The common charting operations performed on a history buffer are

* inserting elements at the head
* inserting m elements at the head
* deleting elements at the tail
* deleting m elements at the tail
* compute min/max on a range
* query for a "visually interesting" data subsample on a range

*/

/** ## HistoryBuffer methods*/
(function (global) {
    'use strict';

    /** **HistoryBuffer(capacity, width)** - the History buffer constructor creates
    a new history buffer with the specified capacity (default: 1024) and width (default: 1)*/
    var HistoryBuffer = function (capacity, width) {
        this.hb = new HistoryBufferNumeric(capacity, width);
        this.hbType = 'numeric';
    };

    /** **setType(type)** - sets the type of the history buffer. Accepted values are 'numeric' and 'analogWaveform' */
    HistoryBuffer.prototype.setType = function (type) {
        if (type === this.hbType) {
            return;
        }

        if (type === 'numeric') {
            var callbacks = this.hb.callbacks;
            this.hb.callbacks = undefined;
            this.hb = new HistoryBufferNumeric(this.capacity, this.width);
            callbacks.forEach((callback, key) => {
                this.hb.registerOnChange(key, callback);
            });

            this.hbType = 'numeric';
            this.hb.callOnChange();
        }

        if (type === 'analogWaveform') {
            var callbacks = this.hb.callbacks;
            this.hb.callbacks = undefined;
            this.hb = new HistoryBufferWaveform(this.capacity, this.width);
            callbacks.forEach((callback, key) => {
                this.hb.registerOnChange(key, callback);
            });
            this.hbType = 'analogWaveform';
            this.hb.callOnChange();
        }
    };

    /** **clear()** - clears the history buffer */
    HistoryBuffer.prototype.clear = function () {
        this.hb.clear();
    };

    /** **setCapacity(newCapacity)** changes the capacity of the History Buffer and clears all the data inside it */
    HistoryBuffer.prototype.setCapacity = function (newCapacity) {
        this.hb.setCapacity(newCapacity);
    };

    /** **setWidth(newWidth)** - changes the width of the History Buffer and clears
    all the data inside it */
    HistoryBuffer.prototype.setWidth = function (newWidth) {
        this.hb.setWidth(newWidth);
    };

    /** **push(item)** - adds an element to the history buffer */
    HistoryBuffer.prototype.push = function (item) {
        this.hb.push(item);
    };

    /** **startIndex()** - returns the index of the oldest element in the buffer*/
    HistoryBuffer.prototype.startIndex = function () {
        return this.hb.startIndex();
    };

    /** **lastIndex()** - returns the index of the newest element in the buffer*/
    HistoryBuffer.prototype.lastIndex = function () {
        return this.hb.lastIndex();
    };

    /** **get(n)** - returns the nth element in the buffer*/
    HistoryBuffer.prototype.get = function (index) {
        return this.hb.get(index);
    };

    /** **appendArray(arr)** - appends an array of elements to the buffer*/
    HistoryBuffer.prototype.appendArray = function (arr) {
        this.hb.appendArray(arr);
    };

    /** **toArray()** - returns the content of the history buffer as an array */
    HistoryBuffer.prototype.toArray = function () {
        return this.hb.toArray();
    };

    /** **toDataSeries()** - returns the content of the history buffer into a
    flot data series*/
    HistoryBuffer.prototype.toDataSeries = function (index) {
        return this.hb.toDataSeries(index);
    };

    HistoryBuffer.prototype.registerOnChange = function (key, f) {
        this.hb.registerOnChange(key, f);
    };

    HistoryBuffer.prototype.deregisterOnChange = function (key, f) {
        this.hb.deregisterOnChange(key, f);
    };

    /** **query(start, end, step, index)** - decimates the data set at the
    provided *index*, starting at the start sample, ending at the end sample
    with the provided step */
    HistoryBuffer.prototype.query = function (start, end, step, index) {
        return this.hb.query(start, end, step, index);
    };

    /** **rangeX(index)** - returns the range of the data in the buffer */
    HistoryBuffer.prototype.rangeX = function (index) {
        return this.hb.rangeX(index);
    };

    /** **rangeY(start, end, index)** - returns the range of the data
    in a given interval of the buffer*/
    HistoryBuffer.prototype.rangeY = function (start, end, index) {
        return this.hb.rangeY(start, end, index);
    };

    /** **toJSON()** - returns the JSON of the data in the buffer */
    HistoryBuffer.prototype.toJSON = function () {
        return this.hb.toJSON();
    };

    Object.defineProperty(HistoryBuffer.prototype, 'width', {
        get: function() {
            return this.hb.width;
        }
    });

    Object.defineProperty(HistoryBuffer.prototype, 'count', {
        get: function() {
            return this.hb.count;
        },
        set: function(count) {
            this.hb.count = count;
        },
    });

    Object.defineProperty(HistoryBuffer.prototype, 'capacity', {
        get: function() {
            return this.hb.capacity;
        }
    });

    if (typeof module === 'object' && module.exports) {
        module.exports = HistoryBuffer;
    } else {
        global.HistoryBuffer = HistoryBuffer;
    }
})(window);
