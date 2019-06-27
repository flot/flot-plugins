describe('cursor with thumbs', function () {
    'use strict';

    var sampledata = [[0, 1], [1, 1.1], [2, 1.2]],
        plot,
        placeholder,
        options,
        styles;

    describe('showThumb property', function () {
        beforeEach(function () {
            var fixture = setFixtures('<div id="demo-container" style="width: 800px;height: 600px">').find('#demo-container').get(0);

            placeholder = $('<div id="placeholder" style="width: 100%;height: 100%">');
            placeholder.appendTo(fixture);
            jasmine.clock().install();
        });

        afterEach(function () {
            plot.shutdown();
            $('#placeholder').empty();
            jasmine.clock().uninstall();
        });

        [['b', 1], ['l', 1], ['t', 1], ['r', 1], ['lt', 2], ['lb', 2]].forEach(function (testData) {
            it('should create a thumb for showThumb' + testData[0], function () {
                options = {
                    cursors: [
                        {
                            name: 'Blue cursor',
                            color: 'blue',
                            position: { relativeX: 0.5, relativeY: 0.6 },
                            showThumbs: testData[0]
                        }
                    ]
                };

                plot = $.plot(placeholder, [sampledata], options);

                jasmine.clock().tick(20);

                var cursor = plot.getCursors()[0];
                expect(cursor.thumbs.length).toEqual(testData[1]);
            });
        });

        it('should not create a thumb for showThumb "none" ', function () {
            options = {
                cursors: [
                    {
                        name: 'Blue cursor',
                        color: 'blue',
                        position: { relativeX: 0.5, relativeY: 0.6 }
                    }
                ]
            };
            plot = $.plot(placeholder, [sampledata], options);

            jasmine.clock().tick(20);

            var cursor = plot.getCursors()[0];
            expect(cursor.thumbs.length).toEqual(0);
        });

        it('should hide the thumb when changing showThumbs to none', () => {
            plot = $.plot(placeholder, [sampledata], {
                cursors: [ { showThumbs: 'lt' } ]
            });

            jasmine.clock().tick(20);

            const cursor = plot.getCursors()[0];
            cursor.thumbs.forEach((thumb) => {
                const computedStyle = window.getComputedStyle(thumb);
                expect(computedStyle.display).toBe('inline');
            });

            plot.setCursor(cursor, { showThumbs: 'none' });

            jasmine.clock().tick(20);

            cursor.thumbs.forEach((thumb) => {
                expect(thumb.style.display).toBe('none');
            });
        });

        it('should add space for thumbs if an axis is not defined at thumb position', function () {
            var fixtures = setFixtures('<div id="test-container" style="width: 600px;height: 400px"/>' +
                '<div id="test-container2" style="width: 600px;height: 400px"/>'),
                placeholder1 = fixtures.find('#test-container'),
                placeholder2 = fixtures.find('#test-container2'),
                options1 = {
                    cursors: [
                        {
                            name: 'Blue cursor',
                            color: 'blue',
                            position: { relativeX: 0.5, relativeY: 0.6 },
                            showThumbs: 'rt'
                        }
                    ]
                },
                options2 = {
                    cursors: [
                        {
                            name: 'Blue cursor',
                            color: 'blue',
                            position: { relativeX: 0.5, relativeY: 0.6 },
                            showThumbs: 'none'
                        }
                    ]
                },
                plot1 = $.plot(placeholder1, [sampledata], options1),
                plot2 = $.plot(placeholder2, [sampledata], options2),
                minimumSpace = 20;

            jasmine.clock().tick(20);

            var plotOffset1 = plot1.getPlotOffset(),
                plotOffset2 = plot2.getPlotOffset();

            expect(plotOffset1.right).toBeGreaterThan(plotOffset2.right + minimumSpace);
            expect(plotOffset1.left).toEqual(plotOffset2.left);
            expect(plotOffset1.top).toBeGreaterThan(plotOffset2.top + minimumSpace);
            expect(plotOffset1.bottom).toEqual(plotOffset2.bottom);
        });

        it('should re-locate the thumbs to plot edge when plot resize', () => {
            const oldPlaceHolderHeight = placeholder.css('height');
            const oldPlaceHolderWidth = placeholder.css('width');
            placeholder.css('height', '80%');
            placeholder.css('width', '80%');

            plot = $.plot(placeholder, [sampledata], {
                cursors: [
                    { mode: 'xy', position: { relativeX: 0.5, relativeY: 0.5 }, showThumbs: 'rb' }
                ]
            });

            jasmine.clock().tick(20);

            placeholder.css('height', oldPlaceHolderHeight);
            placeholder.css('width', oldPlaceHolderWidth);
            plot.resize();
            plot.setupGrid(true);
            plot.draw();

            jasmine.clock().tick(20);

            const expectedThumbRadius = 17;
            const plotOffset = plot.getPlotOffset();
            const xThumb = plot.getCursors()[0].thumbs[0];
            const yThumb = plot.getCursors()[0].thumbs[1];
            const expectedYThumbXPosition = plotOffset.left + plot.width() + expectedThumbRadius;
            const expectedXThumbYPosition = plotOffset.top + plot.height() + expectedThumbRadius;

            expect(xThumb.getCTM().f).toBe(expectedXThumbYPosition);
            expect(yThumb.getCTM().e).toBe(expectedYThumbXPosition);
        });
    });

    describe('thumbOffset property', function () {
        beforeEach(function () {
            var fixture = setFixtures('<div id="demo-container" style="width: 800px;height: 600px">').find('#demo-container').get(0);

            placeholder = $('<div id="placeholder" style="width: 100%;height: 100%">');
            placeholder.appendTo(fixture);
            jasmine.clock().install();
        });

        afterEach(function () {
            plot.shutdown();
            $('#placeholder').empty();
            jasmine.clock().uninstall();
        });

        [
            { show: 't', offset: '-6', expectedX: '0', expectedY: '6' },
            { show: 'l', offset: '6em', expectedX: '-6em', expectedY: '0' },
            { show: 'b', offset: '-6', expectedX: '0', expectedY: '-6' },
            { show: 'r', offset: '6cm', expectedX: '6cm', expectedY: '0' }
        ].forEach(function (testData) {
            it('should offset thumbIcon if offset is specified', function () {
                options = {
                    cursors: [
                        {
                            name: 'Blue cursor',
                            color: 'blue',
                            position: { relativeX: 0.5, relativeY: 0.6 },
                            showThumbs: testData.show,
                            thumbOffset: testData.offset
                        }
                    ]
                };
                plot = $.plot(placeholder, [sampledata], options);

                jasmine.clock().tick(20);

                var cursor = plot.getCursors()[0];
                expect(cursor.thumbs.length).toEqual(1);

                var thumb = cursor.thumbs[0];
                var icon = thumb.childNodes[0];
                expect(icon.getAttribute('y')).toEqual(testData.expectedY);
                expect(icon.getAttribute('x')).toEqual(testData.expectedX);
            });
        });
    });

    describe('custom thumbs', function () {
        beforeEach(function () {
            var fixture = setFixtures('<div id="demo-container" style="width: 800px;height: 600px">').find('#demo-container').get(0);

            placeholder = $('<div id="placeholder" style="width: 100%;height: 100%">');
            placeholder.appendTo(fixture);
            jasmine.clock().install();
        });

        afterEach(function () {
            plot.shutdown();
            $('#placeholder').empty();
            jasmine.clock().uninstall();
        })

        it('custom thumb is shown when specified', function () {
            styles = document.createElement('style');
            styles.innerHTML =
                '.flot-thumbs { --customIcon: <symbol viewBox="0 0 22 27">' +
                '<polyline fill="var(--pointer-fill, inherit)" stroke="var(--pointer-stroke, inherit)" points="0.5,5 10.5,0.5 21.5,5"></polyline>' +
                '<rect fill="var(--shape-fill, inherit)" stroke="var(--shape-stroke, inherit)" x="0.5" y="5.5" width="21" height="21"></rect>' +
                '</symbol> }';

            try {
                options = {
                    cursors: [
                        {
                            name: 'Blue cursor',
                            color: 'blue',
                            position: { relativeX: 0.5, relativeY: 0.6 },
                            showThumbs: 't'
                        }
                    ]
                };
                plot = $.plot(placeholder, [sampledata], options);

                jasmine.clock().tick(20);

                var cursor = plot.getCursors()[0];
                expect(cursor.thumbs.length).toEqual(1);

                // it is impossible to query inside a 'use'.
                // meaning we can only verify symbol by ensuring the dimensions change.
                var standardBBox = cursor.thumbs[0].getBBox();

                document.head.appendChild(styles);

                plot = $.plot(placeholder, [sampledata], options);

                jasmine.clock().tick(20);

                cursor = plot.getCursors()[0];
                expect(cursor.thumbs.length).toEqual(1);

                var customBbox = cursor.thumbs[0].getBBox();
                expect(standardBBox.width).not.toEqual(customBbox.width);
            } finally {
                document.head.removeChild(styles);
            }
        });
    });

    describe('thumbColor option', function () {
        beforeEach(function () {
            var fixture = setFixtures('<div id="demo-container" style="width: 800px;height: 600px">').find('#demo-container').get(0);

            $('<style>.thumbIcon { fill: rgb(100, 100, 100); }</style>').appendTo(fixture);

            placeholder = $('<div id="placeholder" style="width: 100%;height: 100%">');
            placeholder.appendTo(fixture);
            jasmine.clock().install();
        });

        afterEach(function () {
            plot.shutdown();
            $('#placeholder').empty();
            jasmine.clock().uninstall();
        })

        it('fill thumb icon by css style of .thumbIcon by default', function () {
            options = {
                cursors: [
                    {
                        name: 'Blue cursor',
                        color: 'blue',
                        position: { relativeX: 0.5, relativeY: 0.6 },
                        showThumbs: 't'
                    }
                ]
            };
            plot = $.plot(placeholder, [sampledata], options);

            jasmine.clock().tick(20);

            var thumbIcon = plot.getCursors()[0].thumbs[0].childNodes[0];
            expect(getComputedStyle(thumbIcon).fill).toBe('rgb(100, 100, 100)');
        });

        it('fill thumb icon with thumbColor from options', function () {
            options = {
                cursors: [
                    {
                        name: 'Blue cursor',
                        color: 'blue',
                        position: { relativeX: 0.5, relativeY: 0.6 },
                        showThumbs: 't',
                        thumbColor: 'rgb(0, 255, 0)'
                    }
                ]
            };
            plot = $.plot(placeholder, [sampledata], options);

            jasmine.clock().tick(20);

            var thumbIcon = plot.getCursors()[0].thumbs[0].childNodes[0];
            expect(getComputedStyle(thumbIcon).fill).toBe('rgb(0, 255, 0)');
        });
    });

    describe('thumbLabel wrapping', function () {
        beforeEach(function () {
            var fixture = setFixtures('<div id="demo-container" style="width: 800px;height: 600px">').find('#demo-container').get(0);

            placeholder = $('<div id="placeholder" style="width: 100%;height: 100%">');
            placeholder.appendTo(fixture);
            jasmine.clock().install();
        });

        afterEach(function () {
            plot.shutdown();
            $('#placeholder').empty();
            jasmine.clock().uninstall();
        })

        it('thumb text does not wrap when word wrap unspecified', function () {
            options = {
                cursors: [
                    {
                        name: 'Blue cursor',
                        color: 'blue',
                        position: { relativeX: 0.5, relativeY: 0.6 },
                        showThumbs: 't',
                        thumbAbbreviation: 'AB CD EF GH'
                    }
                ]
            };
            plot = $.plot(placeholder, [sampledata], options);

            jasmine.clock().tick(20);

            var cursor = plot.getCursors()[0];
            expect(cursor.thumbs.length).toEqual(1);

            var thumbLabel = cursor.thumbs[0].childNodes[1];
            expect(thumbLabel.childNodes.length).toBe(1);
        });

        it('thumb text does not wrap when word wrap is none', function () {
            styles = document.createElement('style');
            styles.innerHTML = '.thumbLabel { --wrap: none }';
            document.head.appendChild(styles);
            try {
                options = {
                    cursors: [
                        {
                            name: 'Blue cursor',
                            color: 'blue',
                            position: { relativeX: 0.5, relativeY: 0.6 },
                            showThumbs: 't',
                            thumbAbbreviation: 'AB CD EF GH'
                        }
                    ]
                };
                plot = $.plot(placeholder, [sampledata], options);

                jasmine.clock().tick(20);

                var cursor = plot.getCursors()[0];
                expect(cursor.thumbs.length).toEqual(1);

                var thumbLabel = cursor.thumbs[0].childNodes[1];
                expect(thumbLabel.childNodes.length).toBe(1);
            } finally {
                document.head.removeChild(styles);
            }
        });

        it('thumb text wraps when word wrap specified', function () {
            styles = document.createElement('style');
            styles.innerHTML = '.thumbLabel { --wrap: word }';
            document.head.appendChild(styles);
            try {
                options = {
                    cursors: [
                        {
                            name: 'Blue cursor',
                            color: 'blue',
                            position: { relativeX: 0.5, relativeY: 0.6 },
                            showThumbs: 't',
                            thumbAbbreviation: 'AB CD EF GH'
                        }
                    ]
                };
                plot = $.plot(placeholder, [sampledata], options);

                jasmine.clock().tick(20);

                var cursor = plot.getCursors()[0];
                expect(cursor.thumbs.length).toEqual(1);

                var thumbLabel = cursor.thumbs[0].childNodes[1];
                expect(thumbLabel.childNodes.length).toBe(4);
            } finally {
                document.head.removeChild(styles);
            }
        });
    });

    describe('cursor with xy thumbs', function () {
        beforeEach(function () {
            var fixture = setFixtures('<div id="demo-container" style="width: 800px;height: 600px">').find('#demo-container').get(0);

            placeholder = $('<div id="placeholder" style="width: 100%;height: 100%">');
            placeholder.appendTo(fixture);
            options = {
                cursors: [
                    {
                        name: 'Blue cursor',
                        color: 'blue',
                        position: { relativeX: 0.5, relativeY: 0.6 },
                        showThumbs: 'lb'
                    }
                ]
            };

            jasmine.clock().install();
        });

        afterEach(function () {
            plot.shutdown();
            $('#placeholder').empty();
            jasmine.clock().uninstall();
        });

        it('should change position when dragged from thumbs', function () {
            plot = $.plot(placeholder, [sampledata], options);

            jasmine.clock().tick(20);

            var svgRoot = $.thumb.createSVGLayer(placeholder),
                thumbs = document.getElementsByClassName('thumb'),
                cursor = plot.getCursors()[0],
                cursorX = cursor.x,
                cursorY = cursor.y,
                bottomThumb = thumbs[0],
                leftThumb = thumbs[1],
                bottomThumbXCoord = parseFloat(bottomThumb.childNodes[0].getAttribute('x')),
                bottomThumbYCoord = parseFloat(bottomThumb.childNodes[0].getAttribute('y')),
                leftThumbXCoord = parseFloat(leftThumb.childNodes[0].getAttribute('x')),
                leftThumbYCoord = parseFloat(leftThumb.childNodes[0].getAttribute('y'));

            // drag bottom thumb right 100 pixels
            simulate.sendTouchEvents([{ x: bottomThumbXCoord, y: bottomThumbYCoord }], bottomThumb, 'touchstart');
            jasmine.clock().tick(20);
            simulate.sendTouchEvents([{ x: bottomThumbXCoord + 100, y: bottomThumbYCoord }], svgRoot, 'touchmove');
            jasmine.clock().tick(20);
            simulate.sendTouchEvents([{ x: bottomThumbXCoord + 100, y: bottomThumbYCoord }], svgRoot, 'touchend');
            jasmine.clock().tick(20);

            // cursor position should change only on x direction when dragging a bottom thumb
            expect(cursor.x).toBeGreaterThan(cursorX);
            expect(cursor.y).toBe(cursorY);

            cursorX = cursor.x;
            cursorY = cursor.y;

            // drag left thumb down by 100 pixels
            simulate.sendTouchEvents([{ x: leftThumbXCoord, y: leftThumbYCoord }], leftThumb, 'touchstart');
            jasmine.clock().tick(20);
            simulate.sendTouchEvents([{ x: leftThumbXCoord, y: leftThumbYCoord + 100 }], svgRoot, 'touchmove');
            jasmine.clock().tick(20);
            simulate.sendTouchEvents([{ x: leftThumbXCoord, y: leftThumbYCoord + 100 }], svgRoot, 'touchend');
            jasmine.clock().tick(20);

            // cursor position should change only on y direction when dragging a left thumb
            expect(cursor.x).toBe(cursorX);
            expect(cursor.y).toBeGreaterThan(cursorY);
        });
    });

    describe('thumbmove event for a given cursor x thumb', function () {
        beforeEach(function () {
            var fixture = setFixtures('<div id="demo-container" style="width: 800px;height: 600px">').find('#demo-container').get(0);

            placeholder = $('<div id="placeholder" style="width: 100%;height: 100%">');
            placeholder.appendTo(fixture);
            options = {
                cursors: [
                    {
                        name: 'Blue cursor',
                        color: 'blue',
                        position: { relativeX: 0.5, relativeY: 0.6 },
                        showThumbs: 'b'
                    }
                ]
            };

            jasmine.clock().install();
        });

        afterEach(function () {
            plot.shutdown();
            $('#placeholder').empty();
            jasmine.clock().uninstall();
        });

        it('should set the cursor selected property for thumbmovestart event', function () {
            plot = $.plot(placeholder, [sampledata], options);

            jasmine.clock().tick(20);

            var thumb = document.getElementsByClassName('thumb')[0],
                initialCoords = [{ x: 0, y: 0 }];

            simulate.sendTouchEvents(initialCoords, thumb, 'touchstart');
            var cursor = plot.getCursors()[0];

            expect(cursor.selected).toEqual(true);
        });

        it('should set the cursor selected property to false for thumbmoveend event', function () {
            plot = $.plot(placeholder, [sampledata], options);

            jasmine.clock().tick(20);

            var thumb = document.getElementsByClassName('thumb')[0],
                initialCoords = [{ x: 0, y: 0 }],
                svgRoot = $.thumb.createSVGLayer(placeholder),
                cursor = plot.getCursors()[0];

            simulate.sendTouchEvents(initialCoords, thumb, 'touchstart');

            expect(cursor.selected).toEqual(true);

            simulate.sendTouchEvents(initialCoords, svgRoot, 'touchend');

            expect(cursor.selected).toEqual(false);
        });

        it('should change the cursor position on thumbmove event', function () {
            plot = $.plot(placeholder, [sampledata], options);

            jasmine.clock().tick(20);

            var cursorX = plot.offset().left + plot.width() * 0.5,
                cursorY = plot.offset().top + plot.height() * 0.6,
                svgRoot = $.thumb.createSVGLayer(placeholder),
                thumb = document.getElementsByClassName('thumb')[0],
                cursor = plot.getCursors()[0],
                initialCoords = [{ x: cursorX, y: cursorY }],
                finalCoords = [{ x: cursorX + 100, y: cursorY + 100 }];

            simulate.sendTouchEvents(initialCoords, thumb, 'touchstart');
            simulate.sendTouchEvents(finalCoords, svgRoot, 'touchmove');

            jasmine.clock().tick(20);

            expect(cursor.x).not.toBe(cursorX);
            expect(cursor.y).not.toBe(cursorY);
        });

        it('should change the thumb position on cursor move event', function () {
            plot = $.plot(placeholder, [sampledata], options);

            jasmine.clock().tick(20);

            var cursorX = plot.offset().left + plot.width() * 0.5,
                cursorY = plot.offset().top + plot.height() * 0.6,
                eventHolder = $('#placeholder').find('.flot-overlay'),
                thumb = document.getElementsByClassName('thumb')[0],
                cursor = plot.getCursors()[0],
                thumbYPos = thumb.getCTM().f;

            simulate.mouseDown(eventHolder[0], cursorX, cursorY);
            eventHolder.trigger(new $.Event('mousemove', {
                clientX: cursorX + 100,
                clientY: cursorY + 50
            }));

            eventHolder.trigger(new $.Event('mouseup', {
                clientX: cursorX + 100,
                clientY: cursorY + 50
            }));

            jasmine.clock().tick(20);

            expect(thumb.getCTM().e).toBeCloseTo(cursor.x + plot.getPlotOffset().left, 4);
            expect(thumb.getCTM().f).toBeCloseTo(thumbYPos, 4);
        });
    });

    describe('thumbmove event for a given cursor y thumb', function () {
        beforeEach(function () {
            var fixture = setFixtures('<div id="demo-container" style="width: 800px;height: 600px">').find('#demo-container').get(0);

            placeholder = $('<div id="placeholder" style="width: 100%;height: 100%">');
            placeholder.appendTo(fixture);
            options = {
                cursors: [
                    {
                        name: 'Blue cursor',
                        color: 'blue',
                        position: { relativeX: 0.5, relativeY: 0.6 },
                        showThumbs: 'l'
                    }
                ]
            };

            jasmine.clock().install();
        });

        afterEach(function () {
            plot.shutdown();
            $('#placeholder').empty();
            jasmine.clock().uninstall();
        });

        it('should change the cursor position on thumbmove event', function () {
            plot = $.plot(placeholder, [sampledata], options);

            jasmine.clock().tick(20);

            var cursorX = plot.offset().left + plot.width() * 0.5,
                cursorY = plot.offset().top + plot.height() * 0.6,
                svgRoot = $.thumb.createSVGLayer(placeholder),
                thumb = document.getElementsByClassName('thumb')[0],
                cursor = plot.getCursors()[0],
                initialCoords = [{ x: cursorX, y: cursorY }],
                finalCoords = [{ x: cursorX + 100, y: cursorY + 100 }];

            simulate.sendTouchEvents(initialCoords, thumb, 'touchstart');
            simulate.sendTouchEvents(finalCoords, svgRoot, 'touchmove');

            jasmine.clock().tick(20);

            expect(cursor.x).not.toBe(cursorX);
            expect(cursor.y).not.toBe(cursorY);
        });

        it('should change the thumb position on cursor move event', function () {
            plot = $.plot(placeholder, [sampledata], options);

            jasmine.clock().tick(20);

            var cursorX = plot.offset().left + plot.width() * 0.5,
                cursorY = plot.offset().top + plot.height() * 0.6,
                eventHolder = $('#placeholder').find('.flot-overlay'),
                thumb = document.getElementsByClassName('thumb')[0],
                cursor = plot.getCursors()[0],
                thumbXPos = thumb.getCTM().e;

            simulate.mouseDown(eventHolder[0], cursorX, cursorY);
            eventHolder.trigger(new $.Event('mousemove', {
                clientX: cursorX + 0,
                clientY: cursorY + 50
            }));

            eventHolder.trigger(new $.Event('mouseup', {
                clientX: cursorX + 0,
                clientY: cursorY + 50
            }));

            jasmine.clock().tick(20);

            expect(thumb.getCTM().e).toBeCloseTo(thumbXPos, 4);
            expect(thumb.getCTM().f).toBeCloseTo(cursor.y + plot.getPlotOffset().top, 4);
        });
    });

    describe('thumb constrain', () => {
        beforeEach(function () {
            var fixture = setFixtures('<div id="demo-container" style="width: 800px;height: 600px">').find('#demo-container').get(0);

            placeholder = $('<div id="placeholder" style="width: 100%;height: 100%">');
            placeholder.appendTo(fixture);
            options = {
                cursors: [
                    {
                        name: 'Blue cursor',
                        color: 'blue',
                        position: { relativeX: 0.5, relativeY: 0.5 },
                        mode: 'xy',
                        showThumbs: 'tr'
                    }
                ]
            };

            jasmine.clock().install();
        });

        afterEach(function () {
            plot.shutdown();
            $('#placeholder').empty();
            jasmine.clock().uninstall();
        });

        it('should be possible to specify the thumb constrain', () => {
            const cursorOption = options.cursors[0];
            cursorOption.horizontalThumbConstrain = (mouseX, mouseY, previousX, previousY) => {
                // thumb can not be moved
                return [previousX, previousY];
            };
            cursorOption.verticalThumbConstrain = (mouseX, mouseY, previousX, previousY) => {
                const offset = plot.offset(),
                    y = Math.max(offset.top, Math.min(mouseY, plot.height() + offset.top + 2));
                return [previousX, y];
            };
            plot = $.plot(placeholder, [sampledata], options);

            jasmine.clock().tick(20);

            // try to move the top thumb
            const svgRoot = placeholder.find('.flot-thumbs')[0].firstChild;
            let cursorX = plot.offset().left + plot.width() * 0.5,
                cursorY = plot.offset().top,
                thumb = svgRoot.getElementsByClassName('thumb top')[0],
                originalThumbPosition = thumb.getCTM().e;

            simulate.mouseDown(thumb, cursorX, cursorY);
            simulate.mouseMove(svgRoot, cursorX + 100, cursorY);
            simulate.mouseUp(svgRoot, cursorX + 100, cursorY);

            expect(thumb.getCTM().e).toBe(originalThumbPosition);

            // move the right thumb
            cursorX = plot.offset().left + plot.width();
            cursorY = plot.offset().top + plot.height() * 0.5;
            thumb = svgRoot.getElementsByClassName('thumb right')[0];

            const initialCoords = [{ x: cursorX, y: cursorY }];
            const finalCoords = [{ x: cursorX, y: cursorY + plot.height() * 0.5 + 10 }];
            simulate.sendTouchEvents(initialCoords, thumb, 'touchstart');
            simulate.sendTouchEvents(finalCoords, svgRoot, 'touchmove');

            const expectPosition = plot.getPlotOffset().top + plot.height() + 2;
            expect(thumb.getCTM().f).toBe(expectPosition);
        });
    });

    describe('thumbVisibilityChanged event', () => {
        beforeEach(() => {
            const fixture = setFixtures('<div id="demo-container" style="width: 800px;height: 600px">').find('#demo-container').get(0);

            placeholder = $('<div id="placeholder" style="width: 100%;height: 100%">');
            placeholder.appendTo(fixture);
            jasmine.clock().install();
        });

        afterEach(() => {
            plot.shutdown();
            $('#placeholder').empty();
            jasmine.clock().uninstall();
        });

        const makeSureThumbsCreated = () => {
            const plot = $.plot(placeholder, [sampledata], {
                cursors: [
                    {
                        position: { relativeX: 0.5, relativeY: 0.5 },
                        mode: 'x',
                        showThumbs: 't'
                    }
                ],
                pan: {
                    interactive: true
                }
            });

            jasmine.clock().tick(20);

            return plot;
        };

        [
            // test cases where thumbVisibilityChanged event is not fired
            { oldOptions: { show: true, showThumbs: 't' }, options: {}, isFired: false },
            { oldOptions: { show: true, showThumbs: 't' }, options: { show: true }, isFired: false },
            { oldOptions: { show: true, showThumbs: 't' }, options: { showThumbs: 't' }, isFired: false },
            { oldOptions: { show: true, showThumbs: 't' }, options: { showThumbs: 'b' }, isFired: false },
            { oldOptions: { show: true, showThumbs: 't' }, options: { show: true, showThumbs: 'b' }, isFired: false },
            { oldOptions: { showThumbs: 'none' }, options: { showThumbs: 'b' }, isFired: false },
            { oldOptions: { show: false, showThumbs: 'none' }, options: { show: true }, isFired: false },
            { oldOptions: { show: false, showThumbs: 'none' }, options: { showThumbs: 't' }, isFired: false },
            { oldOptions: { show: false, showThumbs: 'none' }, options: { show: false, showThumbs: 't' }, isFired: false },
            { oldOptions: { show: false, showThumbs: 'none' }, options: { show: true, showThumbs: 'none' }, isFired: false },
            // test cases where thumbVisibilityChanged event should be fired
            { oldOptions: { show: true, showThumbs: 't' }, options: { show: false }, isFired: true, visible: false },
            { oldOptions: { show: true, showThumbs: 't' }, options: { showThumbs: 'none' }, isFired: true, visible: false },
            { oldOptions: { show: false }, options: { show: true }, isFired: true, visible: true },
            { oldOptions: { showThumbs: 'none' }, options: { showThumbs: 't' }, isFired: true, visible: true }
        ].forEach((data) => {
            it('may be fired when changing show and showThumbs property', () => {
                plot = makeSureThumbsCreated();

                const cursor = plot.getCursors()[0];

                plot.setCursor(cursor, data.oldOptions);

                jasmine.clock().tick(20);

                const spy = jasmine.createSpy('thumbVisibilityChangedHandler');
                plot.getPlaceholder()[0].addEventListener('thumbVisibilityChanged', spy);
                plot.setCursor(cursor, data.options);

                jasmine.clock().tick(20);

                if (data.isFired) {
                    expect(spy).toHaveBeenCalledTimes(1);
                    const eventObject = spy.calls.argsFor(0)[0];
                    expect(eventObject.detail.visible).toBe(data.visible);
                    expect(eventObject.detail.current).toBe(cursor.thumbs[0]);
                } else {
                    expect(spy).not.toHaveBeenCalled();
                }
            });
        });

        [
            { property: 'show', value: false },
            { property: 'showThumbs', value: 'none' }
        ].forEach((data) => {
            it('should be fired and the thumb has the correct coordinates after dragging the graph', () => {
                plot = makeSureThumbsCreated();
                const cursor = plot.getCursors()[0];

                const spy = jasmine.createSpy('onThumbVisibilityChanged');
                plot.getPlaceholder()[0].addEventListener('thumbVisibilityChanged', spy);
                const oldValue = cursor[data.property];
                const option = {};
                option[data.property] = data.value;
                plot.setCursor(cursor, option);

                jasmine.clock().tick(20);
                expect(spy).toHaveBeenCalledTimes(1);
                spy.calls.reset();

                const options = {
                    mouseX: 100,
                    mouseY: 100,
                    dx: 100,
                    dy: 0
                };
                $('.flot-overlay').simulate("flotdrag", options);
                option[data.property] = oldValue;
                plot.setCursor(cursor, option);

                jasmine.clock().tick(20);
                expect(spy).toHaveBeenCalledTimes(1);
                expect(cursor.position.relativeX > 0.5).toBeTruthy();
            });
        });
    });

    describe('thumbCreated and thumbWillBeRemoved event', () => {
        beforeEach(() => {
            const fixture = setFixtures('<div id="demo-container" style="width: 800px;height: 600px">').find('#demo-container').get(0);

            placeholder = $('<div id="placeholder" style="width: 100%;height: 100%">');
            placeholder.appendTo(fixture);
            jasmine.clock().install();
        });

        afterEach(() => {
            plot.shutdown();
            $('#placeholder').empty();
            jasmine.clock().uninstall();
        });

        it('thumbCreated event should be fired when creating a graph with visible thumb', () => {
            plot = $.plot(placeholder, [sampledata], {
                cursors: [
                    {
                        position: { relativeX: 0.5, relativeY: 0.5 },
                        mode: 'x',
                        showThumbs: 't'
                    }
                ]
            });

            const spy = jasmine.createSpy('onThumbCreated');
            plot.getPlaceholder()[0].addEventListener('thumbCreated', spy);

            jasmine.clock().tick(20);

            expect(spy).toHaveBeenCalledTimes(1);
            const eventObject = spy.calls.argsFor(0)[0];
            const cursor = plot.getCursors()[0];
            expect(eventObject.detail.current).toBe(cursor.thumbs[0]);
        });

        it('thumbCreated event should be fired when creating a cursor with visible thumb', () => {
            plot = $.plot(placeholder, [sampledata], {
                cursors: []
            });

            plot.addCursor({
                mode: 'xy',
                showThumbs: 'tr',
                position: {
                    relativeX: 7,
                    relativeY: 7
                }
            });

            const spy = jasmine.createSpy('onThumbCreated');
            plot.getPlaceholder()[0].addEventListener('thumbCreated', spy);

            jasmine.clock().tick(20);

            expect(spy).toHaveBeenCalledTimes(2);
        });

        it('thumbWillBeRemoved event should be fired when removing a cursor', () => {
            plot = $.plot(placeholder, [sampledata], {
                cursors: [
                    {
                        position: { relativeX: 0.5, relativeY: 0.5 },
                        mode: 'x',
                        showThumbs: 't'
                    }
                ]
            });

            jasmine.clock().tick(20);

            const spy = jasmine.createSpy('onThumbWillBeRemoved');
            plot.getPlaceholder()[0].addEventListener('thumbWillBeRemoved', spy);

            const cursor = plot.getCursors()[0];
            plot.removeCursor(cursor);

            expect(spy).toHaveBeenCalledTimes(1);
            const eventObject = spy.calls.argsFor(0)[0];
            expect(eventObject.detail.current).toBe(cursor.thumbs[0]);
        });

        [
            { mode: 'x', initialShowThumbs: 't', showThumbs: 'b', initial: ['top'], removed: [true], expectedThumbs: ['bottom'] },
            { mode: 'y', initialShowThumbs: 'l', showThumbs: 'r', initial: ['left'], removed: [true], expectedThumbs: ['right'] },
            { mode: 'xy', initialShowThumbs: 'lt', showThumbs: 'rb', initial: ['top', 'left'], removed: [true, true], expectedThumbs: ['bottom', 'right'] },
            { mode: 'xy', initialShowThumbs: 'lt', showThumbs: 'lb', initial: ['top', 'left'], removed: [true, false], expectedThumbs: ['bottom', 'left'] }
        ].forEach((data) => {
            it('previous thumb should be removed and new thumb should be created when changing showThumbs', () => {
                plot = $.plot(placeholder, [sampledata], {
                    cursors: [
                        { mode: data.mode, showThumbs: data.initialShowThumbs }
                    ]
                });

                jasmine.clock().tick(20);

                const cursor = plot.getCursors()[0];
                cursor.thumbs.forEach((thumb, index) => {
                    expect(thumb.shape).toBe(data.initial[index]);
                });

                spyOn(plot, 'draw').and.callThrough();
                const onThumbWillBeRemoved = jasmine.createSpy('onThumbWillBeRemoved');
                plot.getPlaceholder()[0].addEventListener('thumbWillBeRemoved', onThumbWillBeRemoved);
                const onThumbCreated = jasmine.createSpy('onThumbCreated');
                plot.getPlaceholder()[0].addEventListener('thumbCreated', onThumbCreated);
                plot.setCursor(cursor, { showThumbs: data.showThumbs });

                expect(plot.draw).toHaveBeenCalledTimes(1);
                const numberOfRemoved = data.removed.filter((hasBeenRemoved) => hasBeenRemoved).length;
                expect(onThumbWillBeRemoved).toHaveBeenCalledTimes(numberOfRemoved);
                const thumbLayer = placeholder.find('.flot-thumbs')[0].firstChild;
                cursor.thumbs.forEach((thumb, index) => {
                    if (data.removed[index]) {
                        expect(thumb).toBeNull();
                        const removedThumb = thumbLayer.getElementsByClassName(`thumb ${data.initial[index]}`)[0];
                        expect(removedThumb).toBeUndefined();
                    } else {
                        expect(thumb.shape).toBe(data.initial[index]);
                    }
                });

                jasmine.clock().tick(20);

                const numberOfCreated = data.initial.length === numberOfRemoved ? numberOfRemoved : (data.initial.length - numberOfRemoved);
                expect(onThumbCreated).toHaveBeenCalledTimes(numberOfCreated);
                cursor.thumbs.forEach((thumb, index) => {
                    expect(thumb.shape).toBe(data.expectedThumbs[index]);
                });
            });
        });
    });
});
