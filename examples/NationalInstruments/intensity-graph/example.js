$(function () {
    'use strict';
    var plot;
    var offset = 0.0;
    var h = 51;
    var w = 101;
    var max = Math.sqrt(h * h + w * w);
    var iMap = [];
    var count = 0;

    function rainbow(i, j, count) {
        var res = count + Math.sqrt(i * i + j * j);

        if (res > max) { res -= max; }

        return res;
    }

    function updateData() {
        iMap = [];
        for (var i = 0; i < w; i++) {
            var raw = [];
            for (var j = 0; j < h; j++) {
                raw.push(rainbow(i, j, count));
            }
            iMap.push(raw);
        }
        count++;
        if (count > max) { count = 0; }
    }

    function updateGraph() {
        if ($('#checkbox').prop('checked')) {
            updateData();

            plot.setData([{
                data: iMap
            }]);

            plot.setupGrid();
            plot.draw();
        }
        requestAnimationFrame(updateGraph);
    }

    updateData();
    plot = $.plot("#placeholder", [{
        data: iMap
    }], {
        series: {
            intensitygraph: {
                active: true,
                show: true,
                max: max,
                gradient: [
                    { value: 0, color: 'red' },
                    { value: 0.12, color: 'orange' },
                    { value: 0.25, color: 'yellow' },
                    { value: 0.37, color: 'lightgreen' },
                    { value: 0.5, color: 'cyan' },
                    { value: 0.62, color: 'lightblue' },
                    { value: 0.75, color: 'indigo' },
                    { value: 0.9, color: 'violet' },
                    { value: 1, color: 'red' }
                ]
            }
        },
        xaxis: {
            show: true
        },
        yaxis: {
            show: true,
            autoScale: 'exact'
        },
        grid: {
            aboveData: true
        }
    });

    updateGraph();
});
