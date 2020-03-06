/*global jQuery, $*/
/*jshint browser: true*/

$(function () {
    'use strict';
    var d1 = [];
    for (var i = 0; i < 14; i += 0.5) {
        d1.push([i, Math.sin(i)]);
    }

    var d2 = [[0, 3], [4, 8], [8, 5], [9, 13], [11, 3]];

    // A null signifies separate line segments

    var d3 = [[0, 12], [7, 12], null, [7, 2.5], [12, 2.5]];

    $.plot("#placeholder", [ d1, d2, d3 ], {
        series: {
            lines: { show: true },
            points: { show: true },
            annotations: [{
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
                arrowWidth: 5
            }]
        }
    });

    // Add the Flot version string to the footer

    $("#footer").prepend("Flot " + $.plot.version + " &ndash; ");
});
