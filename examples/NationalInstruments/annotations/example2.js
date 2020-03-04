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
            annotations: {
                show: true,
                location: 'absolute',
                content: [
                    {x: 4, y: 8, label: 'hello world1', showArrow: false},
                    {x: 0, y: 12, label: 'hello world2', showArrow: false},
                    {x: 11, y: 3, label: 'hello world3', showArrow: false},
                    {x: 12, y: 6.5, label: 'hello world4', showArrow: false},
                ],
            }
        }
    });

    // Add the Flot version string to the footer

    $("#footer").prepend("Flot " + $.plot.version + " &ndash; ");
});
