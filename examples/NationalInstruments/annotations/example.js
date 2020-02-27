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
                location: 'relative',
                content: [
                    {x: 0.5, y: 0.5, label: 'hello world2\nnewline', arrowDirection: 'n', showArrow: true},
                    {x: 0.5, y: 0.5, label: 'hello world2\nnewline', arrowDirection: 's', showArrow: true},
                    {x: 0.5, y: 0.5, label: 'hello world3\nnewline', arrowDirection: 'e', showArrow: true},
                    {x: 0.5, y: 0.5, label: 'hello world4\nnewline', arrowDirection: 'w', showArrow: true},
                    {x: 0.5, y: 0.5, label: 'hello world5\nnewline', arrowDirection: 'ne', showArrow: true},
                    {x: 0.5, y: 0.5, label: 'hello world6\nnewline', arrowDirection: 'nw', showArrow: true},
                    {x: 0.5, y: 0.5, label: 'hello world7\nnewline', arrowDirection: 'sw', showArrow: true},
                    {x: 0.5, y: 0.5, label: 'hello world8\nnewline', arrowDirection: 'se', showArrow: true}
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
        }
    });

    // Add the Flot version string to the footer

    $("#footer").prepend("Flot " + $.plot.version + " &ndash; ");
});
