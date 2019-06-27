var plot = $.plot($("#placeholder"), [
    {
        data: [[0, 0], [1, 1], [2, 1], [3, 0]],
        yaxis: 1
    },
    {
        data: [[0,1],[1,2], [2, 3], [3, 4], [4, 5]],
        yaxis: 2
    }
], {
    yaxes: [
        { min: -3, max: 5, offset: {below: 0, above: 0}, autoScale: "none", show: true },
        { min: -3, max: 5, offset: {below: 0, above: 0}, autoScale: "none", show: false },
    ],
    cursors: [
        {
            name: 'c-h-t-1',
            mode: 'x',
            color: 'red',
            showIntersections: false,
            symbol: 'none',
            position: {
                relativeX: 0.75,
                relativeY: 0.5
            },
            showThumbs: 't'
        },
        {
            name: 'c-h-t-2',
            mode: 'x',
            color: 'red',
            showIntersections: false,
            symbol: 'none',
            position: {
                relativeX: 0.8,
                relativeY: 0.5
            },
            showThumbs: 't'
        },
        {
            name: 'c-h-b-1',
            mode: 'x',
            color: 'blue',
            showIntersections: false,
            symbol: 'none',
            position: {
                relativeX: 0.5,
                relativeY: 0.5
            },
            showThumbs: 'b'
        },
        {
            name: 'c-h-b-2',
            mode: 'x',
            color: 'blue',
            showIntersections: false,
            symbol: 'none',
            position: {
                relativeX: 0.35,
                relativeY: 0.5
            },
            showThumbs: 'b'
        },
        {
            name: 'c-v-r',
            mode: 'y',
            color: 'green',
            showIntersections: false,
            symbol: 'none',
            position: {
                relativeX: 0.25,
                relativeY: 0.25
            },
            showThumbs: 'r'
        },
        {
            name: 'c-v-l',
            mode: 'y',
            color: 'purple',
            showIntersections: false,
            symbol: 'none',
            position: {
                relativeX: 0.25,
                relativeY: 0.5
            },
            showThumbs: 'l'
        }
    ],
    axisHandles: [
        {}
    ],
    zoom: {
        interactive: true
    },
    pan: {
        interactive: true,
        enableTouch: true
    },
    parkingLot: {
    }
});
