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
            highlights: {
                show: true,
                highlightColor: '#00FF00',
                highlightLines: true,
                highlightPoints: true,
                highlightBars: false,
                lineWidth: 5,
                selectedRange:[[0, 5], [0, 2], [0, 3]]
            }
        }
    });

    // Add the Flot version string to the footer

    $("#footer").prepend("Flot " + $.plot.version + " &ndash; ");
});
