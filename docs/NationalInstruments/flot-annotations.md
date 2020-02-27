# flot-annotations-plugin

This is a plugin for flot annotatations

Options
-------

The plugin supports these options:

```javascript
    highlights: [
        {
                    show: false,
                    location: 'relative',
                    content: [
                        {
                            x: 0,
                            y: 0,
                            label: '',
                            showArrow: false,
                            arrowDirection: ''
                        }
                    ],
                    contentFormatter: c => c,
                    borderColor: '#000000',
                    borderThickness: 1,
                    backgroundColor: '#ffffff',
                    font: '',
                    color: '#000000',
                    textAlign: 'left',
                    arrowLength: 20,
                    arrowWidth: 5,
                    padding: 5
        },
    ]
```

**show** show annotations

**location** how to interpret the x, y of the content items. 'relative' means in the coordinate space 0-1 and 'absolute' means in domain coordinates

**content** An array of content for annotations.

**x** The x position of a content item

**y** The y position of a content item

**label** The text contain of the item (may contain newlines)

**showArrow** Show an arrow from the x, y coordinate to the text. The text will be offset by the arrow length and arrowDirection

**arrowDirection** The direction from x, y to the label , values are compass directiond '', 'n', 's', 'e', 'w', 'ne', 'nw', 'se','sw', if the value is empty then the arrow will default based on which quadrant of the graph x & y are

**contentFormatter** A function to format the content

**borderColor** The color of the border

**borderThickness** The width of the border

**backgroundColor** The background color of the annotations

**font** The font for the text

**color** The color of the text

**textAlign** The alignment of the text, values are 'left', 'center', 'right'

**arrowLength** The length of the arrow in pixels

**arrowWidth** The width of the arrow in pixels where it meets the content box

**padding** The padding of the text inside the box

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
            annotations: {
                show: true,
                location: 'relative',
                content: [
                    {x: 0.5, y: 0.5, label: 'hello world2\nnewline', arrowDirection: 'n', showArrow: true},
                    {x: 0.5, y: 0.5, label: 'hello world2\nnewline', arrowDirection: 's', showArrow: true}
                ],
                contentFormatter: c => c,
                borderColor: '#FF0000',
                borderThickness: 1,
                backgroundColor: '#009900',
                lineWidth: 2,
                font: '12pt',
                color: '#440056',
                textAlign: 'center',
                arrowLength: 50,
            }
    ]
    ...
});
```
