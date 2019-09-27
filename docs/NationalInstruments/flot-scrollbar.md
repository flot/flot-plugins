flot-scrollbar-plugin
============

This is a flot plugin to a create horizontal scrollbar. Drag on the left or right side of the scrollbar to zoom in or out.

Options
-------

The plugin supports these options:

```javascript
    scrollbar: {
        show: true or false,
        height: number,
        backgroundColor: color,
        color: color
    }
```

**show** enables the scrollbar. If false the scrollbar won't be visible and the plugin is disabled. Default value: false.

**height** is the height of the scrollbar in px. Default value: 18.

**backgroundColor** is the background color of the scrollbar container. Default value: 'rgb(240, 240, 240)'.

**color** is the main color of the scrollbar. Other colors used by the scrollbar are derived from this color. Default value: 'rgb(195, 195, 195)'.
