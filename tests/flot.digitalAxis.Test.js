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

    it('should calculate plot offset depending on labels', function() {
        options.buses = [{ label: 'Bus' }];
        let plot = $.plot(placeholder, [{ data: [0, 1, 0], label: 'Signal' }], options);

        let offset = plot.getPlotOffset();
        expect(offset.left).toBeGreaterThan(0);
        expect(offset.left).toBeLessThanOrEqual(placeholder.width() * 0.5);
    });

    it('should add plot offset depending on the width', function() {
        options.yaxis.width = 100;
        let plot = $.plot(placeholder, [[0, 1, 0]], options);

        let offset = plot.getPlotOffset();
        expect(offset.left).toBeGreaterThanOrEqual(100);
    });

    it('should set width of html element', function() {
        options.yaxis.width = 100;
        $.plot(placeholder, [[0, 1, 0]], options);

        let element = placeholder.find('#flot-digital-axis');
        expect(element.width()).toBe(100);
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

    it('should draw custom collapsed bus symbols', function() {
        options.buses = [{ collapsed: true }];
        options.yaxis.busSymbolCollapsed = '<i>C</i>';
        $.plot(placeholder, [[0, 1, 0]], options);

        let bus = placeholder.find('.flot-digital-axis-bus')[0];
        let symbol = bus.children[0];
        expect(symbol.innerHTML).toBe('<i>C</i>');
    });

    it('should draw custom expanded bus symbols', function() {
        options.buses = [{ collapsed: false }];
        options.yaxis.busSymbolExpanded = '<i>E</i>';
        $.plot(placeholder, [[0, 1, 0]], options);

        let bus = placeholder.find('.flot-digital-axis-bus')[0];
        let symbol = bus.children[0];
        expect(symbol.innerHTML).toBe('<i>E</i>');
    });
});
