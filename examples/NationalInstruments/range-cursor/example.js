/*global jQuery, $*/
/*jshint browser: true*/

$(function () {
    'use strict';
    var plot;
    var offset = 0.0;
    var sin = [],
        cos = [];

    var cursorParams = {
        transparentRange: 'outside',
        showLabel: true,
        showValue: true,
        showBorders: true,
        halign: 'top',
        constrainToEdge: true,
        orientation: 'box'
    };

    function updateData() {
        sin = [];
        cos = [];
        offset += 0.02;
        for (var i = 0; i < 8; i += 0.4) {
            sin.push([i, 1 + Math.sin(i + offset)]);
            cos.push([i, 1 + Math.cos(i + offset)]);
        }
    }

    function updateChart() {
        updateData();

        plot.setData([
            {
                data: sin,
                label: "sin(x)"
            },
            {
                data: cos,
                label: "cos(x)"
            }

        ]);

        plot.setupGrid();
        plot.draw();

        setTimeout(updateChart, 16);
    }

    $('#checkbox_box').click(function() {
        if ($(this).is(':checked')) {
            cursorParams.orientation = 'box';
        } else {
            cursorParams.orientation = 'vertical';
        }

        createPlot();
    });

    $('#checkbox_orientation').click(function() {
        if (cursorParams.orientation !== 'box') {
            if ($(this).is(':checked')) {
                cursorParams.orientation = 'vertical';
            } else {
                cursorParams.orientation = 'horizontal';
            }
        }

        createPlot();
    });

    $('#checkbox_transparentRange').click(function() {
        if ($(this).is(':checked')) {
            cursorParams.transparentRange = 'outside';
        } else {
            cursorParams.transparentRange = 'inside';
        }

        createPlot();
    });

    $('#checkbox_showLabel').click(function() {
        if ($(this).is(':checked')) {
            cursorParams.showLabel = true;
        } else {
            cursorParams.showLabel = false;
        }

        createPlot();
    });

    $('#checkbox_showValue').click(function() {
        if ($(this).is(':checked')) {
            cursorParams.showValue = true;
        } else {
            cursorParams.showValue = false;
        }

        createPlot();
    });

    $('#checkbox_showBorders').click(function() {
        if ($(this).is(':checked')) {
            cursorParams.showBorders = true;
        } else {
            cursorParams.showBorders = false;
        }

        createPlot();
    });

    $('#checkbox_halign').click(function() {
        if ($(this).is(':checked')) {
            cursorParams.halign = cursorParams.orientation === 'vertical' ? 'top' : 'left';
        } else {
            cursorParams.halign = cursorParams.orientation === 'vertical' ? 'bottom' : 'right';
        }

        createPlot();
    });

    $('#checkbox_constrain').click(function() {
        if ($(this).is(':checked')) {
            cursorParams.constrainToEdge = true;
        } else {
            cursorParams.constrainToEdge = false;
        }

        createPlot();
    });

    updateData();
    createPlot();

    function createPlot () {
        plot = $.plot("#placeholder", [
            {
                data: sin,
                label: "sin(x)"
            },
            {
                data: cos,
                label: "cos(x)"
            }

        ], {
            series: {
                lines: {
                    show: true
                },
                points: {
                    show: true
                }
            },
            rangecursors: [
                {
                    name: 'Red cursor',
                    color: 'red',
                    showIntersections: false,
                    transparentRange: cursorParams.transparentRange,
                    showLabel: cursorParams.showLabel,
                    showValue: cursorParams.showValue,
                    showBorders: cursorParams.showBorders,
                    halign: cursorParams.halign,
                    position: {
                        relativeYStart: 0.5,
                        relativeYEnd: 0.7,
                        relativeXStart: 0.5,
                        relativeXEnd: 0.7
                    },
                    constrainToEdge: cursorParams.constrainToEdge,
                    orientation: cursorParams.orientation
                }
            ],
            grid: {
                hoverable: true,
                clickable: true,
                autoHighlight: false
            },
            yaxis: {
                min: 0,
                max: 2,
                autoscale: 'none',
                showTickLabels: 'all'
            },
            zoom: {
                interactive: true
            },
            pan: {
                interactive: true,
                enableTouch: true
            }
        });
    }

    updateChart ();
});
