describe('A digital axis', function() {
    'use strict';

    var placeholder, options;

    beforeEach(function() {
        placeholder = setFixtures('<div id="test-container" style="width: 300px; height: 150px" />');
        options = {
            series: {
                digitalWaveform: {
                    show: true
                }
            },
            yaxis: {
                type: 'digital'
            }
        }
    });

    it('should hide the default yaxis', function() {
        let plot = $.plot(placeholder, [[0, 1, 0]], options);

        let axis = plot.getYAxes()[0];
        expect(axis.show).toBe(false);
    });

    it('should add plot offset depending on the width', function() {
        options.yaxis.width = 0.3;
        let plot = $.plot(placeholder, [[0, 1, 0]], options);

        let offset = plot.getPlotOffset();
        expect(offset.left).toBeGreaterThanOrEqual(placeholder.width() * options.yaxis.width);
    });

    it('should show signals for each visible signal', function() {
        let data = [
            { data: [0, 1, 0], digitalWaveform: { signal: { show: true } } },
            { data: [0, 1, 0], digitalWaveform: { signal: { show: true } } },
            { data: [0, 1, 0], digitalWaveform: { signal: { show: false } } }
        ];
        $.plot(placeholder, data, options);

        let signals = placeholder.find('.flot-digital-axis-signal');
        expect(signals.length).toBe(2);
    });

    it('should show buses for each visible bus', function() {
        options.buses = [{}, {}, {}];
        let data = [
            { data: [0, 1, 0], digitalWaveform: { signal: { bus: 0 } } },
            { data: [0, 1, 0], digitalWaveform: { signal: { bus: 0 } } },
            { data: [0, 1, 0], digitalWaveform: { signal: { bus: 1 } } }
        ];
        $.plot(placeholder, data, options);

        let signals = placeholder.find('.flot-digital-axis-bus');
        expect(signals.length).toBe(2);
    });

    it('should show signals of expanded bus', function() {
        options.buses = [{ collapsed: false }, { collapsed: false }];
        let data = [
            { data: [0, 1, 0], digitalWaveform: { signal: { bus: 0 } } },
            { data: [0, 1, 0], digitalWaveform: { signal: { bus: 0 } } },
            { data: [0, 1, 0], digitalWaveform: { signal: { bus: 1 } } }
        ];
        $.plot(placeholder, data, options);

        let signals = placeholder.find('.flot-digital-axis-signal');
        expect(signals.length).toBe(3);
    });

    it('should not show signals of collapsed bus', function() {
        options.buses = [{ collapsed: true }];
        let data = [
            { data: [0, 1, 0], digitalWaveform: { signal: { bus: 0 } } },
            { data: [0, 1, 0], digitalWaveform: { signal: { bus: 0 } } },
            { data: [0, 1, 0], digitalWaveform: { signal: { bus: 0 } } }
        ];
        $.plot(placeholder, data, options);

        let signals = placeholder.find('.flot-digital-axis-signal');
        expect(signals.length).toBe(0);
    });

    it('should draw custom signal symbols', function() {
        options.yaxis.signalSymbol = '<i>S</i>';
        $.plot(placeholder, [[0, 1, 0]], options);

        let signal = placeholder.find('.flot-digital-axis-signal')[0];
        let symbol = signal.children[0];
        expect(symbol.innerHTML).toBe('<i>S</i>');
    });
});
