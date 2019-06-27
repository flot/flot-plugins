# Flot scatter graph
## Introduction
This graph enables displaying up to 5 dimensions of data. The dimensions are represented as

* x
* y
* color
* shape
* size

The plugin provides a way to look up that actual display value for any given data value using either a lookup table or a function.
Default colors, shapes and sizes are provided for the values 0-9. Shapes drawn at x and y can be filled and have a line width.
Points can be connected with lines.

##Data types
Data can be provided in one of 2 forms
1. An array of objects. Each object will contain the following

* **x**: the x coordinate
* **y**: the y coordinate
* **color**: the value for color – optional, if not present a fallback value supplied on the plot will be used. If the fallback is missing a default value will be used
* **shape**: the value for shape – optional, if not present a fallback value supplied on the plot will be used. If the fallback is missing a default value will be used
* **size**: the value for size – if not present a fallback value supplied on the plot will be used. If the fallback is missing a default value will be used

2. A 2-dimensional array of up to 5 columns

* **Column1**: x
* **Column2**: y
* **Column3**: the value for color
* **Column4**: the value for shape
* **Column5**: the value for size


## Options
The plugin supports these options:

**drawLines**  
default: false  
If true will connect each point with a line using lineWidth for the thickness

**lineWidth**  
default: 2  
The width to use when drawing lines and shapes

**filled**  
default: false  
If true the shapes are filled

**colors**  
default: undefined  
Set to an array of objects containing value and color to provide a lookup table. Each color in the data will be looked up in the the lookup table to find the actual color to use.  
example:  
```javascript
[
    {value: 1, color: 'red'},
    {value: 2, color: 'green'},
    {value: 3, color: 'blue'}
]
```
-- OR --  
Set to a function that takes a value as its input and returns a color.  
example:  
```javascript
function lookupColor(value) {
    switch (value) {
        case 1:
            return 'red';
        case 2:
            return 'green';
        case '3':
            return 'blue';
    }

    // return undefined - use the fallback color
}
```
If the value in the data is 1 then the point will be drawn in the color red.

**color**  
default: 'black'  
The fallback color to use if the lookup does not return a color. If the value is between 0 and 9 an internal lookup table will be used but if the value is outside this range the fallback color will be used.

**shapes**  
default: undefined  
Set to an array of objects containing value and shape to provide a lookup table. Each shape in the data will be looked up in the the lookup table to find the actual shape to use.
Possible shape values are ('circle', 'square', 'triangle_n', 'triangle_s', 'triangle_e', 'triangle_w', 'cross_v', 'cross_d', 'diamond', 'asterisk')  
example:  
```javascript
[
    {value: 1, shape: 'circle'},
    {value: 2, shape: 'square'},
    {value: 3, shape: 'diamond'}
]
```
-- OR --  
Set to a function that takes a value as its input and returns a shape.  
example:  
```javascript
function lookupShape(value) {
    switch (value) {
        case 1:
            return 'circle';
        case 2:
            return 'square';
        case '3':
            return 'diamond';
    }

    // return undefined - use the fallback shape
}
```
If the value in the data is 1 then the point will be drawn in the shape of a circle.

**shape**  
default: 'circle'  
The fallback shape to use if the lookup does not return a shape. If the value is between 0 and 9 an internal lookup table will be used but if the value is outside this range the fallback shape will be used.

**sizes**  
default: undefined  
Set to an array of objects containing value and size to provide a lookup table. Each size in the data will be looked up in the the lookup table to find the actual size in pixels to use.  
example:  
```javascript
[
    {value: 1, size: 10},
    {value: 2, size: 20},
    {value: 3, size: 30}
]
```
If the value in the data is 1 then the point will be drawn with a size of 10 pixels.  
-- OR --  
Set to a function that takes a value as its input and returns a size.  
example:  
```javascript
function lookupSize(value) {
    switch (value) {
        case 1:
            return 10;
        case 2:
            return 20;
        case '3':
            return 30;
    }

    // return undefined - use the fallback color
}
```

**size**  
default: 5  
The fallback size to use if the lookup does not return a size. If the value is between 0 and 9 an internal lookup table will be used but if the value is outside this range the fallback size will be used.
