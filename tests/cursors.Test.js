describe('Flot cursors', function () {
    'use strict';

    var sampledata = [[0, 1], [1, 1.1], [2, 1.2]];
    var plot;
    var placeholder;

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

    it('should be possible to specify a cursor when creating the plot', function () {
        plot = $.plot("#placeholder", [sampledata], {
            cursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue'
                }
            ]
        });

        var firstCursor = plot.getCursors()[0];
        expect(plot.getCursors().length).toBe(1);
        expect(firstCursor.name).toBe('Blue cursor');
    });

    it('should be possible to specify zero cursors when creating the plot', function () {
        plot = $.plot("#placeholder", [sampledata], {
            cursors: []
        });

        expect(plot.getCursors().length).toBe(0);
    });

    it('should be possible to specify multiple cursors when creating the plot', function () {
        plot = $.plot("#placeholder", [sampledata], {
            cursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue'
                },
                {
                    name: 'Red cursor',
                    color: 'red'
                }
            ]
        });

        var firstCursor = plot.getCursors()[0];
        var secondCursor = plot.getCursors()[1];
        expect(plot.getCursors().length).toBe(2);
        expect(firstCursor.name).toBe('Blue cursor');
        expect(secondCursor.name).toBe('Red cursor');
    });

    it('should have xy mode by default', function () {
        plot = $.plot("#placeholder", [sampledata], {
            cursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue'
                }
            ]
        });

        var firstCursor = plot.getCursors()[0];
        expect(firstCursor.mode).toBe('xy');
    });

    it('should be visible by default', function () {
        plot = $.plot("#placeholder", [sampledata], {
            cursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue'
                }
            ]
        });

        var firstCursor = plot.getCursors()[0];
        expect(firstCursor.show).toBe(true);
    });

    it('should have a lineWidth of 1 by default', function () {
        plot = $.plot("#placeholder", [sampledata], {
            cursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue'
                }
            ]
        });

        var firstCursor = plot.getCursors()[0];
        expect(firstCursor.lineWidth).toBe(1);
    });

    it('should be possible to create a cursor at runtime', function () {
        plot = $.plot("#placeholder", [sampledata], {
            cursors: []
        });

        expect(plot.getCursors().length).toBe(0);

        plot.addCursor({
            name: 'Blue cursor',
            mode: 'xy',
            color: 'blue',
            position: {
                relativeX: 7,
                relativeY: 7
            }
        });

        var firstCursor = plot.getCursors()[0];

        expect(plot.getCursors().length).toBe(1);
        expect(firstCursor.name).toBe('Blue cursor');
    });

    it('should be possible to remove a cursor at runtime', function () {
        plot = $.plot("#placeholder", [sampledata], {
            cursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue',
                    x: 3,
                    y: 1.5,
                    showThumbs: 'tl'
                }
            ]
        });

        const firstCursor = plot.getCursors()[0];
        expect(plot.getCursors().length).toBe(1);

        jasmine.clock().tick(20);

        const thumbLayer = placeholder.find('.flot-thumbs')[0].firstChild;
        let thumbs = thumbLayer.getElementsByClassName('thumb');
        expect(thumbs.length).toBe(2);

        plot.removeCursor(firstCursor);
        expect(plot.getCursors().length).toBe(0);

        jasmine.clock().tick(20);

        thumbs = thumbLayer.getElementsByClassName('thumb');
        expect(thumbs.length).toBe(0);
    });

    it('should be possible to change a cursor name at runtime', function () {
        plot = $.plot("#placeholder", [sampledata], {
            cursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue'
                }
            ]
        });

        var firstCursor = plot.getCursors()[0];
        expect(plot.getCursors().length).toBe(1);
        expect(firstCursor.name).toBe('Blue cursor');

        plot.setCursor(firstCursor, {
            name: 'Red Cursor'
        });

        expect(plot.getCursors().length).toBe(1);
        expect(firstCursor.name).toBe('Red Cursor');
    });

    it('should be possible to change a cursor label visibility at runtime', function () {
        plot = $.plot("#placeholder", [sampledata], {
            cursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue'
                }
            ]
        });

        var firstCursor = plot.getCursors()[0];
        expect(plot.getCursors().length).toBe(1);
        expect(firstCursor.showLabel).toBe(false);

        plot.setCursor(firstCursor, {
            showLabel: true
        });

        expect(plot.getCursors().length).toBe(1);
        expect(firstCursor.showLabel).toBe(true);
    });

    it('should be possible to change a cursor mode at runtime', function () {
        plot = $.plot("#placeholder", [sampledata], {
            cursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue'
                }
            ]
        });

        var firstCursor = plot.getCursors()[0];
        expect(plot.getCursors().length).toBe(1);
        expect(firstCursor.mode).toBe('xy');

        plot.setCursor(firstCursor, {
            mode: 'x'
        });

        expect(plot.getCursors().length).toBe(1);
        expect(firstCursor.mode).toBe('x');
    });

    [
        { initial: { mode: 'x', showThumbs: 't' }, optionsArray: [ { showThumbs: 'l' }, { showThumbs: 'r' }, { mode: 'y' } ] },
        { initial: { mode: 'y', showThumbs: 'l' }, optionsArray: [ { showThumbs: 't' }, { showThumbs: 'b' }, { mode: 'x' } ] },
        { initial: { mode: 'xy', showThumbs: 'lt' }, optionsArray: [{ showThumbs: 'lr' }, { showThumbs: 'bt' }, { showThumbs: 'rl' }, { showThumbs: 'tb' }] }
    ].forEach((data) => {
        it('new option is ignored when it do not match the existing properties', () => {
            plot = $.plot("#placeholder", [sampledata], {
                cursors: [
                    data.initial
                ]
            });

            const cursor = plot.getCursors()[0];

            data.optionsArray.forEach((options) => {
                plot.setCursor(cursor, options);
                expect(cursor.mode).toBe(data.initial.mode);
                expect(cursor.showThumbs).toBe(data.initial.showThumbs);
            });
        });
    });

    [
        { options: { mode: 'x', showThumbs: 'l' }, coercedValue: 't' },
        { options: { mode: 'x', showThumbs: 'r' }, coercedValue: 't' },
        { options: { mode: 'y', showThumbs: 't' }, coercedValue: 'r' },
        { options: { mode: 'y', showThumbs: 'b' }, coercedValue: 'r' },
        { options: { mode: 'xy', showThumbs: 'lr' }, coercedValue: 'tr' },
        { options: { mode: 'xy', showThumbs: 'tb' }, coercedValue: 'tr' }
    ].forEach((data) => {
        it('showThumbs is coerced when setting mode and showThumbs together but they are not matched', () => {
            plot = $.plot("#placeholder", [sampledata], {
                cursors: [ {} ]
            });

            const cursor = plot.getCursors()[0];
            plot.setCursor(cursor, data.options);
            expect(cursor.mode).toBe(data.options.mode);
            expect(cursor.showThumbs).toBe(data.coercedValue);
        });
    });

    var symbols = ['cross', 'triangle', 'square', 'diamond'];
    symbols.forEach(function (symbol, i, arr) {
        it('should be possible to make the cursor shape a ' + symbol, function () {
            plot = $.plot("#placeholder", [sampledata], {
                cursors: [
                    {
                        name: 'Blue cursor',
                        color: 'blue',
                        symbol: symbol
                    }
                ]
            });

            arr.forEach(function (symbol) {
                spyOn(plot.drawSymbol, symbol);
            });

            jasmine.clock().tick(20);

            arr.forEach(function (s) {
                if (s === symbol) {
                    expect(plot.drawSymbol[s]).toHaveBeenCalled();
                } else {
                    expect(plot.drawSymbol[s]).not.toHaveBeenCalled();
                }
            });
        });
    });

    it('should be possible to make the cursor shape "none"', function () {
        plot = $.plot("#placeholder", [sampledata], {
            cursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue',
                    symbol: 'none'
                }
            ]
        });

        symbols.forEach(function (symbol) {
            spyOn(plot.drawSymbol, symbol);
        });

        jasmine.clock().tick(20);

        symbols.forEach(function (s) {
            expect(plot.drawSymbol[s]).not.toHaveBeenCalled();
        });
    });

    it('should be possible to change the cursor shape at runtime', function () {
        plot = $.plot("#placeholder", [sampledata], {
            cursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue',
                    symbol: 'diamond'
                }
            ]
        });

        ['square', 'diamond'].forEach(function (symbol) {
            spyOn(plot.drawSymbol, symbol);
        });

        jasmine.clock().tick(20);

        var firstCursor = plot.getCursors()[0];

        plot.setCursor(firstCursor, {
            symbol: 'square'
        });

        jasmine.clock().tick(20);

        expect(plot.drawSymbol.square).toHaveBeenCalled();
    });

    it('should be possible to change the cursor color at runtime', function () {
        plot = $.plot("#placeholder", [sampledata], {
            cursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue'
                }
            ]
        });

        var firstCursor = plot.getCursors()[0];
        var initialColor = firstCursor.color;
        plot.setCursor(firstCursor, {
            color: 'red'
        });

        expect(initialColor).toBe('blue');
        expect(firstCursor.color).toBe('red');
    });

    it('should be possible to change the cursor lineWidth at runtime', function () {
        plot = $.plot("#placeholder", [sampledata], {
            cursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue',
                    lineWidth: 2
                }
            ]
        });

        var firstCursor = plot.getCursors()[0];
        var initialLineWidth = firstCursor.lineWidth;

        plot.setCursor(firstCursor, {
            lineWidth: 3
        });

        expect(initialLineWidth).toBe(2);
        expect(firstCursor.lineWidth).toBe(3);
    });

    it('should be possible to change the cursor visibility at runtime', function () {
        plot = $.plot("#placeholder", [sampledata], {
            cursors: [{
                name: 'Blue cursor',
                color: 'blue',
                show: true,
                showThumbs: 'lt'
            }]
        });

        const firstCursor = plot.getCursors()[0];
        const initialVisibility = firstCursor.show;

        jasmine.clock().tick(20);

        firstCursor.thumbs.forEach((thumb) => {
            const computedStyle = window.getComputedStyle(thumb);
            expect(computedStyle.display).toBe('inline');
        });

        plot.setCursor(firstCursor, {
            show: false
        });

        jasmine.clock().tick(20);

        expect(initialVisibility).toBe(true);
        expect(firstCursor.show).toBe(false);
        firstCursor.thumbs.forEach((thumb) => {
            expect(thumb.style.display).toBe('none');
        });
    });

    it('should be possible to make a dashed line', function() {
        plot = $.plot("#placeholder", [sampledata], {
            cursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue',
                    mode: 'xy',
                    dashes: []
                }
            ]
        });

        var octx = $('.flot-overlay')[0].getContext("2d");
        var spyOnSetLineDash = spyOn(octx, 'setLineDash').and.callThrough();
        var spyOnLineTo = spyOn(octx, 'lineTo').and.callThrough();

        jasmine.clock().tick(20);

        expect(spyOnLineTo.calls.count()).toBe(4);
        expect(spyOnSetLineDash.calls.allArgs()[0][0]).toEqual([]);
        expect(spyOnSetLineDash.calls.allArgs()[1][0]).toEqual([]);

        plot = $.plot("#placeholder", [sampledata], {
            cursors: [
                {
                    name: 'Blue cursor',
                    color: 'blue',
                    mode: 'x',
                    dashes: [4, 4]
                }
            ]
        });

        spyOnLineTo.calls.reset();
        spyOnSetLineDash.calls.reset();

        jasmine.clock().tick(20);

        expect(spyOnLineTo.calls.count()).toBe(2);
        expect(spyOnSetLineDash.calls.allArgs()[0][0]).toEqual([4, 4]);
        expect(spyOnSetLineDash.calls.allArgs()[1][0]).toEqual([]);
    });

    describe('Labels', function () {
        function spyOnFillText() {
            var overlay = $('.flot-overlay')[0];
            var octx = overlay.getContext("2d");
            return spyOn(octx, 'fillText').and.callThrough();
        }

        it('should display the cursor label when told so', function () {
            plot = $.plot("#placeholder", [sampledata], {
                cursors: [
                    {
                        name: 'Blue cursor',
                        color: 'blue',
                        position: {
                            x: 1,
                            y: 1.15
                        },
                        showLabel: true
                    } ]
            });

            var spy = spyOnFillText();
            jasmine.clock().tick(20);

            expect(spy).toHaveBeenCalledWith('Blue cursor', jasmine.any(Number), jasmine.any(Number));
        });

        it('should not display the cursor label when told not to', function () {
            plot = $.plot("#placeholder", [sampledata], {
                cursors: [
                    {
                        name: 'Blue cursor',
                        color: 'blue',
                        position: {
                            x: 1,
                            y: 1.15
                        },
                        showLabel: false
                    } ]
            });

            var spy = spyOnFillText();
            jasmine.clock().tick(20);

            expect(spy).not.toHaveBeenCalledWith('Blue cursor', jasmine.any(Number), jasmine.any(Number));
        });

        it('should display the cursor values relative to a plot when told so', function () {
            plot = $.plot("#placeholder", [sampledata], {
                cursors: [
                    {
                        name: 'Blue cursor',
                        color: 'blue',
                        position: {
                            x: 1.0,
                            y: 1.15
                        },
                        snapToPlot: 0
                    }
                ]
            });

            var spy = spyOnFillText();
            jasmine.clock().tick(20);

            expect(spy).toHaveBeenCalledWith('1.000, 1.1000', jasmine.any(Number), jasmine.any(Number));
        });

        it('should not display the cursor values relative to a plot when told not to', function () {
            plot = $.plot("#placeholder", [sampledata], {
                cursors: [
                    {
                        name: 'Blue cursor',
                        color: 'blue',
                        position: {
                            x: 1,
                            y: 1.15
                        }
                    }
                ]
            });

            var spy = spyOnFillText();
            jasmine.clock().tick(20);

            expect(spy).toHaveBeenCalled();
        });

        it('should display both the cursor label and values when told so', function () {
            plot = $.plot("#placeholder", [sampledata], {
                cursors: [{
                    name: 'Blue cursor',
                    color: 'blue',
                    position: {
                        x: 1,
                        y: 1.15
                    },
                    showLabel: true,
                    showValues: true
                }],
                xaxes: [{
                    min: 0,
                    max: 10,
                    ticks: 10,
                    autoScale: "none"
                }],
                yaxes: [{
                    min: 1,
                    max: 1.2,
                    ticks: 10,
                    autoScale: "none"
                }]
            });

            var spy = spyOnFillText();
            jasmine.clock().tick(20);

            expect(spy).toHaveBeenCalledWith('Blue cursor', jasmine.any(Number), jasmine.any(Number));
            expect(spy).toHaveBeenCalledWith('1.00, 1.1500', jasmine.any(Number), jasmine.any(Number));
        });

        it('should display the cursor label in the same format as axis', function () {
            plot = $.plot("#placeholder", [sampledata], {
                cursors: [{
                    name: 'Blue cursor',
                    color: 'blue',
                    position: { relativeX: 0.5, relativeY: 0.5 },
                    showLabel: true,
                    showValues: true,
                    snapToPlot: undefined,
                    defaultxaxis: 1,
                    defaultyaxis: 2
                }],
                xaxes: [
                    { min: 0, max: 10, autoScale: "none", tickFormatter: function(val) { return '<' + val + '>'; } }
                ],
                yaxes: [
                    { min: 100, max: 110, autoScale: "none", tickFormatter: function(val) { return '(' + val + ')'; } },
                    { min: 100, max: 110, autoScale: "none", tickFormatter: function(val) { return '{' + val + '}'; } }
                ]
            });

            var spy = spyOnFillText();
            jasmine.clock().tick(20);

            expect(spy).toHaveBeenCalledWith('<5>, {105}', jasmine.any(Number), jasmine.any(Number));
        });

        [['top right', 1.5, 1.2], ['top left', 0.5, 1.2], ['bottom right', 1.5, 1.0], ['top left', 0.5, 1.0]].forEach(function (pos) {
            describe('When cursor placed in the ' + pos[0] + ' of the plot', function () {
                it('should display the cursor label above the values', function () {
                    plot = $.plot("#placeholder", [sampledata], {
                        cursors: [
                            {
                                name: 'Blue cursor',
                                color: 'blue',
                                position: {
                                    x: pos[1],
                                    y: pos[2]
                                },
                                showLabel: true,
                                showValues: true
                            }
                        ]
                    });

                    var spy = spyOnFillText();
                    jasmine.clock().tick(20);

                    var args = spy.calls.allArgs();
                    expect(args.length).toBe(2);

                    var cursorArgs = args.filter(function (args) {
                        return args[0] === 'Blue cursor';
                    })[0];

                    var valueArgs = args.filter(function (args) {
                        return args[0] !== 'Blue cursor';
                    })[0];

                    expect(cursorArgs[2]).toBeLessThan(valueArgs[2]);
                });
            });
        });
    });

    describe('Names', function () {
        it('should give the cursors default names if not specified', function () {
            plot = $.plot("#placeholder", [sampledata], {
                cursors: [
                    {
                        color: 'blue'
                    }
                ]
            });

            var firstCursor = plot.getCursors()[0];

            expect(firstCursor.name).toEqual(jasmine.any(String));
            expect(firstCursor.name.length).toBeGreaterThan(0);
        });

        it('should give the cursors unique names');
        it('should give the cursors created at runtime unique names');
    });

    describe('Precision', function () {
        function spyOnFillText() {
            var overlay = $('.flot-overlay')[0];
            var octx = overlay.getContext("2d");
            return spyOn(octx, 'fillText').and.callThrough();
        }

        it('should give the cursors a higher precision in a big graph', function () {
            var fixture = setFixtures('<div id="demo-container" style="width: 1000px;height: 1000px">').find('#demo-container').get(0);

            placeholder = $('<div id="placeholder" style="width: 100%;height: 100%">');
            placeholder.appendTo(fixture);
            plot = $.plot("#placeholder", [sampledata], {
                cursors: [
                    {
                        name: 'Blue cursor',
                        color: 'blue',
                        position: {
                            x: 1,
                            y: 1.15
                        },
                        showValues: true
                    }
                ]
            });

            var spy = spyOnFillText();
            jasmine.clock().tick(20);

            expect(spy).toHaveBeenCalledWith('1.000, 1.1500', jasmine.any(Number), jasmine.any(Number));
        });

        it('should give the cursors a smaller precision in a litle graph', function () {
            var fixture = setFixtures('<div id="demo-container" style="width: 100px;height: 100px">').find('#demo-container').get(0);

            placeholder = $('<div id="placeholder" style="width: 100%;height: 100%">');
            placeholder.appendTo(fixture);
            plot = $.plot("#placeholder", [sampledata], {
                cursors: [
                    {
                        name: 'Blue cursor',
                        color: 'blue',
                        position: {
                            x: 1,
                            y: 1.15
                        },
                        showValues: true
                    }
                ]
            });

            var spy = spyOnFillText();
            jasmine.clock().tick(20);

            expect(spy).toHaveBeenCalledWith('1.00, 1.150', jasmine.any(Number), jasmine.any(Number));
        });
    });

    describe('cursorupdates', function() {
        it("should be called when a cursor is added", function() {
            plot = $.plot(placeholder, [sampledata], {});

            var spy = jasmine.createSpy('spy');
            placeholder.on('cursorupdates', spy);

            plot.addCursor({
                name: 'Blue cursor',
                mode: 'xy',
                color: 'blue',
                position: {
                    relativeX: 0.5,
                    relativeY: 0.5
                }
            });
            jasmine.clock().tick(20);

            expect(spy).toHaveBeenCalled();
        });

        it("should be called with the cursors name", function() {
            var spy = jasmine.createSpy('spy');
            placeholder.on('cursorupdates', spy);

            var cursor,
                oncursorupdates = function (event, cursordata) {
                    cursor = cursordata[0];
                };
            placeholder.bind("cursorupdates", oncursorupdates);

            plot = $.plot(placeholder, [sampledata], {
                cursors: [
                    {
                        name: 'Blue cursor',
                        color: 'blue',
                        position: { relativeX: 0.5, relativeY: 0.5 }
                    }
                ]
            });
            jasmine.clock().tick(20);

            expect(spy).toHaveBeenCalled();
            expect(cursor.cursor).toEqual('Blue cursor');
        });

        it("should return the cursors intersection", function() {
            var spy = jasmine.createSpy('spy');
            placeholder.on('cursorupdates', spy);
            var cursorX, cursorY;

            placeholder.bind("cursorupdates", function (event, cursordata) {
                cursorX = cursordata[0].x;
                cursorY = cursordata[0].y;
            });

            plot = $.plot("#placeholder", [sampledata], {
                cursors: [
                    {
                        name: 'Blue cursor',
                        color: 'blue',
                        position: { relativeX: 0.5, relativeY: 0.5 },
                        snapToPlot: -1
                    }
                ]
            });

            jasmine.clock().tick(20);

            expect(spy).toHaveBeenCalled();
            expect(cursorX).toBeCloseTo(1, 8);
            expect(cursorY).toBeCloseTo(1.1, 8);
        });
    });
});
