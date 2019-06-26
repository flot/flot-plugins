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
/* history buffer data structure for charting.
*/
/*globals CBuffer, SegmentTree, module*/

/**
# HistoryBuffer

> A historyBuffer is a data structure that enables efficient charting operations
on a sliding window of data points.

In the case of large data buffers it is inefficient to draw every point of the
chart. Doing this results in many almost vertical lines drawn over the same
stripe of pixels over and over again. Drawing a line on a canvas is an expensive
operation that must be avoided if possible.

One method of avoiding the repeated drawing is to reduce the amount of data points
we draw on the chart by sub-sampling the data, also called decimation.

There are many ways to decimate the data; the one this history buffer implements
is to divide data into "1 pixel wide buckets" and then for each bucket select the
maximum and minimum as subsamples. This method results in a drawing that looks
visually similar with the one in which all samples are drawn.

The history buffer is a circular buffer holding the chart data accompanied by an
acceleration structure - a segment tree of min/max values.

The segment tree is only enabled for big history buffers.

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

    /* The branching factor determines how many samples are decimated in a tree node.
     * It affects the performance and the overhead of the tree.
     */
    var defaultBranchFactor = 32; // 32 for now. TODO tune the branching factor.

    /** **HistoryBuffer(capacity, width)** - the History buffer constructor creates
    a new history buffer with the specified capacity (default: 1024) and width (default: 1)*/
    var HistoryBufferNumeric = function (capacity, width) {
        this.capacity = capacity || 1024;
        this.width = width || 1;
        this.lastUpdatedIndex = 0;
        this.firstUpdatedIndex = 0;
        this.branchFactor = defaultBranchFactor;

        this.buffers = []; // circular buffers for data
        this.trees = []; // segment trees

        for (var i = 0; i < this.width; i++) {
            this.buffers.push(new CBuffer(capacity));
            this.trees.push(new SegmentTree(this, this.buffers[i]));
        }

        this.buffer = this.buffers[0];
        this.tree = this.trees[0];

        this.count = 0;
        this.callbacks = new Map();
        this.changed = false;
    };

    HistoryBufferNumeric.prototype.callOnChange = function (args) {
        this.callbacks.forEach(callback => {
            callback(args);
        });
    };

    HistoryBufferNumeric.prototype.setBranchingFactor = function (b) {
        this.branchFactor = b;

        this.rebuildSegmentTrees();
    };

    HistoryBufferNumeric.prototype.getDefaultBranchingFactor = function () {
        return defaultBranchFactor;
    };

    HistoryBufferNumeric.prototype.rebuildSegmentTrees = function () {
        this.trees = []; // new segment trees

        for (var i = 0; i < this.width; i++) {
            this.trees.push(new SegmentTree(this, this.buffers[i]));
        }

        this.tree = this.trees[0];

        this.firstUpdatedIndex = this.startIndex();
        this.lastUpdatedIndex = this.firstUpdatedIndex;

        this.updateSegmentTrees();
    };

    /** **clear()** - clears the history buffer */
    HistoryBufferNumeric.prototype.clear = function () {
        for (var i = 0; i < this.width; i++) {
            this.buffers[i].empty();
        }

        this.count = 0; // todo fire changes and upate lastindex, startindex
        this.rebuildSegmentTrees();
        this.changed = true;
        if (this.callOnChange) {
            this.callOnChange();
        }
    };

    /** **setCapacity(newCapacity)** changes the capacity of the History Buffer and clears all the data inside it */
    HistoryBufferNumeric.prototype.setCapacity = function (newCapacity) {
        if (newCapacity !== this.capacity) {
            this.capacity = newCapacity;
            this.buffers = []; // circular buffers for data

            for (var i = 0; i < this.width; i++) {
                this.buffers.push(new CBuffer(newCapacity));
            }

            this.buffer = this.buffers[0];
            this.count = 0; // todo fire changes and upate lastindex, startindex
            this.rebuildSegmentTrees();
            this.changed = true;
            if (this.callOnChange) {
                this.callOnChange();
            }
        }
    };

    /** **setWidth(newWidth)** - changes the width of the History Buffer and clears
    all the data inside it */
    HistoryBufferNumeric.prototype.setWidth = function (newWidth) {
        if (newWidth !== this.width) {
            this.width = newWidth;
            this.buffers = []; // clear the circular buffers for data. TODO reuse the buffers

            for (var i = 0; i < this.width; i++) {
                this.buffers.push(new CBuffer(this.capacity));
            }

            this.buffer = this.buffers[0];
            this.count = 0; // todo fire changes and upate lastindex, startindex
            this.rebuildSegmentTrees();
            this.changed = true;
            if (this.callOnChange) {
                this.callOnChange();
            }
        }
    };

    /* returns the current width of History Buffer */ 
    HistoryBufferNumeric.prototype.getWidth = function () {
        return this.width;
    };

    /* store an element in the history buffer, don't update stats */
    HistoryBufferNumeric.prototype.pushNoStatsUpdate = function (item) {
        if (typeof item === 'number' && this.width === 1) {
            this.buffer.push(item);
        } else {
            if (Array.isArray(item) && item.length === this.width) {
                for (var i = 0; i < this.width; i++) {
                    this.buffers[i].push(item[i]);
                }
            }
        }
    };

    /** **push(item)** - adds an element to the history buffer */
    HistoryBufferNumeric.prototype.push = function (item) {
        this.pushNoStatsUpdate(item);
        this.count++;

        this.changed = true;
        if (this.callOnChange) {
            this.callOnChange();
        }

    };

    /** **startIndex()** - returns the index of the oldest element in the buffer*/
    HistoryBufferNumeric.prototype.startIndex = function () {
        return Math.max(0, this.count - this.capacity);
    };

    /** **lastIndex()** - returns the index of the newest element in the buffer*/
    HistoryBufferNumeric.prototype.lastIndex = function () {
        return this.startIndex() + this.buffer.size;
    };

    /** **get(n)** - returns the nth element in the buffer*/
    HistoryBufferNumeric.prototype.get = function (index) {
        index -= this.startIndex();
        if (this.width === 1) {
            return this.buffer.get(index);
        } else {
            var res = [];

            for (var i = 0; i < this.width; i++) {
                res.push(this.buffers[i].get(index));
            }

            return res;
        }
    };

    /** **appendArray(arr)** - appends an array of elements to the buffer*/
    HistoryBufferNumeric.prototype.appendArray = function (arr) {
        for (var i = 0; i < arr.length; i++) {
            this.pushNoStatsUpdate(arr[i]);
        }

        this.count += arr.length;

        this.changed = true;
        if (this.callOnChange) {
            this.callOnChange();
        }
    };

    /** **toArray()** - returns the content of the history buffer as an array */
    HistoryBufferNumeric.prototype.toArray = function () {
        if (this.width === 1) {
            return this.buffer.toArray();
        } else {
            var start = this.startIndex(),
                last = this.lastIndex(),
                res = [];
            for (var i = start; i < last; i++) {
                res.push(this.get(i));
            }

            return res;
        }
    };

    /* update the segment tree with the newly added values*/
    HistoryBufferNumeric.prototype.updateSegmentTrees = function () {
        var buffer = this.buffer;

        this.trees.forEach(function (tree) {
            tree.updateSegmentTree();
        });

        this.firstUpdatedIndex = this.startIndex();
        this.lastUpdatedIndex = this.firstUpdatedIndex + buffer.size;
    };

    /** **toDataSeries()** - returns the content of the history buffer into a
    flot data series*/
    HistoryBufferNumeric.prototype.toDataSeries = function (index) {
        var buffer = this.buffer;

        var data = [];

        var start = this.startIndex();

        for (var i = 0; i < buffer.size; i++) {
            data.push([i + start, this.buffers[index || 0].get(i)]);
        }

        return data;
    };

    HistoryBufferNumeric.prototype.registerOnChange = function (key, f) {
        if (this.callbacks.has(key)) {
            console.log('Callback with the given key has already been registered.');
            return;
        }

        this.callbacks.set(key, f);
    };

    HistoryBufferNumeric.prototype.deregisterOnChange = function (key) {
        this.callbacks.delete(key);
    };

    /** **query(start, end, step, index)** - decimates the data set at the
    provided *index*, starting at the start sample, ending at the end sample
    with the provided step */
    HistoryBufferNumeric.prototype.query = function (start, end, step, index) {
        if (index === undefined) {
            index = 0;
        }

        if (this.changed) {
            this.updateSegmentTrees();
            this.changed = false;
        }

        return this.trees[index].query(start, end, step);
    };

    /** **rangeX( index)** - returns the range of the data in the buffer*/
    HistoryBufferNumeric.prototype.rangeX = function (index) {
        var start = this.startIndex(),
            end = this.lastIndex()-1;

        if (end === start - 1) {
            return {};
        }

        return { xmin: start,
                 xmax: end,
                 deltamin: 1
               };
    };

    /** **rangeY(start, end, index)** - returns the range of the data
    in a given interval of the buffer*/
    HistoryBufferNumeric.prototype.rangeY = function (start, end, index) {
        if (start === null || start === undefined){
            start = this.startIndex();
        }
        if (end === null || end === undefined){
            end = this.lastIndex()-1;
        }
        if (index === null || index === undefined) {
            index = 0;
        }

        if (this.changed) {
            this.updateSegmentTrees();
            this.changed = false;
        }

        var data = this.query(start, end, end - start, index),
            dataLength = data.length;

        if (dataLength > 0) {
            var res = {
                ymin: Infinity,
                ymax: -Infinity
            };

            for (var i = 0; i < dataLength; i += 2) {
                if (data[i + 1] == null || data[i + 1] === Infinity || data[i + 1] === -Infinity || isNaN(data[i + 1])) {
                    continue;
                }
                res.ymin = Math.min(res.ymin, data[i + 1]);
                res.ymax = Math.max(res.ymax, data[i + 1]);
            }

            return res;
        }
        return { };
    };

    HistoryBufferNumeric.prototype.toJSON = function() {
        var serializedHb = {
            data: [],
            width: this.width,
            capacity: this.capacity,
            valueType: 'HistoryBuffer',
            startIndex: this.startIndex(),
            count: this.count
        };

        if(this.width === 1) {
            serializedHb['data'] = this.buffer.toArray();
        } else {
            for (var i = 0; i < this.width; i++) {
                    serializedHb['data'].push(this.buffers[i].toArray());
            }
        }

        return serializedHb;
    };

    if (typeof module === 'object' && module.exports) {
        module.exports = HistoryBufferNumeric;
    } else {
        global.HistoryBufferNumeric = HistoryBufferNumeric;
    }
})(window);
