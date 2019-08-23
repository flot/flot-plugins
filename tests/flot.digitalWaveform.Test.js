describe('A digital waveform', function() {
    'use strict';

    let customMatchers = {
        toBeDigitalSample: function(util, customEqualityTesters) {
            return {
                compare: function(actual, expected) {
                    let result = {};

                    result.pass = typeof actual === 'object';
                    if (!result.pass) {
                        result.message = `Expected ${actual} to be an object`;
                    } else if (expected) {
                        if (typeof expected.x === 'number') {
                            result.pass = util.equals(actual.x, expected.x, customEqualityTesters);
                        }

                        if (result.pass && typeof expected.state === 'number') {
                            result.pass = util.equals(actual.state, expected.state, customEqualityTesters);
                        }

                        if (result.pass && typeof expected.strength === 'number') {
                            result.pass = util.equals(actual.strength, expected.strength, customEqualityTesters);
                        }
                    }

                    return result;
                }
            }
        }
    };

    var placeholder, options;

    beforeEach(function() {
        jasmine.addMatchers(customMatchers);

        placeholder = setFixtures('<div id="test-container" style="width: 300px; height: 150px" />');
        options = {
            grid: { show: false },
            series: {
                digitalWaveform: {
                    show: true
                }
            }
        }
    });

    it('should draw nothing when the data is empty', function() {
        let plot = $.plot(placeholder, [], options);
        let ctx = plot.getCanvas().getContext('2d');

        spyOn(ctx, 'moveTo').and.callThrough();
        spyOn(ctx, 'lineTo').and.callThrough();

        plot.draw();

        expect(ctx.moveTo).not.toHaveBeenCalled();
        expect(ctx.lineTo).not.toHaveBeenCalled();
    });

    it('should not crash when drawing bus with empty signal', function () {
        options.buses = [{}];
        $.plot(placeholder, [[]], options);
    });

    it('should add x values for flat data', function() {
        let data = [
            { data: [0, 1, 1], flatdata: true },
            { data: [[0, 1], [1, 1], [1, 2]], flatdata: true, start: 3, step: 2 }
        ];
        let plot = $.plot(placeholder, data, options);

        data = plot.getData();
        expect(data[0].datapoints.points).toEqual([0, 0, 0, 1, 1, 0, 2, 1, 0]);
        expect(data[1].datapoints.points).toEqual([3, 0, 1, 5, 1, 1, 7, 1, 2]);
    });

    it('should add strength 0 if no strength is provided', function() {
        let data = [
            { data: [0, 1, 1], flatdata: true },
            [[5, 0], [10, 1], [13, 0]],
            [[5, 0, 1], [10, 1, 0], [13, 0, 2]]
        ];
        let plot = $.plot(placeholder, data, options);

        data = plot.getData();
        expect(data[0].datapoints.points).toEqual([0, 0, 0, 1, 1, 0, 2, 1, 0]);
        expect(data[1].datapoints.points).toEqual([5, 0, 0, 10, 1, 0, 13, 0, 0]);
        expect(data[2].datapoints.points).toEqual([5, 0, 1, 10, 1, 0, 13, 0, 2]);
    });

    it('should set data min/max of y-axis to number of signals and busses', function() {
        options.buses = [{}, { collapsed: true }, {}];
        let data = [
            { data: [0, 0, 0, 0, 0, 1, 1], flatdata: true, digitalWaveform: { signal: { bus: 0 } } },
            { data: [0, 1, 1, 1, 1, 0, 1], flatdata: true, digitalWaveform: { signal: { bus: 0 } } },
            { data: [0, 1, 1, 1, 1, 0, 1], flatdata: true, digitalWaveform: { signal: { bus: 0 } } },
            { data: [0, 1, 1, 1, 0, 1, 0], flatdata: true, digitalWaveform: { signal: { bus: 1 } } },
            { data: [1, 1, 1, 1, 1, 0, 0], flatdata: true, digitalWaveform: { signal: { bus: 1 } } },
            { data: [0, 0, 0, 0, 1, 1, 0], flatdata: true, digitalWaveform: { signal: { bus: 2 } } }
        ];
        let plot = $.plot(placeholder, data, options);

        let axes = plot.getAxes();
        expect(axes.yaxis.datamin).toBeCloseTo(0.1);
        expect(axes.yaxis.datamax).toBeCloseTo(6.9);
    });

    it('should increment data max of x-axis by last step size of signal', function() {
        options.buses = [{}, { collapsed: true }, {}];
        let data = [
            [[5, 0, 1], [10, 1, 0], [13, 0, 2]]
        ];
        let plot = $.plot(placeholder, data, options);

        let axes = plot.getAxes();
        expect(axes.xaxis.datamin).toBe(5);
        expect(axes.xaxis.datamax).toBe(16);
    });

    it('should not draw disabled signals', function() {
        let data = [
            { data: [0, 0, 0, 0, 0, 1, 1], flatdata: true, digitalWaveform: { signal: { show: true } } },
            { data: [0, 1, 1, 1, 1, 0, 1], flatdata: true, digitalWaveform: { signal: { show: false } } }
        ];
        let plot = $.plot(placeholder, data, options);
        let dwg = plot.getDigitalWaveform();

        spyOn(dwg, '_drawSignal').and.callThrough();

        plot.draw();

        let signals = plot.getData().map(series => series.digitalWaveform.signal);
        expect(signals[0].visible).toBe(true);
        expect(signals[1].visible).toBe(false);
        expect(dwg._drawSignal).toHaveBeenCalledTimes(1);
    });

    it('should draw logic state 0 as step down', function() {
        let data = [[[0, 1], [1, 0]]];
        let plot = $.plot(placeholder, data, options);
        let ctx = setupCanvasToSpyOn(plot);
        let renderer = plot.getDigitalWaveform().renderer;

        spyOn(renderer, 'drawStep').and.callThrough();

        plot.draw();

        let signal = plot.getData()[0].digitalWaveform.signal;
        expect(renderer.drawStep.calls.allArgs()).toEqual([
            [ctx, 0, 1, signal.top, null, '#4da74d'],
            [ctx, 1, 2, signal.bottom, signal.top, '#4da74d']
        ]);
    });

    it('should draw logic state 1 as step up', function() {
        let data = [[[0, 0], [1, 1]]];
        let plot = $.plot(placeholder, data, options);
        let ctx = setupCanvasToSpyOn(plot);
        let renderer = plot.getDigitalWaveform().renderer;

        spyOn(renderer, 'drawStep').and.callThrough();

        plot.draw();

        let signal = plot.getData()[0].digitalWaveform.signal;
        expect(renderer.drawStep.calls.allArgs()).toEqual([
            [ctx, 0, 1, signal.bottom, null, '#4da74d'],
            [ctx, 1, 2, signal.top, signal.bottom, '#4da74d']
        ]);
    });

    it('should draw logic state unknown as filled bar', function() {
        let data = [
            [[0, 255], [1, 0]],
            [[0, 255], [1, 255]],
            [[0, 0], [1, 255]]
        ];
        let plot = $.plot(placeholder, data, options);
        let ctx = setupCanvasToSpyOn(plot);
        let renderer = plot.getDigitalWaveform().renderer;

        spyOn(renderer, 'drawRect').and.callThrough();

        plot.draw();

        let signals = plot.getData().map(series => series.digitalWaveform.signal);
        expect(renderer.drawRect.calls.allArgs()).toEqual([
            [ctx, 0, 1, signals[0].top, signals[0].bottom, '#cb4b4b', true, true, true],
            [ctx, 0, 1, signals[1].top, signals[1].bottom, '#cb4b4b', true, true, false],
            [ctx, 1, 2, signals[1].top, signals[1].bottom, '#cb4b4b', true, false, true],
            [ctx, 1, 2, signals[2].top, signals[2].bottom, '#cb4b4b', true, true, true]
        ]);
    });

    it('should draw logic state high impedance as centered step', function() {
        let data = [
            [[0, 254], [1, 0]],
            [[0, 0], [1, 254]],
            [[0, 1], [1, 254]]
        ];
        let plot = $.plot(placeholder, data, options);
        let ctx = setupCanvasToSpyOn(plot);
        let renderer = plot.getDigitalWaveform().renderer;

        spyOn(renderer, 'drawStep').and.callThrough();

        plot.draw();

        let signals = plot.getData().map(series => series.digitalWaveform.signal);
        expect(renderer.drawStep.calls.allArgs()).toEqual([
            [ctx, 0, 1, 0.5, null, '#cb4b4b'],
            [ctx, 1, 2, signals[0].bottom, 0.5, '#4da74d'],
            [ctx, 0, 1, signals[1].bottom, null, '#4da74d'],
            [ctx, 1, 2, 1.5, signals[1].bottom, '#cb4b4b'],
            [ctx, 0, 1, signals[2].top, null, '#4da74d'],
            [ctx, 1, 2, 2.5, signals[2].top, '#cb4b4b']
        ]);
    });

    it('should draw logic states 0 and 1 in color according to strength value', function() {
        [
            { data: [[0, 0, 0], [1, 2]], color: '#4da74d' },
            { data: [[0, 0, 1], [1, 2]], color: '#3b7fed' },
            { data: [[0, 0, 2], [1, 2]], color: '#cb4b4b' },
            { data: [[0, 1, 0], [1, 2]], color: '#4da74d' },
            { data: [[0, 1, 1], [1, 2]], color: '#3b7fed' },
            { data: [[0, 1, 2], [1, 2]], color: '#cb4b4b' }
        ].forEach(test => {
            let plot = $.plot(placeholder, [test.data], options);
            let ctx = setupCanvasToSpyOn(plot);
            let renderer = plot.getDigitalWaveform().renderer;

            spyOn(renderer, 'drawStep').and.callThrough();

            plot.draw();

            expect(renderer.drawStep).toHaveBeenCalledWith(ctx, 0, 1, jasmine.any(Number), null, test.color);
        });
    });

    it('should define default lookup functions for buses', function() {
        options.buses = [{}];
        let plot = $.plot(placeholder, [], options);

        let buses = plot.getOptions().buses;
        expect(buses[0].value).toBeDefined();
        expect(buses[0].shape).toBeDefined();
        expect(buses[0].color).toBeDefined();
    });

    it('should calculate correct bus samples for signals with different timescales', function() {
        options.buses = [{}];
        let data = [
            [[0, 0, 0], [10, 1, 1], [20, 0, 2]],
            [[5.5, 1, 2], [13.6, 0, 1], [22.3, 1, 0]]
        ];
        let plot = $.plot(placeholder, data, options);

        let bus = plot.getOptions().buses[0];
        expect(bus.samples).toEqual([
            { x: 5.5, samples: jasmine.any(Object) },
            { x: 10.0, samples: jasmine.any(Object) },
            { x: 13.6, samples: jasmine.any(Object) },
            { x: 20.0, samples: jasmine.any(Object) },
            { x: 22.3, samples: jasmine.any(Object) }
        ]);
        expect(bus.samples[0].samples[0]).toBeDigitalSample({ x: 5.5, state: 1, strength: 2 });
        expect(bus.samples[0].samples[1]).toBeDigitalSample({ x: 0, state: 0, strength: 0 });
        expect(bus.samples[1].samples[0]).toBeDigitalSample({ x: 5.5, state: 1, strength: 2 });
        expect(bus.samples[1].samples[1]).toBeDigitalSample({ x: 10, state: 1, strength: 1 });
        expect(bus.samples[2].samples[0]).toBeDigitalSample({ x: 13.6, state: 0, strength: 1 });
        expect(bus.samples[2].samples[1]).toBeDigitalSample({ x: 10, state: 1, strength: 1 });
        expect(bus.samples[3].samples[0]).toBeDigitalSample({ x: 13.6, state: 0, strength: 1 });
        expect(bus.samples[3].samples[1]).toBeDigitalSample({ x: 20, state: 0, strength: 2 });
        expect(bus.samples[4].samples[0]).toBeDigitalSample({ x: 22.3, state: 1, strength: 0 });
        expect(bus.samples[4].samples[1]).toBeDigitalSample({ x: 20, state: 0, strength: 2 });
    })

    it('should lookup correct bus values', function() {
        options.buses = [{}];
        let data = [
            [[0, 0, 0], [1, 1, 1], [2, 0, 2]],
            [[0.5, 1, 2], [1.5, 0, 1], [2.5, 1, 0]]
        ];
        let plot = $.plot(placeholder, data, options);

        let bus = plot.getOptions().buses[0];
        expect(bus.values).toEqual(['10', '11', '01', '00', '10']);
    });

    it('should order bus signals depending on bit numbering', function() {
        [
            { bitNumbering: 'lsb', expected: ['001', '011', '111'] },
            { bitNumbering: 'msb', expected: ['100', '110', '111'] }
        ].forEach(test => {
            options.buses = [{
                bitNumbering: test.bitNumbering
            }];
            let data = [
                { data: [1, 1, 1], flatdata: true },
                { data: [0, 1, 1], flatdata: true },
                { data: [0, 0, 1], flatdata: true }
            ];
            let plot = $.plot(placeholder, data, options);

            let bus = plot.getOptions().buses[0];
            expect(bus.values).toEqual(test.expected);
        });
    });

    it('should not draw any buses by default', function() {
        let data = [[[0, 1], [1, 0]]];
        let plot = $.plot(placeholder, data, options);
        let dwg = plot.getDigitalWaveform();

        spyOn(dwg, '_drawBus').and.callThrough();

        plot.draw();

        expect(dwg._drawBus).not.toHaveBeenCalled();
    });

    it('should draw bus on top of contained signals', function() {
        options.buses = [{}, {}, {}];
        let data = [
            { data: [0, 0, 0, 0, 0, 1, 1], flatdata: true, digitalWaveform: { signal: { bus: 0 } } },
            { data: [0, 1, 1, 1, 1, 0, 1], flatdata: true, digitalWaveform: { signal: { bus: 0 } } },
            { data: [1, 1, 1, 1, 0, 1, 0], flatdata: true, digitalWaveform: { signal: { bus: 0 } } },
            { data: [0, 1, 1, 1, 0, 1, 0], flatdata: true, digitalWaveform: { signal: { bus: 1 } } },
            { data: [1, 1, 1, 1, 1, 0, 0], flatdata: true, digitalWaveform: { signal: { bus: 1 } } },
            { data: [0, 0, 0, 0, 1, 1, 0], flatdata: true, digitalWaveform: { signal: { bus: 2 } } }
        ];
        let plot = $.plot(placeholder, data, options);
        let signals = plot.getData().map(series => series.digitalWaveform.signal);
        let buses = plot.getOptions().buses;

        expect(signals[0].bottom).toBeCloseTo(0.1);
        expect(signals[0].top).toBeCloseTo(0.9);
        expect(signals[1].bottom).toBeCloseTo(1.1);
        expect(signals[1].top).toBeCloseTo(1.9);
        expect(signals[2].bottom).toBeCloseTo(2.1);
        expect(signals[2].top).toBeCloseTo(2.9);
        expect(signals[3].bottom).toBeCloseTo(4.1);
        expect(signals[3].top).toBeCloseTo(4.9);
        expect(signals[4].bottom).toBeCloseTo(5.1);
        expect(signals[4].top).toBeCloseTo(5.9);
        expect(signals[5].bottom).toBeCloseTo(7.1);
        expect(signals[5].top).toBeCloseTo(7.9);
        expect(buses[0].bottom).toBeCloseTo(3.1);
        expect(buses[0].top).toBeCloseTo(3.9);
        expect(buses[1].bottom).toBeCloseTo(6.1);
        expect(buses[1].top).toBeCloseTo(6.9);
        expect(buses[2].bottom).toBeCloseTo(8.1);
        expect(buses[2].top).toBeCloseTo(8.9);
    });

    it('should hide signals of collapsed buses', function() {
        options.buses = [{ collapsed: true }, {}, { collapsed: true }];
        let data = [
            { data: [0, 0, 0, 0, 0, 1, 1], flatdata: true, digitalWaveform: { signal: { bus: 0 } } },
            { data: [0, 1, 1, 1, 1, 0, 1], flatdata: true, digitalWaveform: { signal: { bus: 0 } } },
            { data: [1, 1, 1, 1, 0, 1, 0], flatdata: true, digitalWaveform: { signal: { bus: 0 } } },
            { data: [0, 1, 1, 1, 0, 1, 0], flatdata: true, digitalWaveform: { signal: { bus: 1 } } },
            { data: [1, 1, 1, 1, 1, 0, 0], flatdata: true, digitalWaveform: { signal: { bus: 1 } } },
            { data: [0, 0, 0, 0, 1, 1, 0], flatdata: true, digitalWaveform: { signal: { bus: 2 } } }
        ];
        let plot = $.plot(placeholder, data, options);

        let signals = plot.getData().map(series => series.digitalWaveform.signal);
        expect(signals[0].visible).toBe(false);
        expect(signals[0].bottom).toBeUndefined();
        expect(signals[0].top).toBeUndefined();
        expect(signals[1].visible).toBe(false);
        expect(signals[1].bottom).toBeUndefined();
        expect(signals[1].top).toBeUndefined();
        expect(signals[2].visible).toBe(false);
        expect(signals[2].bottom).toBeUndefined();
        expect(signals[2].top).toBeUndefined();
        expect(signals[3].visible).toBe(true);
        expect(signals[3].bottom).toBeCloseTo(1.1);
        expect(signals[3].top).toBeCloseTo(1.9);
        expect(signals[4].visible).toBe(true);
        expect(signals[4].bottom).toBeCloseTo(2.1);
        expect(signals[4].top).toBeCloseTo(2.9);
        expect(signals[5].visible).toBe(false);
        expect(signals[5].bottom).toBeUndefined();
        expect(signals[5].top).toBeUndefined();

        let buses = plot.getOptions().buses;
        expect(buses[0].bottom).toBeCloseTo(0.1);
        expect(buses[0].top).toBeCloseTo(0.9);
        expect(buses[1].bottom).toBeCloseTo(3.1);
        expect(buses[1].top).toBeCloseTo(3.9);
        expect(buses[2].bottom).toBeCloseTo(4.1);
        expect(buses[2].top).toBeCloseTo(4.9);
    });

    it('should hide disabled signals after expanding a bus', function() {
        options.buses = [{ collapsed: true }];
        let data = [
            { data: [0, 0, 0, 0, 0, 1, 1], flatdata: true, digitalWaveform: { signal: { show: true, bus: 0 } } },
            { data: [0, 1, 1, 1, 1, 0, 1], flatdata: true, digitalWaveform: { signal: { show: false, bus: 0 } } }
        ];
        let plot = $.plot(placeholder, data, options);
        let signals = plot.getData().map(series => series.digitalWaveform.signal);

        expect(signals[0].visible).toBe(false);
        expect(signals[1].visible).toBe(false);

        plot.expandBus(plot.getOptions().buses[0]);

        expect(signals[0].visible).toBe(true);
        expect(signals[1].visible).toBe(false);
    });

    it('should draw bus with only driving strength in green', function() {
        options.buses = [{}];
        let data = [
            [[0, 0, 0], [1, 0, 0]],
            [[0, 0, 0], [1, 0, 0]],
            [[0, 1, 0], [1, 1, 0]]
        ];
        let plot = $.plot(placeholder, data, options);
        let ctx = setupCanvasToSpyOn(plot);
        let renderer = plot.getDigitalWaveform().renderer;

        spyOn(renderer, 'drawRectCrossX').and.callThrough();

        plot.draw();

        expect(renderer.drawRectCrossX).toHaveBeenCalledWith(ctx, jasmine.any(Number), jasmine.any(Number), jasmine.any(Number), jasmine.any(Number), '#4da74d', jasmine.any(Boolean), jasmine.any(Boolean));
    });

    it('should draw bus with mixed strengths in yellow', function() {
        [
            [[[0, 0, 1], [1, 0, 1]], [[0, 1, 0], [1, 1, 0]]],
            [[[0, 0, 0], [1, 0, 0]], [[0, 1, 2], [1, 1, 2]]],
            [[[0, 0, 1], [1, 0, 1]], [[0, 1, 1], [1, 1, 1]]]
        ].forEach(data => {
            options.buses = [{}];
            let plot = $.plot(placeholder, data, options);
            let ctx = setupCanvasToSpyOn(plot);
            let renderer = plot.getDigitalWaveform().renderer;

            spyOn(renderer, 'drawRectCrossX').and.callThrough();

            plot.draw();

            expect(renderer.drawRectCrossX).toHaveBeenCalledWith(ctx, jasmine.any(Number), jasmine.any(Number), jasmine.any(Number), jasmine.any(Number), '#edc240', jasmine.any(Boolean), jasmine.any(Boolean));
        });
    });

    it('should draw bus with invalid states as red bar', function() {
        [
            [[[0, 255, 0], [1, 255, 0]], [[0, 1, 0], [1, 1, 0]]],
            [[[0, 0, 0], [1, 0, 0]], [[0, 254, 0], [1, 254, 0]]],
            [[[0, 255, 1], [1, 255, 1]], [[0, 1, 1], [1, 1, 1]]]
        ].forEach(data => {
            options.buses = [{ collapsed: true }];
            let plot = $.plot(placeholder, data, options);
            let ctx = setupCanvasToSpyOn(plot);
            let renderer = plot.getDigitalWaveform().renderer;

            spyOn(renderer, 'drawRect').and.callThrough();

            plot.draw();

            expect(renderer.drawRect).toHaveBeenCalledWith(ctx, jasmine.any(Number), jasmine.any(Number), jasmine.any(Number), jasmine.any(Number), '#cb4b4b', false, jasmine.any(Boolean), jasmine.any(Boolean));
        });
    });

    it('should draw bus transitions only on value changes', function() {
        options.buses = [{ collapsed: true }];
        let data = [
            [[0, 0], [1, 1], [2, 1]],
            [[0.5, 1], [1.5, 1], [2.5, 0]]
        ];
        let plot = $.plot(placeholder, data, options);
        let ctx = setupCanvasToSpyOn(plot);
        let renderer = plot.getDigitalWaveform().renderer;

        spyOn(renderer, 'drawRectCrossX').and.callThrough();

        plot.draw();

        let bus = plot.getOptions().buses[0];
        expect(renderer.drawRectCrossX.calls.allArgs()).toEqual([
            [ctx, 0.5, 1, bus.top, bus.bottom, '#4da74d', true, true],
            [ctx, 1, 1.5, bus.top, bus.bottom, '#4da74d', true, false],
            [ctx, 1.5, 2, bus.top, bus.bottom, '#4da74d', false, false],
            [ctx, 2, 2.5, bus.top, bus.bottom, '#4da74d', false, true],
            [ctx, 2.5, 3, bus.top, bus.bottom, '#4da74d', true, true]
        ]);
    });

    it('should not draw bus labels when they are disabled', function() {
        options.buses = [{
            showLabels: false
        }];
        let data = [
            { data: [0, 0, 0, 0, 0, 1, 1], flatdata: true },
            { data: [0, 1, 1, 1, 1, 0, 1], flatdata: true }
        ];
        let plot = $.plot(placeholder, data, options);
        let ctx = setupCanvasToSpyOn(plot);

        spyOn(ctx, 'fillText').and.callThrough();

        plot.draw();

        expect(ctx.fillText).not.toHaveBeenCalled();
    });

    it('should draw bus labels centered between bus value changes', function() {
        options.buses = [{}];
        let data = [
            [[0, 0], [1, 1], [2, 1], [3, 1]],
            [[0.5, 1], [1.5, 1], [2.5, 0]]
        ];
        let plot = $.plot(placeholder, data, options);
        let ctx = setupCanvasToSpyOn(plot);

        spyOn(ctx, 'fillText').and.callThrough();

        plot.draw();

        expect(ctx.fillText.calls.allArgs()).toEqual([
            [jasmine.any(String), 0.75, 2.5],
            [jasmine.any(String), 1.75, 2.5],
            [jasmine.any(String), 3, 2.5]
        ]);
    });

    it('should draw bus labels left aligned', function() {
        options.buses = [{
            labelPosition: 'left'
        }];
        let data = [
            [[0, 0], [1, 1], [2, 1], [3, 1]],
            [[0.5, 1], [1.5, 1], [2.5, 0]]
        ];
        let plot = $.plot(placeholder, data, options);
        let ctx = setupCanvasToSpyOn(plot);

        spyOn(ctx, 'fillText').and.callThrough();

        plot.draw();

        expect(ctx.fillText.calls.allArgs()).toEqual([
            [jasmine.any(String), 0.525, 2.5],
            [jasmine.any(String), 1.025, 2.5],
            [jasmine.any(String), 2.525, 2.5]
        ]);
    });

    it('should draw bus labels right aligned', function() {
        options.buses = [{
            labelPosition: 'right'
        }];
        let data = [
            [[0, 0], [1, 1], [2, 1], [3, 1]],
            [[0.5, 1], [1.5, 1], [2.5, 0]]
        ];
        let plot = $.plot(placeholder, data, options);
        let ctx = setupCanvasToSpyOn(plot);

        spyOn(ctx, 'fillText').and.callThrough();

        plot.draw();

        expect(ctx.fillText.calls.allArgs()).toEqual([
            [jasmine.any(String), 0.975, 2.5],
            [jasmine.any(String), 2.475, 2.5],
            [jasmine.any(String), 3.475, 2.5]
        ]);
    });

    it('should truncate bus labels when they do not fit between bus value transitions', function() {
        options.buses = [{}];
        let data = [
            { data: [0, 0, 0, 1], flatdata: true },
            { data: [0, 1, 1, 0], flatdata: true }
        ];
        let plot = $.plot(placeholder, data, options);
        let ctx = setupCanvasToSpyOn(plot);

        spyOn(ctx, 'fillText').and.callThrough();

        plot.draw();

        expect(ctx.fillText.calls.allArgs()).toEqual([
            ['0...', jasmine.any(Number), jasmine.any(Number)],
            ['1...', jasmine.any(Number), jasmine.any(Number)],
            ['0...', jasmine.any(Number), jasmine.any(Number)]
        ]);
    });

    it('should format bus labels with provided label formatter', function() {
        [
            { labelFormatter: 'binary', expected: ['00000', '11101', 'X', 'Z'] },
            { labelFormatter: 'decimal', expected: ['00', '29', 'X', 'Z'] },
            { labelFormatter: 'hex', expected: ['00', '1D', 'X', 'Z'] }
        ].forEach(test => {
            options.buses = [{
                labelFormatter: test.labelFormatter
            }];
            let data = [
                { data: [0, 1, 1, 255, 254], flatdata: true },
                { data: [0, 0, 0, 255, 254], flatdata: true },
                { data: [0, 1, 1, 255, 254], flatdata: true },
                { data: [0, 1, 1, 255, 254], flatdata: true },
                { data: [0, 1, 1, 255, 254], flatdata: true }
            ];
            let plot = $.plot(placeholder, data, options);
            let ctx = setupCanvasToSpyOn(plot);
            let dwg = plot.getDigitalWaveform();

            spyOn(dwg, '_drawText').and.callThrough();

            plot.draw();

            expect(dwg._drawText.calls.allArgs()).toEqual([
                [ctx, jasmine.any(Number), jasmine.any(Number), test.expected[0], jasmine.any(Number)],
                [ctx, jasmine.any(Number), jasmine.any(Number), test.expected[1], jasmine.any(Number)],
                [ctx, jasmine.any(Number), jasmine.any(Number), test.expected[2], jasmine.any(Number)],
                [ctx, jasmine.any(Number), jasmine.any(Number), test.expected[3], jasmine.any(Number)]
            ]);
        });
    });

    it('should clip signals and buses on axis min and max', function() {
        options.buses = [{}];
        options.xaxis = {
            autoScale: 'none',
            min: 2,
            max: 4.5
        };
        options.yaxis = {
            autoScale: 'none',
            min: 0.5,
            max: 1.5
        };
        let data = [
            { data: [0, 1, 1, 1, 1, 0, 1], flatdata: true }
        ];
        let plot = $.plot(placeholder, data, options);
        let ctx = setupCanvasToSpyOn(plot);

        spyOn(ctx, 'rect').and.callThrough();
        spyOn(ctx, 'clip').and.callThrough();

        plot.draw();

        expect(ctx.clip).toHaveBeenCalledTimes(3);
        expect(ctx.rect.calls.allArgs()).toEqual([
            [2, 1.5, 2.5, -1],
            [2, 1.5, 2.5, -1],
            [2, 1.5, 2.5, -1]
        ]);
    });

    function setupCanvasToSpyOn(plot) {
        let axes = plot.getAxes();
        axes.xaxis.p2c = (p) => p;
        axes.yaxis.p2c = (p) => p;
        return plot.getCanvas().getContext('2d');
    }

    describe('shapes renderer', function() {
        var renderer, ctx;

        beforeEach(function() {
            let plot = $.plot(placeholder, [], options);
            renderer = plot.getDigitalWaveform().renderer;
            ctx = plot.getCanvas().getContext('2d');
        });

        describe('drawStep', function() {
            it('should draw with given color', function() {
                spyOn(ctx, 'stroke').and.callThrough();

                renderer.drawStep(ctx, 0, 1, 1, null, '#abc123');

                expect(ctx.strokeStyle).toBe('#abc123');
                expect(ctx.stroke).toHaveBeenCalledTimes(1);
            });

            it('should draw single line if last y is null', function() {
                spyOn(ctx, 'moveTo').and.callThrough();
                spyOn(ctx, 'lineTo').and.callThrough();

                renderer.drawStep(ctx, 0, 1, 1, null, 'black');

                expect(ctx.moveTo).toHaveBeenCalledWith(0, 1);
                expect(ctx.lineTo).toHaveBeenCalledWith(1, 1);
            });

            it('should draw single line if last y equals y', function() {
                spyOn(ctx, 'moveTo').and.callThrough();
                spyOn(ctx, 'lineTo').and.callThrough();

                renderer.drawStep(ctx, 0, 1, 1, 1, 'black');

                expect(ctx.moveTo).toHaveBeenCalledWith(0, 1);
                expect(ctx.lineTo).toHaveBeenCalledWith(1, 1);
            });

            it('should draw step up', function() {
                spyOn(ctx, 'moveTo').and.callThrough();
                spyOn(ctx, 'lineTo').and.callThrough();

                renderer.drawStep(ctx, 0, 1, 1, 0, 'black');

                expect(ctx.moveTo).toHaveBeenCalledWith(0, 0);
                expect(ctx.lineTo.calls.allArgs()).toEqual([[0, 1], [1, 1]]);
            });

            it('should draw step down', function() {
                spyOn(ctx, 'moveTo').and.callThrough();
                spyOn(ctx, 'lineTo').and.callThrough();

                renderer.drawStep(ctx, 0, 1, 0, 1, 'black');

                expect(ctx.moveTo).toHaveBeenCalledWith(0, 1);
                expect(ctx.lineTo.calls.allArgs()).toEqual([[0, 0], [1, 0]]);
            });
        });

        describe('drawRect', function() {
            it('should draw a rect', function() {
                spyOn(ctx, 'moveTo').and.callThrough();
                spyOn(ctx, 'lineTo').and.callThrough();

                renderer.drawRect(ctx, 0, 2, 0, 1, '#abc123', false, true, true);

                expect(ctx.moveTo).toHaveBeenCalledWith(0, 0);
                expect(ctx.lineTo.calls.allArgs()).toEqual([[2, 0], [2, 1], [0, 1], [0, 0]]);
            });

            it('should draw with given color', function() {
                spyOn(ctx, 'stroke').and.callThrough();

                renderer.drawRect(ctx, 0, 2, 0, 1, '#abc123');

                expect(ctx.strokeStyle).toBe('#abc123');
                expect(ctx.stroke).toHaveBeenCalledTimes(1);
            });

            it('should fill with transparent color', function() {
                spyOn(ctx, 'fillRect').and.callThrough();

                renderer.drawRect(ctx, 1, 2, 3, 5, 'rgb(171, 193, 35)', true);

                expect(ctx.fillStyle).toBe('rgba(171, 193, 35, 0.4)');
                expect(ctx.fillRect).toHaveBeenCalledWith(1, 3, 1, 2);
            });

            it('should draw a rect with open left side', function() {
                spyOn(ctx, 'moveTo').and.callThrough();
                spyOn(ctx, 'lineTo').and.callThrough();

                renderer.drawRect(ctx, 0, 2, 0, 1, '#abc123', false, false, true);

                expect(ctx.moveTo).toHaveBeenCalledWith(0, 0);
                expect(ctx.lineTo.calls.allArgs()).toEqual([[2, 0], [2, 1], [0, 1]]);
            });

            it('should draw a rect with open right side', function() {
                spyOn(ctx, 'moveTo').and.callThrough();
                spyOn(ctx, 'lineTo').and.callThrough();

                renderer.drawRect(ctx, 0, 2, 0, 1, '#abc123', false, true, false);

                expect(ctx.moveTo.calls.allArgs()).toEqual([[0, 0], [2, 1]]);
                expect(ctx.lineTo.calls.allArgs()).toEqual([[2, 0], [0, 1], [0, 0]]);
            });
        });

        describe('drawRectCrossX', function() {
            it('should draw a rect with X transition on both sides', function() {
                spyOn(ctx, 'moveTo').and.callThrough();
                spyOn(ctx, 'lineTo').and.callThrough();

                renderer.drawRectCrossX(ctx, 0, 2, 0, 1, '#abc123', true, true);

                expect(ctx.moveTo.calls.allArgs()).toEqual([[0, 0.5], [0, 0.5]]);
                expect(ctx.lineTo.calls.allArgs()).toEqual([[0.1, 0], [1.9, 0], [2, 0.5], [0.1, 1], [1.9, 1], [2, 0.5]]);
            });

            it('should draw a rect with X transition on left side', function() {
                spyOn(ctx, 'moveTo').and.callThrough();
                spyOn(ctx, 'lineTo').and.callThrough();

                renderer.drawRectCrossX(ctx, 0, 2, 0, 1, '#abc123', true, false);

                expect(ctx.moveTo.calls.allArgs()).toEqual([[0, 0.5], [0, 0.5]]);
                expect(ctx.lineTo.calls.allArgs()).toEqual([[0.1, 0], [2, 0], [0.1, 1], [2, 1]]);
            });

            it('should draw a rect with X transition on right side', function() {
                spyOn(ctx, 'moveTo').and.callThrough();
                spyOn(ctx, 'lineTo').and.callThrough();

                renderer.drawRectCrossX(ctx, 0, 2, 0, 1, '#abc123', false, true);

                expect(ctx.moveTo.calls.allArgs()).toEqual([[0, 0], [0, 1]]);
                expect(ctx.lineTo.calls.allArgs()).toEqual([[1.9, 0], [2, 0.5], [1.9, 1], [2, 0.5]]);
            });
        });
    });
});
