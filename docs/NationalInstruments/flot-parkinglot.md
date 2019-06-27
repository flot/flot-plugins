flot-parkinglot-plugin
============

This is a plugin for [flot](http://www.flotcharts.org/) to enable the parking lot. With the parking lot a cursor/axis handel can be dragged fully off the edge of the graph. Once the handle is off the edge of the graph, it will show up in the respective graph parking lot corner.

![](https://raw.githubusercontent.com/ni-kismet/flot-parkinglot-plugin/master/resources/parking-lot.png?token=AI4nNY7LJQoh4WDtyxku0ya2TOferQkJks5ciLPQwA%3D%3D)

Terms
-----
**Parking lot** the area for off graph handles at the four corners of the graph.

**Docker** the container of the handles in the parking lot (at the red arrowhead).

**Docker arrow** indicates the orientation of the docker (at the yellow arrowhead).

![](https://raw.githubusercontent.com/ni-kismet/flot-parkinglot-plugin/master/resources/docker.png?token=AI4nNVySPWKNQNLPsqkTq0iaBbS5RR2Jks5ciLMcwA%3D%3D)

Installation
------------
The parking lot should be used with [flot-cursors-plugin](https://www.npmjs.com/package/flot-cursors-plugin) or [flot-axishandle-plugin](https://www.npmjs.com/package/flot-axishandle-plugin). The parking lot requires flot-cursors-plugin 4.x and flot-axishandle-plugin 2.x.
```node
npm install flot-thumb-plugin flot-cursors-plugin flot-axishandle-plugin flot-parkinglot-plugin
```

Usage
-----
Import JavaScript files in your page.
```HTML
<!-- import the thumb plugin -->
<script type="text/javascript" src="../node_modules/flot-thumb-plugin/dist/es5/jquery.thumb.js"></script>
<!-- import the cursor plugin if needed -->
<script type="text/javascript" src="../node_modules/flot-cursors-plugin/dist/es5/jquery.flot.cursors.js"></script>
<!-- import the axis handle plugin if needed -->
<script type="text/javascript" src="../node_modules/flot-axishandle-plugin/dist/es5/jquery.flot.axishandle.js"></script>
<!-- import the parking lot plugin -->
<script type="text/javascript" src="../node_modules/flot-parkinglot-plugin/dist/es5/jquery.flot.parkinglot.js"></script>
```
Run the plot function and specify the parking lot in the options.
```javascript
var myFlot = $.plot( $("#graph"), ...,
{
    ...
    cursors: [
        {
            mode: 'x',
            position: {
                relativeX: 0.75,
                relativeY: 0.5
            },
            showThumbs: 't'
        }
    ],
    axisHandles: [
        { orientation: 'vertical', location: 'far' }
    ],
    parkingLot: {}
    ...
});
```

Options
-------
The plugin supports these options:
```javascript
    parkingLot: {
        offset: 35,
        show: true
    }
```

**offset** the distance between the graph area and the parking lot. Default value is 35.

**show** if the parking lot is shown or hidden. Default value is true.

CSS classes
-----------
The dockers and docker arrows are the SVG elements. I predefined some CSS classes to allow the users to customize how dockers and arrows display.

**parkingLot-docker** describes how the docker rectangles display.

**parkingLot-dockerArrow** describes how the docker arrows display.
```css
    .parkingLot-dockerArrow {
        fill: gray;
        stroke: white;
    }
    .parkingLot-docker {
        fill: none;
        stroke: black;
        stroke-width: 0.5;
    }
```
