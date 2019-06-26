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



## HistoryBuffer methods

**HistoryBuffer(capacity, width)** - the History buffer constructor creates
   a new history buffer with the specified capacity (default: 1024) and width (default: 1)

**clear()** - clears the history buffer

**setCapacity(newCapacity)** changes the capacity of the History Buffer and clears all the data inside it

**setWidth(newWidth)** - changes the width of the History Buffer and clears
   all the data inside it

**push(item)** - adds an element to the history buffer

**startIndex()** - returns the index of the oldest element in the buffer

**lastIndex()** - returns the index of the newest element in the buffer

**get(n)** - returns the nth element in the buffer

**appendArray(arr)** - appends an array of elements to the buffer

**toArray()** - returns the content of the history buffer as an array

**toDataSeries()** - returns the content of the history buffer into a
   flot data series

**query(start, end, step, index)** - decimates the data set at the
   provided *index*, starting at the start sample, ending at the end sample
   with the provided step
