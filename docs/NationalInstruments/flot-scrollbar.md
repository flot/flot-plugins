flot-scrollbar-plugin
============

This is a flot plugin to create a horizontal and/or vertical scrollbar. Drag on the ends of the scrollbar to zoom in or out.

Options
-------

The plugin supports these options:

```javascript
    scrollbars: [{
        direction: 'horizontal' or 'vertical'
        size: number,
        backgroundColor: color,
        color: color
    }]
```

**direction** specifies the direction of the scrollbar. Default value: 'horizontal'.

**size** is the size of the scrollbar in px. Depending on the direction it specifies either the height for a horizontal scrollbar or the width for a vertical scrollbar. Default value: 18.

**backgroundColor** is the background color of the scrollbar container. Default value: 'rgb(240, 240, 240)'.

**color** is the main color of the scrollbar. Other colors used by the scrollbar are derived from this color. Default value: 'rgb(195, 195, 195)'.
