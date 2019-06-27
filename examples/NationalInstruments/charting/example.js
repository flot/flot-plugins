/*global $, HistoryBuffer*/
/*jshint browser: true*/

$(function () {
    'use strict';
    var plot;
    var buffer = new HistoryBuffer(100 * 1024, 4);
    var globalIndex = 0;
    var chartStep = 0.0001;
    var arr = [];

    function updateData() {
        var sin, cos, sin1, tan;

        for (var i = 0; i < 2048; i++) {
            sin = Math.sin(globalIndex * chartStep);
            sin1 = 1 - sin;
            cos = Math.cos(globalIndex * chartStep);
            tan = Math.tan(globalIndex * chartStep) / 10.0;
            tan = Math.min(tan, 3);
            tan = Math.max(tan, -3);
            globalIndex++;
            arr[0] = sin, arr[1] = cos, arr[2] = sin1, arr[3] = tan;

            buffer.push(arr);
        }
    }

    plot = $.plot('#placeholder', [[], [], [], []], {
        series: {
            historyBuffer: buffer,
            lines: {
                show: true,
                //lineWidth: 1
            },
            shadowSize: 0
        },
        legend: {
            show: false
        },
        xaxis: {
            show: true
        },
        yaxis: {
            show: true
        }
    });

    setInterval(updateData, 1);
});
