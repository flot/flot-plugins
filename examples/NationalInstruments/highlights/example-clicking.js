/*global jQuery, $*/
/*jshint browser: true*/

$(function () {
    'use strict';
    var d1 = [];
    var selectedIndexes = [[], [], []];
    var selectLines = false;
    for (var i = 0; i < 14; i += 0.5) {
        d1.push([i, Math.sin(i)]);
    }

    function clearSelection () {
        selectedIndexes[0] = [];
        selectedIndexes[1] = [];
        selectedIndexes[2] = [];
    }

    var d2 = [[0, 3], [4, 8], [8, 5], [9, 13], [11, 3]];

    // A null signifies separate line segments

    var d3 = [[0, 12], [7, 12], null, [7, 2.5], [12, 2.5]];

    function update () {
        $.plot("#placeholder", [ d1, d2, d3 ], {
            crosshair: {
                mode: "xy"
            },
            grid: {
                hoverable: true,
                clickable: true,
                autoHighlight: false
            },
            series: {
                lines: { show: true },
                points: { show: true },
                highlights: {
                    show: true,
                    highlightColor: '#00FF00',
                    highlightLines: selectLines,
                    highlightPoints: !selectLines,
                    highlightBars: false,
                    lineWidth: 5,
                    selectedIndexes:selectedIndexes
                }
            }
        });
    };
    $("#placeholder").bind("plotclick", function (event, pos, item) {
        if (item) {
            if (!selectLines) {
                selectedIndexes[item.seriesIndex].push(item.dataIndex);
            } else {
                clearSelection();
                selectedIndexes[item.seriesIndex].push(item.dataIndex);
            }
            update();
        } else {
            clearSelection();
            update();
        }
    });

    $('#checkBox').bind('click', function () {
        selectLines = !selectLines;
        clearSelection();
        update();
    });
    // Add the Flot version string to the footer

    $("#footer").prepend("Flot " + $.plot.version + " &ndash; ");

    update();
});
