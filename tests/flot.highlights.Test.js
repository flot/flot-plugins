describe('Flot highlights', function () {
    'use strict';
    var d1 = [];
    for (var i = 0; i < 14; i += 0.5) {
        d1.push([i, Math.sin(i)]);
    }

    var d2 = [[0, 3], [4, 8], [8, 5], [9, 13], [11, 3]];

    // A null signifies separate line segments

    var d3 = [[0, 12], [7, 12], null, [7, 2.5], [12, 2.5]];
    var plot;
    var placeholder;
    var selectedIndexes = [[], [], []];
    var selectedRange = [[], [], []];

    beforeEach(function () {
        var fixture = setFixtures('<div id="demo-container" style="width: 800px;height: 600px">').find('#demo-container').get(0);

        placeholder = $('<div id="placeholder" style="width: 100%;height: 100%">');
        placeholder.appendTo(fixture);
        jasmine.clock().install();
    });

    afterEach(function () {
        if (plot) {
            plot.shutdown();
        }
        $('#placeholder').empty();
        jasmine.clock().uninstall();
    });

    it('should highlight points', function () {
        selectedIndexes = [[0], [], []];
        plot = $.plot("#placeholder", [ d1, d2, d3 ], {
            series: {
                lines: { show: true },
                points: { show: true, symbol: 'square' },
                highlights: {
                    show: true,
                    highlightColor: '#00FF00',
                    highlightLines: false,
                    highlightPoints: true,
                    highlightBars: false,
                    highlightLineWidth: 5,
                    selectedIndexes: selectedIndexes
                }
            }
        });
        var spy = spyOn(plot.drawSymbol, 'square').and.callThrough();
        plot.triggerRedrawOverlay();
        jasmine.clock().tick(20);
        expect(spy).toHaveBeenCalled();
    });
    it('should highlight a range of points', function () {
        selectedRange = [[0, 5], [], []];
        plot = $.plot("#placeholder", [ d1, d2, d3 ], {
            series: {
                lines: { show: true },
                points: { show: true, symbol: 'square' },
                highlights: {
                    show: true,
                    highlightColor: '#00FF00',
                    highlightLines: false,
                    highlightPoints: true,
                    highlightBars: false,
                    highlightLineWidth: 5,
                    selectedRange: selectedRange
                }
            }
        });
        var spy = spyOn(plot.drawSymbol, 'square').and.callThrough();
        plot.triggerRedrawOverlay();
        jasmine.clock().tick(20);
        expect(spy).toHaveBeenCalled();
    });
    it('should not highlight points when show is false', function () {
        selectedIndexes = [[0], [], []];
        plot = $.plot("#placeholder", [ d1, d2, d3 ], {
            series: {
                lines: { show: true },
                points: { show: true, symbol: 'square' },
                highlights: {
                    show: false,
                    highlightColor: '#00FF00',
                    highlightLines: false,
                    highlightPoints: true,
                    highlightBars: false,
                    highlightLineWidth: 5,
                    selectedIndexes: selectedIndexes
                }
            }
        });
        var spy = spyOn(plot.drawSymbol, 'square').and.callThrough();
        plot.triggerRedrawOverlay();
        jasmine.clock().tick(20);
        expect(spy).not.toHaveBeenCalled();
    });
    it('should highlight lines', function () {
        selectedIndexes = [[0], [], []];
        plot = $.plot("#placeholder", [ d1, d2, d3 ], {
            series: {
                lines: { show: true },
                points: { show: true },
                highlights: {
                    show: true,
                    highlightColor: '#00FF00',
                    highlightLines: true,
                    highlightPoints: false,
                    highlightBars: false,
                    highlightLineWidth: 5,
                    selectedIndexes: selectedIndexes
                }
            }
        });
        var spy = spyOn($.plot.drawSeries, 'drawSeriesLines').and.callThrough();
        plot.triggerRedrawOverlay();
        jasmine.clock().tick(20);
        expect(spy).toHaveBeenCalled();
    });
    it('should highlight a range on lines', function () {
        selectedRange = [[0, 5], [], []];
        plot = $.plot("#placeholder", [ d1, d2, d3 ], {
            series: {
                lines: { show: true },
                points: { show: true },
                highlights: {
                    show: true,
                    highlightColor: '#00FF00',
                    highlightLines: true,
                    highlightPoints: false,
                    highlightBars: false,
                    highlightLineWidth: 5,
                    selectedRange: selectedRange
                }
            }
        });
        var spy = spyOn($.plot.drawSeries, 'drawSeriesLines').and.callThrough();
        plot.triggerRedrawOverlay();
        jasmine.clock().tick(20);
        expect(spy).toHaveBeenCalled();
    });
    it('should highlight bars', function () {
        selectedIndexes = [[0], [], []];
        plot = $.plot("#placeholder", [ d1, d2, d3 ], {
            series: {
                bars: { show: true },
                lines: { show: false },
                points: { show: false },
                highlights: {
                    show: true,
                    highlightColor: '#00FF00',
                    highlightLines: false,
                    highlightPoints: false,
                    highlightBars: true,
                    highlightLineWidth: 5,
                    selectedIndexes: selectedIndexes
                }
            }
        });
        var spy = spyOn($.plot.drawSeries, 'drawBar').and.callThrough();
        plot.triggerRedrawOverlay();
        jasmine.clock().tick(20);
        expect(spy).toHaveBeenCalled();
    });
});
