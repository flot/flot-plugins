/*global $, HistoryBuffer*/
/*jshint browser: true*/

$(function () {
    'use strict';
    var plot;
    var buffer = new HistoryBufferWaveform(10, 1);
    var globalIndex = 0;
    var chartStep = 0.01;
    var arr = [];

    function updateData() {
        var sin,
            AWdata = [];

        for (var i = 0; i < 512; i++) {
            sin = Math.sin(globalIndex * chartStep);
            globalIndex++;

            AWdata.push(sin);
        }

        var aw = new NIAnalogWaveform({t0: globalIndex/256,Y:AWdata, dt:0.001});

        buffer.push(aw);
    }

    plot = $.plot('#placeholder', [[]], {
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
