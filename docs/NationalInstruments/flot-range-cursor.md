# flot-range-cursors-plugin

This is a plugin for flot to create range cursors. Range cursors are used to measure various values on the graphs and charts. Multiple cursors are supported.

This plugin is based on another plugin `flot-cursors-plugin.js` which can be found in the flot chart package an adjacent repo in this org

Options
-------

The plugin supports these options:

```javascript
    cursors: [
        {
            name: string,
            position: {
                relativeStart: number
                relativeEnd: number
                start: number
                end: number
            },
            show: true or false,
            selected: true or false,
            highlighted: true or false,
            orientation: 'vertical' or 'horizontal',
            halign: 'above' or 'below',
            transparentRange: 'outside' or 'inside',
            showLabel: true or false,
            showValue: true or false,
            showBorders: true or false,
            color: color,
            fillColor: color,
            fontSize: '<number>px',
            fontFamily: string,
            fontStyle: string,
            fontWeight: string,
            lineWidth: number,
            movable: true or false,
            dashes: number,
            defaultxaxis: number,
            defaultyaxis: number
        },
        <more range cursors if needed>
    ]
```

**name** is a string containing the name/label of the cursor.

**position** position of the cursor. It can be specified relative to the canvas, using a *relativeStart, relativeEnd* pair of coordinates which are expressed as a number between 0 and 1. It can be also specified using axis based coordinates ( *start, end* ).

**show** is the cursor visible

**selected** is the cursor selected

**highlighted** is the cursor highlighted

**orientation** are the cursor edges vertical (in that case the range is along the x axis) or horizontal (in that case the range is along the y axis)

**halign** The position of the label relative to the value. 'Above' means the label is above the value

**transparentRange** The area of the range cursor that is transparent. Inside means the inside is transparent and the outside is opaque

**showLabel** if true the name of the cursor will be displayed next to the cursor manipulator.

**showValue** the value of the range the cursor spans (relative to the specified plot or axis) will be displayed inside the cursor range.

**showBorders** Show the borders and and arrow across the range

**color** is the color of the cursor (default is "gray")

**fillColor** is the color of the non-transparent part of (default is "#4F4F4F4F")

**fontSize** sets the font size of the cursor labels and intersection value labels. Default is '10px'.

**fontFamily** sets the font size of the cursor labels and intersection value labels. Default is 'sans-serif'.

**fontStyle** sets the font size of the cursor labels and intersection value labels. Default is ''.

**fontWeight** sets the font size of the cursor labels and intersection value labels. Default is ''.

**lineWidth** is the width of the drawn lines (default is 1). Setting lineWidth to zero creates an invisible cursor.

**movable** if true, the cursor can be moved with the mouse. Default is true.

**dashes** see: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setLineDash. The property here is analogous to the referenced 'segments' argument. This property affects any line that is rendered for the cursor.

**defaultxaxis**: the one-based index of the x axis to follow when the cursor is snapping to no plot

**defaultyaxis**: the one-based index of the y axis to follow when the cursor is snapping to no plot

```

Public Methods and events
-------------------------


The plugin adds some public methods to the plot:

* plot.getRangeCursors()

    Returns a list containing all the range cursors

* plot.addRangeCursor(options)

    creates a new range cursor with the parameters specified in options.

* plot.removeRangeCursor(cursorToRemove)

    remove the specified range cursor from the plot. cursorToRemove is a cursor
    reference to one of the cursors obtained with getCursors()

* plot.setRangeCursor(cursor , options)

    changes one or more range cursor properties.

How to use
----------

```javascript
var myFlot = $.plot( $("#graph"), ...,
{
    ...
    rangecursors: [
        { name: 'Green cursor', orientation: 'vertical', color: 'green', position { start: 0.5, end: 0.6} },
        { name: 'Red cursor', mode: 'xy', color: 'red' }
    ]
    ...
});
```
