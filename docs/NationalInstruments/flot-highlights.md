# flot-highlights-plugin

This is a plugin for flot to highight points, bars and lines.

Options
-------

The plugin supports these options:

```javascript
    highlights: [
        {
            selectedRange: [],
            selectedIndexes: [],
            show: false,
            highlightLineWidth: 1,
            highlightColor: '#ffffff',
            highlightPoints: true,
            highlightLines: false,
            highlightBars: false,
        },
    ]
```

**selectedRange** the selected index range inside which points will be highlighted. This is an array of arrays one for each series - each sub array contains the ranges to be selected on the corresponding series. Each range is an array of two numbers - the start and end index to use.

**selectedIndexes** the selected indexes of the points that will be highlighted. This is an array of arrays one for each series - each sub array contains the indexes to be selected on the corresponding series.

**show** show higlights

**highlightLineWidth** the line width of the highlight.

**highlightColor** the color to draw the highlights - there will be a faint black shadow around the points if higlighting points.

**higlightPoints** highlight points.

**highlightLines** highlight entires lines - if any point in selectedIndexes belongs to the line highlight the entire line, if selectedRange has a range then highlight the line in that range.

**highlightBars** highlight bars by drawing an outline around them

```

Public Methods and events
-------------------------


The plugin adds no public methods to the plot:

How to use
----------

```javascript
var myFlot = $.plot( $("#graph"), ...,
{
    ...
    series: [
        highlights: {
            selectedRange: [[0, 12], [24, 56]],
            selectedIndexes: [[0,1,2,212], [3,4,5]],
            show: false,
            highlightLineWidth: 1,
            highlightColor: '#ffffff',
            highlightPoints: true,
            highlightLines: false,
            highlightBars: false,
        }
    ]
    ...
});
```
