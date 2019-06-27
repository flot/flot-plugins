flot-axishandle-plugin
============

This is a plugin for flot to create axis handles. The user can drag an axis handle to offset the associated axis. Multiple axis handles are supported.

Options
-------

The plugin supports these options:

```javascript
    axisHandles: [
        {
            position: number between 0 and 1,
            absolutePosition: number,
            show: true or false,
            location: 'near' or 'far',
            handleLabel: string,
            orientation: 'horizontal' or 'vertical',
            axisIndex: 0-based number,
            radius: number,
            handleClassList: [string],
            fill: color,
            horizontalHandleConstrain: function,
            verticalHandleConstrain: function
        },
        <more axis handles if needed>
    ]
```

**position** position of the axis handle. It can be specified relative to the axis as a number between 0 and 1. Default value is 0.5.

**absolutePosition** the axis handle position defined by the value on the axis. It has higher priority than position. Default value: undefined.

**show** if false the axis handle won't be visible and the mouse interactions for it will be disabled. Default value: true.

**orientation** is one of "horizontal" and "vertical". This value is context-independent. The same property can be used to position the axis handle in a Cartesian, Polar, or other coordinate system (currently we only have Cartesian). By convention, the values follow the geometric definition of the space (matching the natural layout of graphs): for Cartesian, the origin is in the lower-left corner, with horizontal (x) values increasing to the right and vertical (y) values increasing to the top. For Polar, the origin is at the center, with horizontal (θ) values increasing counter-clockwise and vertical (r) values increasing outward. Take the Cartesian as an example. If we set mode as "horizontal", we can move the handle horizontally. When this property is changed, the handle will be repositioned accordingly. For example if the handle's orientation is 'horizontal' and the handlePosition is 'far', when switching the orientation from 'horizontal' to 'vertical' the handle is repositioned from the top of the graph to the right side. Default value is 'vertical'.

**axisIndex** indicates the axis index on the requested orientation. This value is 0-based. If the current index is unavailable for the requested orientation, an error message is logged in the console and the first index of the requested orientation is used. Default value is 0.

**location** is one of "near" and "far". It controls the location of the axis handle. "near" means the position that is close to the axis. "far" means the position far away from the axis. Take the cartesian coordinate system as an example. If the orientation property is 'vertical', the near handle is at the left side of the coordinate system. The far handle is at the right side of the coordinate system. Default value is 'far'.

**handleLabel** allows you to provide a label to a handle. The label will be displayed over the handle icon. Default value: n where n is handle's index.

**radius** allows you to specify the radius of the handle. Default value is 17.

**handleClassList** sets the classList of the handle(thumb). Default value is ['draggable'].

**fill** is the color of the axis handle thumb. Default value: undefined (use fill color from CSS class .thumbIcon).

**horizontalHandleConstrain** describes constrain for the horizontal handle movement. Default value is undefined.

**verticalHandleConstrain** describes constrain for the vertical handle movement. Default value is undefined. Both the horizontalHandleConstrain and verticalHandleConstrain have the same input arguments and returned value type as the constrain property of the thumb plugin. The constrain function should be like:
```javascript
    axisHandle.horizontalHandleConstrain = (mouseX, mouseY, previousX, previousY) => {
        // new X and Y
        return [mouseX, previousY];
    }
```

Public Methods
-------------------------

The plugin adds some public methods to the plot:

* plot.getAxisHandles()

    Returns a list containing all the axis handles

* plot.addAxisHandle(options)

    Creates a new axis handle with the parameters specified in options.

* plot.removeAxisHandle(handleToRemove)

    Remove the specified axis handle from the plot. handleToRemove is an axis handle
    reference to one of the axis handles obtained with getAxisHandles()

* plot.setAxisHandle(axisHandle, options)

    Changes one handle properties. Do not modify a property of the axis handle directly. For example, this will not re-render an axis handle:
    ```javascript
        // Wrong
        axisHandle.orientation = 'horizontal';
    ```
    
* plot.setAxisHandlePlotPositionConstrain(constrain)
    
    Changes the constrain of the position relative to the graph area. By default an axis handle is constrained inside the graph. The constrain is a function like:
    ```javascript
    (mouseX, mouseY) => {  
        const offset = plot.offset();
        return [
            Math.max(0, Math.min(mouseX - offset.left, plot.width())),
            Math.max(0, Math.min(mouseX - offset.top, plot.height()))
        ];
    }
    ```
    
Events
------

### axisHandleUpdates
Every time one or more axis handles changes state an axisHandleUpdates event is emitted on the chart container. These events are emitted in one of these situations:
* axis handle added
* axis handle removed
* axis handle changed
* axis handle moved

### thumbIntoRange
The thumbIntoRange event is fired on the plot's event holder when moving a thumb into the graph area. The thumbIntoRange event object is the instance of CustomEvent.
#### data in the detail properties
|**Property**| Type | Description |
|:----------------------:|:---------------:|:----------------------------------------------------------:|
| **target**             | <g> SVG element | the selected thumb/handle                                  | 
| **edge**               | string          | one of 'topleft', 'topright', 'bottomleft', 'bottomright'  | 
| **orientation**        | string          | 'horizontal' or 'vertical'                                 |
| **position(option)**   | float           | position relative to the thumb layer                       |

### thumbOutOfRange
The thumbOutOfRange event is fired on the plot's event holder when moving a thumb off the graph area. The thumbOutOfRange event object is the instance of CustomEvent.
#### data in the detail properties
|**Property**| Type | Description |
|:----------------------:|:---------------:|:----------------------------------------------------------:|
| **target**             | <g> SVG element | the selected thumb/handle                                  |
| **edge**               | string          | one of 'topleft', 'topright', 'bottomleft', 'bottomright'  | 
| **orientation**        | string          | 'horizontal' or 'vertical'                                 |
| **position(option)**   | float           | position relative to the thumb layer                       |

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
The thumbVisibilityChanged event is fired when a thumb's visibility changes due to the change of the show property. The event instance is the instance of CustomEvent.
#### data in the detail property
|**Property**| Type | Description |
|:----------------------:|:---------------:|:-------------------------------------------:|
| **current**            | SVG element     | the thumb/handle                            |
| **visible**            | boolean         | the value indicating the visibility of thumb| 

How to use
----------
### Installation
```javascript
npm install flot-thumb-plugin flot-axishandle-plugin
```
### Usage
Import JavaScript files in your page.
```HTML
<!-- import the thumb plugin -->
<script type="text/javascript" src="../node_modules/flot-thumb-plugin/dist/es5/jquery.thumb.js"></script>
<!-- import the axis handle plugin -->
<script type="text/javascript" src="../node_modules/flot-axishandle-plugin/dist/es5/jquery.flot.axishandle.js"></script>
```

Run the plot function and pass axis handle options.
```javascript
var myFlot = $.plot( $("#graph"), ...,
{
    ...
    axisHandles: [
        // the handle is shown at the right of the chart. we can move it vertically.
        { orientation: 'vertical', location: 'far' }
    ]
    ...
});

```
