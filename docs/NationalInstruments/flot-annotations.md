# flot-annotations-plugin

This is a plugin for flot annotatations

Options
-------

The plugin supports these options:

```javascript
    annotations: [
        {
            show: false,
            location: 'relative',
            x: 0,
            y: 0,
            label: '',
            showArrow: false,
            arrowDirection: ''
            contentFormatter: c => c,
            borderColor: '#000000',
            borderThickness: 1,
            backgroundColor: '#ffffff',
            font: '',
            color: '#000000',
            textAlign: 'left',
            arrowLength: 20,
            arrowWidth: 5,
            padding: 5,
            defaultxaxis: 1,
            defaultyaxis: 1
        },
    ]
```

**show** show annotations

**location** how to interpret the x, y of the content items. 'relative' means in the coordinate space 0-1 and 'absolute' means in domain coordinates

**x** The x position of an annotation

**y** The y position of an annotation

**label** The text content of the annotation (may contain newlines represented as <br>)

**showArrow** Show an arrow from the x, y coordinate to the text. The text will be offset by the arrow length and arrowDirection

**arrowDirection** The direction from x, y to the label , values are compass directiond '', 'n', 's', 'e', 'w', 'ne', 'nw', 'se','sw', if the value is empty then the arrow will default based on which quadrant of the graph x & y are. 

**contentFormatter** A function to format the annotation

**borderColor** The color of the border

**borderThickness** The width of the border

**backgroundColor** The background color of the annotations

**font** The font for the text

**color** The color of the text

**textAlign** The alignment of the text, values are 'left', 'center', 'right'

**arrowLength** The length of the arrow in pixels

**arrowWidth** The width of the arrow in pixels where it meets the content box

**padding** The padding of the text inside the box

**defaultxaxis** The 1 based index of the x axis which the absolute coordinates are relative to

**defaultyaxis** The 1 based index of the y axis which the absolute coordinates are relative to

```

Public Methods and events
-------------------------

The plugin adds some public methods to the plot:

* plot.getAnnotations()

    Returns a list containing all the annotations

* plot.addAnnotation( options )

    creates a new annotation with the parameters specified in options.

* plot.removeAnnotation(annotationToRemove)

    remove the specified annotation from the plot. annotationToRemove is an annotation
    reference to one of the annotations obtained with getAnnotations()

* plot.hitTest(x, y)

    Tests which annotations contain the relative coordinates passed in
    Returns an array of indices of the annotations matched

* plot.getBounds (index)

    Returns the bounds of the annotation at index in relative coordinates
    If index is out of bounds returns undefined

How to use
----------

```javascript
var myFlot = $.plot( $("#graph"), ...,
{
    ...
    series: [
            annotations: [
            {
                show: true,
                location: 'relative',
                x: 0.5,
                y: 0.5,
                label: 'hello world2<br>newline',
                arrowDirection: 'n',
                showArrow: true,
                contentFormatter: c => c,
                borderColor: '#FF0000',
                borderThickness: 1,
                backgroundColor: '#009900',
                font: '12pt',
                color: '#440056',
                textAlign: 'center',
                arrowLength: 50,
                defaultxaxis: 1,
                defaultyaxis: 1
            }
        ]
    ]
    ...
});
```
