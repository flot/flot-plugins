flot.cursors
============

This is a plugin for flot to create cursors. Cursors are used to measure various values on the graphs and charts. Multiple cursors are supported.

This plugin is based on another plugin `jQuery.flot.crosshair.js` which can be found in the flot chart package at <http://www.flotcharts.org/>

This plugin should be used with another plugin `flot-thumb-plugin`.

Options
-------

The plugin supports these options:

```javascript
    cursors: [
        {
            name: string
            mode: null or 'x' or 'y' or 'xy',
            color: color,
            lineWidth: number,
            position: {
                relativeX or x or x2 or x3 ..: number,
                relativeY or y or y2 or y3 ..: number
            },
            valign: 'below' or 'above',
            halign: 'right' or 'left',
            show: true or false,
            showLabel: true or false,
            showValues: true or false,
            snapToPlot: undefined, -1, 0 or positive number,
            interpolate: true or false,
            defaultxaxis: 1,
            defaultyaxis: 1,
            symbol: 'cross', 'triangle' ...,
            movable: true or false,
            dashes: number,
            showIntersections: true or false or array,
            intersectionColor: color,
            intersectionLabelPosition: 'bottom-right', 'right', 'top-right' 'bottom-left', 'left' or 'top-left',
            fontSize: '<number>px',
            fontFamily: string,
            fontStyle: string,
            fontWeight: string,
            formatIntersectionData: null or function(point),
            showThumbs: 'b', 'l', 't', 'r' or 'none',
            thumbAbbreviation: string,
            thumbClassList: [string],
            thumbColor: color,
        },
        <more cursors if needed>
    ]
```

**name** is a string containing the name/label of the cursor.

**mode** is one of "x", "y" or "xy". The "x" mode enables a vertical cursor that lets you trace the values on the x axis, "y" enables a horizontal cursor and "xy" enables them both. "xy" is default. This is used only for configuring the drawing of vertical and horizontal line.

**color** is the color of the cursor (default is "rgba(170, 0, 0, 0.80)")

**lineWidth** is the width of the drawn lines (default is 1). Setting lineWidth to zero creates an invisible cursor.

**position** position of the cursor. It can be specified relative to the canvas, using a *relativeX, relativeY* pair of coordinates which are expressed as a number between 0 and 1. It can be also specified using axis based coordinates ( *x, x2, x3 .., y, y2, y3* ).

**valign** is the vertical position of the label and values relative to the cursor symbol. Possible values: 'below' or 'above'. Default is 'below'.

**valign** is the horizontal position of the label and values relative to the cursor symbol. Possible values: 'right' or 'left'. Default is 'right'.

**show** if false the cursor won't be visible and the mouse interactions for it will be disabled. Default value: true.

**showLabel** if true the name of the cursor will be displayed next to the cursor manipulator.

**showValues** the coordinate of the cursor (relative to the specified plot or axis) will be displayed next to the cursor manipulator.

**snapToPlot** specifies a plot to which the cursor will snap. If set to -1 then the cursor will snap to any plot. If not specified or set to undefined, NaN or any value smaller than -1 then the cursor will be free.

**interpolate** if true, the position of the cursor will be set as interpolation on OY axis between nearest points to it's position. Otherwise, it will snap to the nearest point.

**defaultxaxis**: the one-based index of the x axis to follow when the cursor is snapping to no plot

**defaultyaxis**: the one-based index of the y axis to follow when the cursor is snapping to no plot

**symbol** a shape ('cross', 'triangle' ...). The cursor manipulator will have this shape. Set to 'none' to draw no symbol.

**symbolSize** define the size of the cursor manipulator symbol, in pixels.

**movable** if true, the cursor can be moved with the mouse. Default is true.

**dashes** see: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setLineDash. The property here
is analogous to the referenced 'segments' argument. This property affects any crosshair that is rendered for the cursor.

**showIntersections** if true the intersection with the plots will be displayed as grey rectangles. Can be set to an array of series indices to only show intersections with those series. Default is false.

**intersectionColor** sets the color of the boxes drawn at intersections, and also the color of the text showing the value at the intersection. Default is 'darkgray'.

**intersectionLabelPosition** sets where the intersection label text appears, relative to the intersection. Default is 'bottom-right'.

**fontSize** sets the font size of the cursor labels and intersection value labels. Default is '10px'.

**fontFamily** sets the font size of the cursor labels and intersection value labels. Default is 'sans-serif'.

**fontStyle** sets the font size of the cursor labels and intersection value labels. Default is ''.

**fontWeight** sets the font size of the cursor labels and intersection value labels. Default is ''.

**formatIntersectionData** allows you to provide a custom formatting function for data. point parameter is composed of
```
{
    x: interpolated intersection x position,
    y: interpolated intersection y position,
    leftPoint: the closest datapoint on the left of the intersection,
    rightPoint: the closest datapoint on the right of the intersection
 }
```
**showThumbs** controls the type and position of cursor thumbs. ShowThumbs with value 'l' creates an yaxis thumb
positioned at the left of the graph, meanwhile an 'r' value will put it at the right of the graph.
For a thumb with mode 'x', an 'b' or 't' value for showThumbs should be set if a thumb is needed.
For a 'y' thumb, 'l' or 'r' should be set for showThumbs enum. 
For a thumb with mode 'xy', showThumbs supports multiple settings once, like 'tl', 'tr', 'bl' or 'br'.
In case support for touch is not intended,
thumbs should not be used and can be deactivated by value 'none'. Default value: 'none'.

**thumbAbbreviation** allows you to provide a label to a thumb. The label will be displayed
over the thumb icon. Default value: Cn where n is cursor's index

**thumbClassList** sets the classList of thumb element. Default value: ['draggable'].

**thumbColor** is the color of the cursor thumbs. Default value: ''.

Public Methods
-------------------------


The plugin adds some public methods to the plot:

* plot.getCursors()

    Returns a list containing all the cursors

* plot.addCursor(options)

    creates a new cursor with the parameters specified in options.

* plot.removeCursor(cursorToRemove)

    remove the specified cursor from the plot. cursorToRemove is a cursor
    reference to one of the cursors obtained with getCursors()

* plot.setCursor(cursor , options)

    changes one or more cursor properties.

* plot.getIntersections(cursor)

    returns the intersections of the cursor with plots. This can be the nearest
    point of the plot or the interpolated nearest values, depending on the cursor
    interpolate option. 	

* plot.formatCursorPosition(plot, cursor)

    return the formatted text values of the position of cursor as an
    object { xTextValue, yTextValue }

Events
------

### cursorupdates
Every time one or more cursors changes state a *cursorupdates* event is emitted on the chart container.
These events are emitted in one of these situations:

* cursor added
* cursor removed
* cursor moved
* intersections of the cursors with the plots changed due to chart data changes

### thumbCreated
The thumbCreated event is fired on the graph's placeholder whenever a new thumb is created. The event instance is the instance of CustomEvent.
#### data in the detail property
|**Property**| Type | Description |
|:----------------------:|:---------------:|:-------------------------------------------:|
| **current**            | SVG element     | the thumb/handle                            | 

### thumbWillBeRemoved
The thumbWillBeRemoved event is fired on the graph's placeholder whenever a thumb will be removed. The event instance is the instance of CustomEvent.
#### data in the detail property
|**Property**| Type | Description |
|:----------------------:|:---------------:|:-------------------------------------------:|
| **current**            | SVG element     | the thumb/handle                            | 

### thumbVisibilityChanged
The thumbVisibilityChanged event is fired when a thumb's visibility changes due to the change of show and showThumbs. The event instance is the instance of CustomEvent.
#### data in the detail property
|**Property**| Type | Description |
|:----------------------:|:---------------:|:-------------------------------------------:|
| **current**            | SVG element     | the thumb/handle                            |
| **visible**            | boolean         | the value indicating the visibility of thumb| 

How to use
----------

```javascript
var myFlot = $.plot( $("#graph"), ...,
{
    ...
    cursors: [
        { name: 'Green cursor', mode: 'xy', color: 'green' },
        { name: 'Red cursor', mode: 'xy', color: 'red' }
    ]
    ...
});

$("#graph").bind("cursorupdates", function (event, cursordata) {
    cursordata.forEach(function (cursor) {
        console.log("Cursor " + cursor.cursor + " intersections:");
        cursor.points.forEach(function (point) {
            console.log("x:" + point.x + " y: " + point.y);
        });
    });
});
```    
