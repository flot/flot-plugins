'use strict';

/*global waitUntilAsync*/

describe('Flot axis handles', () => {
    const sampleData = [[0, 1], [1, 1.1], [2, 1.2]];
    let plot;
    let placeholder;
    let simulate;

    beforeAll(() => {
        simulate = window.simulate;
    });

    afterAll(() => {
        simulate = null;
    });

    beforeEach(function () {
        const fixture = setFixtures('<div id="demo-container" style="width: 800px;height: 600px">').find('#demo-container').get(0);

        placeholder = $('<div id="placeholder" style="width: 100%;height: 100%">');
        placeholder.appendTo(fixture);
        jasmine.clock().install();
    });

    afterEach(function () {
        plot.shutdown();
        plot = null;
        $('#placeholder').empty();
        placeholder = null;
        jasmine.clock().uninstall();
    });

    describe('axis handle', () => {
        const verifyDefaultPropertiesValueExceptOne = (axisHandle, exclusion) => {
            const propertyMap = {
                position: 0.5,
                show: true,
                location: 'far',
                handleLabel: '0',
                orientation: 'vertical',
                axisIndex: 0,
                radius: 17,
                handleClassList: ['draggable'],
                name: 'test-handle'
            };
            Object.keys(propertyMap)
                .filter((key) => key !== exclusion)
                .forEach((key) => {
                    if (typeof axisHandle[key] === 'object') {
                        expect(axisHandle[key]).toEqual(propertyMap[key]);
                    } else if (typeof axisHandle[key] === 'number') {
                        expect(axisHandle[key]).toBeCloseTo(propertyMap[key]);
                    } else {
                        expect(axisHandle[key]).toBe(propertyMap[key]);
                    }
                });
        };

        it('should be possible to specify handles when creating the plot', () => {
            plot = $.plot(placeholder, [sampleData], {
                axisHandles: [
                    {
                        orientation: 'vertical',
                        location: 'far'
                    },
                    {
                        orientation: 'horizontal',
                        location: 'near'
                    }
                ]
            });

            expect(plot.getAxisHandles().length).toBe(2);
        });

        it('should have expected default values', () => {
            plot = $.plot(placeholder, [sampleData], {
                axisHandles: [
                    {}
                ]
            });

            const handle = plot.getAxisHandles()[0];
            verifyDefaultPropertiesValueExceptOne(handle, 'name');
        });

        it('should be possible to create a handle at runtime', () => {
            plot = $.plot(placeholder, [sampleData], {
                axisHandles: []
            });

            expect(plot.getAxisHandles().length).toBe(0);

            plot.addAxisHandle({
                orientation: 'horizontal',
                position: 0.8
            });

            const newHandle = plot.getAxisHandles()[0];
            expect(newHandle.position).toBe(0.8);
            expect(newHandle.orientation).toBe('horizontal');
        });

        it('should be possible to remove a handle at runtime', () => {
            plot = $.plot(placeholder, [sampleData], {
                axisHandles: [
                    { orientation: 'vertical', location: 'far' },
                    { orientation: 'vertical', location: 'near', name: 'test-handle' }
                ]
            });

            jasmine.clock().tick(20);

            expect(plot.getAxisHandles().length).toBe(2);
            plot.removeAxisHandle(plot.getAxisHandles()[0]);
            const farThumbs = placeholder[0].getElementsByClassName('right thumb');
            expect(farThumbs.length).toBe(0);
            expect(plot.getAxisHandles()[0].name).toBe('test-handle');
        });

        it('should be possible to set the orientation property for an existing handle at runtime', () => {
            plot = $.plot(placeholder, [sampleData], {
                axisHandles: [
                    {
                        orientation: 'vertical',
                        name: 'test-handle'
                    }
                ]
            });

            jasmine.clock().tick(20);

            const handle = plot.getAxisHandles()[0];
            expect(handle.thumb.classList.contains('y')).toBeTruthy();

            spyOn(plot, 'draw').and.callThrough();
            plot.setAxisHandle(handle, {
                orientation: 'horizontal'
            });

            expect(plot.draw).toHaveBeenCalledTimes(1);
            expect(handle.orientation).toBe('horizontal');
            verifyDefaultPropertiesValueExceptOne(handle, 'orientation');

            jasmine.clock().tick(20);

            expect(handle.thumb.classList.contains('x')).toBeTruthy();
        });

        it('should be possible to set the location property for an existing handle at runtime', () => {
            plot = $.plot(placeholder, [sampleData], {
                axisHandles: [
                    {
                        location: 'far',
                        orientation: 'vertical',
                        name: 'test-handle'
                    }
                ]
            });

            jasmine.clock().tick(20);

            const getHrefAttribute = (svgElement) => {
                return svgElement.getAttributeNS('http://www.w3.org/1999/xlink', 'href');
            };
            const handle = plot.getAxisHandles()[0];
            let thumbIcon = handle.thumb.getElementsByClassName('thumbIcon')[0];
            expect(getHrefAttribute(thumbIcon)).toBe('#r_round');

            spyOn(plot, 'draw').and.callThrough();
            plot.setAxisHandle(handle, {
                location: 'near'
            });

            expect(plot.draw).toHaveBeenCalledTimes(1);
            expect(handle.location).toBe('near');
            verifyDefaultPropertiesValueExceptOne(handle, 'location');

            jasmine.clock().tick(20);

            thumbIcon = handle.thumb.getElementsByClassName('thumbIcon')[0];
            expect(getHrefAttribute(thumbIcon)).toBe('#l_round');
        });

        it('should be possible to set the show property for an existing handle at runtime', () => {
            plot = $.plot(placeholder, [sampleData], {
                axisHandles: [
                    {
                        show: true,
                        name: 'test-handle'
                    }
                ]
            });

            jasmine.clock().tick(20);

            const handle = plot.getAxisHandles()[0];
            plot.setAxisHandle(handle, {
                show: false
            });

            expect(handle.show).toBe(false);
            verifyDefaultPropertiesValueExceptOne(handle, 'show');

            jasmine.clock().tick(20);

            expect(handle.thumb.style.display).toBe('none');
        });

        it('should be possible to set the position property for an existing handle at runtime', () => {
            plot = $.plot(placeholder, [sampleData], {
                axisHandles: [
                    {
                        position: 0.5,
                        name: 'test-handle'
                    }
                ]
            });

            const handle = plot.getAxisHandles()[0];
            plot.setAxisHandle(handle, {
                position: 0.85
            });

            expect(handle.position).toBe(0.85);
            verifyDefaultPropertiesValueExceptOne(handle, 'position');
        });

        it('should be possible to set the handleLabel property for an existing handle at runtime', () => {
            plot = $.plot(placeholder, [sampleData], {
                axisHandles: [
                    {
                        handleLabel: 'A',
                        name: 'test-handle'
                    }
                ]
            });

            jasmine.clock().tick(20);

            const handle = plot.getAxisHandles()[0];
            const thumbLabel = handle.thumb.getElementsByClassName('thumbLabel')[0];
            expect(thumbLabel.textContent).toBe('A');

            plot.setAxisHandle(handle, {
                handleLabel: 'T'
            });

            expect(handle.handleLabel).toBe('T');
            verifyDefaultPropertiesValueExceptOne(handle, 'handleLabel');
            expect(thumbLabel.textContent).toBe('T');
        });

        it('should be possible to set the radius property for an existing handle at runtime', () => {
            plot = $.plot(placeholder, [sampleData], {
                axisHandles: [
                    {
                        name: 'test-handle'
                    }
                ]
            });

            jasmine.clock().tick(20);

            const handle = plot.getAxisHandles()[0];
            let thumbIcon = handle.thumb.getElementsByClassName('thumbIcon')[0];
            const getSize = (svgElement) => {
                const width = svgElement.getAttributeNS(null, 'width');
                const height = svgElement.getAttributeNS(null, 'height');
                return [width, height];
            };
            expect(getSize(thumbIcon)).toEqual(['34', '34']);
            spyOn(plot, 'draw').and.callThrough();
            plot.setAxisHandle(handle, {
                radius: 15
            });

            expect(plot.draw).toHaveBeenCalledTimes(1);
            expect(handle.radius).toBe(15);
            verifyDefaultPropertiesValueExceptOne(handle, 'radius');

            jasmine.clock().tick(20);

            thumbIcon = handle.thumb.getElementsByClassName('thumbIcon')[0];
            expect(getSize(thumbIcon)).toEqual(['30', '30']);
        });

        it('should be possible to set the axisIndex property for an existing handle at runtime', () => {
            plot = $.plot(placeholder, [sampleData], {
                yaxes: [
                    {
                        min: 1,
                        max: 1.2,
                        ticks: 10,
                        autoScale: "none"
                    },
                    {
                        min: 1,
                        max: 1.2,
                        ticks: 20,
                        autoScale: "none"
                    }
                ],
                axisHandles: [
                    {
                        axisIndex: 0,
                        name: 'test-handle'
                    }
                ]
            });

            const handle = plot.getAxisHandles()[0];
            plot.setAxisHandle(handle, {
                axisIndex: 1
            });

            expect(handle.axisIndex).toBe(1);
            verifyDefaultPropertiesValueExceptOne(handle, 'axisIndex');
        });

        it('should be possible to set the handleClassList property for an existing handle at runtime', () => {
            plot = $.plot(placeholder, [sampleData], {
                axisHandles: [
                    {
                        name: 'test-handle'
                    }
                ]
            });

            jasmine.clock().tick(20);

            const handle = plot.getAxisHandles()[0];
            expect(handle.handleClassList).toEqual(['draggable']);
            expect(handle.thumb.classList.contains('draggable')).toBe(true);

            plot.setAxisHandle(handle, {
                handleClassList: []
            });

            expect(handle.handleClassList).toEqual([]);
            expect(handle.thumb.classList.contains('draggable')).toBe(false);
            verifyDefaultPropertiesValueExceptOne(handle, 'handleClassList');
        });

        it('should have a fallback value for axisIndex when it is invalid', () => {
            plot = $.plot(placeholder, [sampleData], {
                axisHandles: [
                    {
                        orientation: 'vertical',
                        location: 'near',
                        name: 'test-handle',
                        axisIndex: 2
                    }
                ]
            });

            const handle = plot.getAxisHandles()[0];
            expect(handle.axisIndex).toBe(0);

            plot.setAxisHandle(handle, {
                axisIndex: 1
            });
            expect(handle.axisIndex).toBe(0);
        });

        it('should be positioned relative to the canvas', () => {
            plot = $.plot(placeholder, [sampleData], {
                axisHandles: [
                    {
                        orientation: 'vertical',
                        location: 'near',
                        position: 0.5
                    },
                    {
                        orientation: 'horizontal',
                        location: 'far',
                        position: 0.8
                    }
                ]
            });

            jasmine.clock().tick(20);

            const handles = plot.getAxisHandles();
            expect(handles[0].positionInPixel).toBe(0.5 * plot.height());
            expect(handles[1].positionInPixel).toBe(0.8 * plot.width());
            const position = plot.c2p({
                left: 0.8 * plot.width(),
                top: 0.5 * plot.height()
            });
            expect(handles[0].absolutePosition).toBeCloseTo(position.y);
            expect(handles[1].absolutePosition).toBeCloseTo(position.x);
        });

        it('absolutePosition should not change on plot zoom', () => {
            plot = $.plot(placeholder, [sampleData], {
                axisHandles: [
                    {
                        orientation: 'vertical',
                        location: 'near',
                        position: 0.5
                    },
                    {
                        orientation: 'horizontal',
                        location: 'far',
                        position: 0.8
                    }
                ]
            });

            jasmine.clock().tick(20);
            const position = plot.c2p({
                left: 0.8 * plot.width(),
                top: 0.5 * plot.height()
            });

            plot.zoom({ amount: 0.6, center: { left: plot.width() * 0.75, top: plot.height() * 0.75 } });
            jasmine.clock().tick(20);

            const handles = plot.getAxisHandles();
            expect(handles[0].absolutePosition).toBeCloseTo(position.y);
            expect(handles[1].absolutePosition).toBeCloseTo(position.x);
        });

        it('absolutePosition should not be change on plot pan', () => {
            plot = $.plot(placeholder, [sampleData], {
                axisHandles: [
                    {
                        orientation: 'vertical',
                        location: 'near',
                        position: 0.5
                    },
                    {
                        orientation: 'horizontal',
                        location: 'far',
                        position: 0.8
                    }
                ]
            });

            jasmine.clock().tick(20);
            const position = plot.c2p({
                left: 0.8 * plot.width(),
                top: 0.5 * plot.height()
            });

            plot.pan({ left: 50, top: -30 });
            jasmine.clock().tick(20);

            const handles = plot.getAxisHandles();
            expect(handles[0].absolutePosition).toBeCloseTo(position.y);
            expect(handles[1].absolutePosition).toBeCloseTo(position.x);
        });

        it('positionInPixel should sync up with the position when setting the position property', () => {
            plot = $.plot(placeholder, [sampleData], {
                axisHandles: [
                    {
                        orientation: 'horizontal',
                        location: 'far',
                        position: 0.8
                    }
                ]
            });

            jasmine.clock().tick(20);
            const handle = plot.getAxisHandles()[0];
            expect(handle.positionInPixel).toBeCloseTo(0.8 * plot.width());

            plot.setAxisHandle(handle, {
                position: 0.4
            });

            jasmine.clock().tick(20);

            expect(handle.positionInPixel).toBe(0.4 * plot.width());
        });

        it('absolutePosition should sync up with the position when setting the position property', () => {
            plot = $.plot(placeholder, [sampleData], {
                axisHandles: [
                    {
                        orientation: 'horizontal',
                        location: 'far',
                        position: 0.8
                    }
                ]
            });

            jasmine.clock().tick(20);
            const handle = plot.getAxisHandles()[0];
            const calculateAbsolutePosition = (position) => {
                const axis = plot.getXAxes()[handle.axisIndex];
                return axis.c2p(position * plot.width());
            };
            expect(handle.absolutePosition).toBeCloseTo(calculateAbsolutePosition(0.8));

            plot.setAxisHandle(handle, {
                position: 0.4
            });

            jasmine.clock().tick(20);
            expect(handle.absolutePosition).toBeCloseTo(calculateAbsolutePosition(0.4));
        });

        it('position and positionInPixel should be overwrited and be sync up with the absolutePosition', () => {
            plot = $.plot(placeholder, [sampleData], {
                axisHandles: [
                    {
                        orientation: 'horizontal',
                        location: 'far',
                        absolutePosition: 1,
                        position: 0
                    }
                ]
            });
            jasmine.clock().tick(20);

            const handle = plot.getAxisHandles()[0];

            let expectedPosition, expectedPositionInPixel;
            const calculatePosition = (absolutePosition) => {
                const axis = plot.getXAxes()[handle.axisIndex];
                expectedPositionInPixel = axis.p2c(absolutePosition);
                expectedPosition = expectedPositionInPixel / plot.width();
            };

            calculatePosition(1);
            expect(handle.position).toBeCloseTo(expectedPosition);
            expect(handle.positionInPixel).toBeCloseTo(expectedPositionInPixel);

            plot.setAxisHandle(handle, {
                absolutePosition: 0.5
            });
            jasmine.clock().tick(20);

            calculatePosition(0.5);
            expect(handle.position).toBeCloseTo(expectedPosition);
            expect(handle.positionInPixel).toBeCloseTo(expectedPositionInPixel);
        });

        it('axisHandleUpdates event should be triggered when an axis handle is added', () => {
            plot = $.plot(placeholder, [sampleData], {});
            const spy = jasmine.createSpy('handleEvent');
            placeholder.on('axisHandleUpdates', spy);

            plot.addAxisHandle({
                orientation: 'vertical',
                position: 0.8
            });

            jasmine.clock().tick(20);

            expect(spy).toHaveBeenCalledTimes(1);
            const eventParameter = spy.calls.argsFor(0)[1];
            const handles = plot.getAxisHandles();
            expect(eventParameter).toBe(handles);
        });

        it('axisHandleUpdates event should be triggered when an axis handle is changed', () => {
            plot = $.plot(placeholder, [sampleData], {
                axisHandles: [
                    {
                        orientation: 'vertical',
                        location: 'near',
                        position: 0.5
                    }
                ]
            });

            jasmine.clock().tick(20);

            const handle = plot.getAxisHandles()[0];
            const spy = jasmine.createSpy('handleEvent');
            placeholder.on('axisHandleUpdates', spy);
            plot.setAxisHandle(handle, {
                position: 0.8
            });

            jasmine.clock().tick(20);

            expect(spy).toHaveBeenCalledTimes(1);
            const eventParameter = spy.calls.argsFor(0)[1];
            const handles = plot.getAxisHandles();
            expect(eventParameter).toBe(handles);
        });

        it('axisHandleUpdates event should be triggered when an axis handle is removed', () => {
            plot = $.plot(placeholder, [sampleData], {
                axisHandles: [
                    {
                        orientation: 'vertical',
                        location: 'near',
                        position: 0.5
                    },
                    {
                        orientation: 'horizontal',
                        location: 'far',
                        position: 0.8
                    }
                ]
            });

            jasmine.clock().tick(20);

            const handle = plot.getAxisHandles()[0];
            const spy = jasmine.createSpy('handleEvent');
            placeholder.on('axisHandleUpdates', spy);
            plot.removeAxisHandle(handle);

            jasmine.clock().tick(20);

            expect(spy).toHaveBeenCalledTimes(1);
            const eventParameter = spy.calls.argsFor(0)[1];
            const handles = plot.getAxisHandles();
            expect(eventParameter).toBe(handles);
        });

        it('should ignore the changes of private properties', () => {
            plot = $.plot(placeholder, [sampleData], {
                axisHandles: [
                    {
                        name: 'test-handle'
                    }
                ]
            });

            const handle = plot.getAxisHandles()[0];
            plot.setAxisHandle(handle, {
                positionInPixel: 1000,
                selected: true,
                thumbmove: true,
                thumb: 'test'
            });

            expect(handle.positionInPixel).not.toBe(1000);
            expect(handle.selected).not.toBe(true);
            expect(handle.thumbmove).not.toBe(true);
            expect(handle.thumbmove).not.toBe('test');
        });

        it('should not throw exception when the label is an empty string', () => {
            plot = $.plot(placeholder, [sampleData], {
                axisHandles: [
                    {
                        handleLabel: ''
                    }
                ]
            });

            jasmine.clock().tick(20);

            const handle = plot.getAxisHandles()[0];
            expect(handle.handleLabel).toBe('');
        });

        it('should be possible to specify the thumb constrain', () => {
            plot = $.plot(placeholder, [sampleData], {
                axisHandles: [
                    {
                        orientation: 'horizontal',
                        location: 'far',
                        position: 0.5
                    },
                    {
                        orientation: 'vertical',
                        location: 'far',
                        position: 0.5
                    }
                ]
            });

            const horizontalHandle = plot.getAxisHandles()[0];
            const verticalHandle = plot.getAxisHandles()[1];
            horizontalHandle.horizontalHandleConstrain = (mouseX, mouseY, previousX, previousY) => {
                // thumb can not be moved
                return [previousX, previousY];
            };
            verticalHandle.verticalHandleConstrain = (mouseX, mouseY, previousX, previousY) => {
                const offset = plot.offset(),
                    y = Math.max(offset.top, Math.min(mouseY, plot.height() + offset.top + 2));
                return [previousX, y];
            };

            jasmine.clock().tick(20);

            const svgRoot = placeholder.find('.flot-thumbs')[0].firstChild;
            const horizontalThumbShouldNotMove = () => {
                const mouseX = plot.offset().left + plot.width() * 0.5;
                const mouseY = plot.offset().top;
                const horizontalThumb = horizontalHandle.thumb;
                const originalThumbPosition = horizontalThumb.getCTM().e;

                simulate.sendTouchEvents([{ x: mouseX, y: mouseY }], horizontalThumb, 'touchstart');
                simulate.sendTouchEvents([{ x: mouseX + 100, y: mouseY }], svgRoot, 'touchmove');

                expect(horizontalThumb.getCTM().e).toBe(originalThumbPosition);
            };
            const verticalThumbShouldMoveToExpectedPosition = () => {
                const verticalThumb = verticalHandle.thumb;
                const mouseX = plot.offset().left + plot.width();
                const mouseY = plot.offset().top + plot.height() * 0.5;

                simulate.sendTouchEvents([{ x: mouseX, y: mouseY }], verticalThumb, 'touchstart');
                simulate.sendTouchEvents([{ x: mouseX, y: mouseY + plot.height() * 0.5 + 20 }], svgRoot, 'touchmove');

                const expectPosition = plot.getPlotOffset().top + plot.height() + 2;
                expect(verticalThumb.getCTM().f).toBe(expectPosition);
            };

            horizontalThumbShouldNotMove();
            verticalThumbShouldMoveToExpectedPosition();
        });
    });

    describe('axis handle (thumb)', () => {
        it('should create a thumb when the show property is true', () => {
            plot = $.plot(placeholder, [sampleData], {
                axisHandles: [
                    {
                        orientation: 'vertical',
                        location: 'far',
                        show: true
                    }
                ]
            });

            jasmine.clock().tick(20);

            expect(plot.getAxisHandles()[0].thumb).toBeDefined();
        });

        it('should not create a thumb when the show property is false', () => {
            plot = $.plot(placeholder, [sampleData], {
                axisHandles: [
                    {
                        orientation: 'vertical',
                        location: 'far',
                        show: false
                    }
                ]
            });

            jasmine.clock().tick(20);

            expect(plot.getAxisHandles()[0].thumb).not.toBeDefined();
        });

        it('should add extra space for thumbs', () => {
            const fixtures = setFixtures('<div id="test-container" style="width: 600px;height: 400px"/>' +
                '<div id="test-container2" style="width: 600px;height: 400px"/>');
            const placeholder1 = fixtures.find('#test-container');
            const placeholder2 = fixtures.find('#test-container2');
            const minimumSpace = 20;
            plot = $.plot(placeholder1, [sampleData], {});
            let plotWithAxisHandles = $.plot(placeholder2, [sampleData], {
                cursors: [
                    {
                        showThumbs: 'rt',
                        position: { relativeX: 0.5, relativeY: 0.6 }
                    }
                ],
                axisHandles: [
                    { orientation: 'vertical', location: 'far' },
                    { orientation: 'vertical', location: 'far', position: 0.2 },
                    { orientation: 'vertical', location: 'near' },
                    { orientation: 'vertical', location: 'near', position: 0.8 },
                    { orientation: 'horizontal', location: 'far' },
                    { orientation: 'horizontal', location: 'far', position: 0.4 },
                    { orientation: 'horizontal', location: 'near' },
                    { orientation: 'horizontal', location: 'near', position: 0.6 }
                ]
            });

            jasmine.clock().tick(20);

            const plotOffset = plot.getPlotOffset();
            const plotOffsetWithThumbs = plotWithAxisHandles.getPlotOffset();

            expect(plotOffsetWithThumbs.left).toEqual(plotOffset.left);
            expect(plotOffsetWithThumbs.bottom).toEqual(plotOffset.bottom);
            expect(plotOffsetWithThumbs.right).toBeGreaterThanOrEqual(plotOffset.right + minimumSpace);
            // we should avoid the repeated reserving space for a cursor thumb and an axis handle at the side.
            expect(plotOffsetWithThumbs.right).toBeLessThan(plotOffset.right + minimumSpace * 2);
            expect(plotOffsetWithThumbs.top).toBeGreaterThanOrEqual(plotOffset.top + minimumSpace);
            expect(plotOffsetWithThumbs.top).toBeLessThan(plotOffset.top + minimumSpace * 2);

            plotWithAxisHandles.shutdown();
            plotWithAxisHandles = null;
        });

        it('should re-locate the thumbs to plot edge when plot resize', () => {
            const oldPlaceHolderHeight = placeholder.css('height');
            const oldPlaceHolderWidth = placeholder.css('width');
            placeholder.css('height', '80%');
            placeholder.css('width', '80%');

            plot = $.plot(placeholder, [sampleData], {
                axisHandles: [
                    { orientation: 'vertical', location: 'far' }, // handle at plot right edge
                    { orientation: 'horizontal', location: 'near' }, // handle at plot bottom edge
                    { orientation: 'horizontal', location: 'near', show: false } // hidden handle should not cause error
                ]
            });

            jasmine.clock().tick(20);

            placeholder.css('height', oldPlaceHolderHeight);
            placeholder.css('width', oldPlaceHolderWidth);
            plot.resize();
            plot.setupGrid(true);
            plot.draw();

            jasmine.clock().tick(20);

            const plotOffset = plot.getPlotOffset();
            const rightEdgeHandle = plot.getAxisHandles()[0];
            const bottomEdgeHandle = plot.getAxisHandles()[1];
            const expectedRightEdgeHandleXPosition = plotOffset.left + plot.width() + rightEdgeHandle.radius;
            const expectedBottomEdgeHandleYPosition = plotOffset.top + plot.height() + bottomEdgeHandle.radius;

            expect(rightEdgeHandle.thumb.getCTM().e).toBe(expectedRightEdgeHandleXPosition);
            expect(bottomEdgeHandle.thumb.getCTM().f).toBe(expectedBottomEdgeHandleYPosition);
        });

        it('should select the handle for thumbmovestart event', () => {
            plot = $.plot(placeholder, [sampleData], {
                axisHandles: [ {} ]
            });

            jasmine.clock().tick(20);

            const thumb = document.getElementsByClassName('thumb')[0];
            const initialCoords = [{ x: 0, y: 0 }];
            simulate.sendTouchEvents(initialCoords, thumb, 'touchstart');

            const handle = plot.getAxisHandles()[0];
            expect(handle.selected).toBe(true);
            expect(handle.thumbmove).toBe(true);
        });

        it('should deselect the handle for thumbmoveend event', () => {
            plot = $.plot(placeholder, [sampleData], {
                axisHandles: [ {} ]
            });

            jasmine.clock().tick(20);

            const thumb = document.getElementsByClassName('thumb')[0];
            const initialCoords = [{ x: 0, y: 0 }];
            const svgRoot = $.thumb.createSVGLayer(placeholder);

            simulate.sendTouchEvents(initialCoords, thumb, 'touchstart');

            const handle = plot.getAxisHandles()[0];
            expect(handle.selected).toBe(true);
            expect(handle.thumbmove).toBe(true);

            simulate.sendTouchEvents(initialCoords, svgRoot, 'touchend');
            expect(handle.selected).toBe(false);
            expect(handle.thumbmove).toBe(false);
        });

        it('should not throw any exception when thumbmove event is triggered but no handle is selected', () => {
            plot = $.plot(placeholder, [sampleData], {
                axisHandles: [ {} ]
            });

            jasmine.clock().tick(20);

            const svgRoot = $.thumb.createSVGLayer(placeholder);

            expect(() => svgRoot.eventHolder.dispatchEvent(new CustomEvent('thumbmove'))).not.toThrow();
        });

        it('should not throw any exception when thumbmoveend event is triggered but no handle is selected', () => {
            plot = $.plot(placeholder, [sampleData], {
                axisHandles: [ {} ]
            });

            jasmine.clock().tick(20);

            const svgRoot = $.thumb.createSVGLayer(placeholder);

            expect(() => svgRoot.eventHolder.dispatchEvent(new CustomEvent('thumbmoveend'))).not.toThrow();
        });

        it('should fill thumb icon base on css style of .thumbIcon by default', () => {
            $('<style>.thumbIcon { fill: rgb(100, 100, 100); }</style>').appendTo(placeholder.parent());

            plot = $.plot(placeholder, [sampleData], {
                axisHandles: [ {} ]
            });

            jasmine.clock().tick(20);

            var thumbIcon = plot.getAxisHandles()[0].thumb.childNodes[0];
            expect(getComputedStyle(thumbIcon).fill).toBe('rgb(100, 100, 100)');
        });

        it('should fill thumb icon with truthy fill from options', () => {
            plot = $.plot(placeholder, [sampleData], {
                axisHandles: [ { fill: 'rgb(0, 255, 0)' } ]
            });

            jasmine.clock().tick(20);

            var axishandle = plot.getAxisHandles()[0];
            var thumbIcon = axishandle.thumb.childNodes[0];
            expect(getComputedStyle(thumbIcon).fill).toBe('rgb(0, 255, 0)');

            plot.setAxisHandle(axishandle, { fill: 'rgb(255, 0, 255)' });

            jasmine.clock().tick(20);

            thumbIcon = axishandle.thumb.childNodes[0];
            expect(getComputedStyle(thumbIcon).fill).toBe('rgb(255, 0, 255)');
        });
    });

    describe('thumbOutOfRange event', () => {
        [
            { orientation: 'horizontal', location: 'far', edge: 'topleft' },
            { orientation: 'horizontal', location: 'far', edge: 'topright' },
            { orientation: 'horizontal', location: 'near', edge: 'bottomleft' },
            { orientation: 'horizontal', location: 'near', edge: 'bottomright' },
            { orientation: 'vertical', location: 'far', edge: 'topright' },
            { orientation: 'vertical', location: 'far', edge: 'bottomright' },
            { orientation: 'vertical', location: 'near', edge: 'topleft' },
            { orientation: 'vertical', location: 'near', edge: 'bottomleft' }
        ].forEach((data) => {
            it(`should be fired exactly when moving a ${data.orientation} ${data.location} handle off the graph at ${data.edge} side`, () => {
                plot = $.plot(placeholder, [sampleData], {
                    axisHandles: [
                        { orientation: data.orientation, location: data.location, position: 0.5 }
                    ]
                });

                plot.setAxisHandlePlotPositionConstrain((mouseX, mouseY) => {
                    const offset = plot.offset();
                    // expand 1 pixel at all directions
                    return [
                        Math.max(-1, Math.min(mouseX - offset.left, plot.width() + 1)),
                        Math.max(-1, Math.min(mouseY - offset.top, plot.height() + 1))
                    ];
                });

                jasmine.clock().tick(20);

                const spy = jasmine.createSpy('thumbOutOfRange');
                plot.getEventHolder().addEventListener('thumbOutOfRange', spy);

                const getDelta = () => {
                    if (data.orientation === 'horizontal' && data.edge.includes('left')) {
                        return { x: plot.width() * 0.5 + 5, y: 0 }
                    } else if (data.orientation === 'horizontal' && data.edge.includes('right')) {
                        return { x: -(plot.width() * 0.5 + 5), y: 0 };
                    } else if (data.orientation === 'vertical' && data.edge.includes('top')) {
                        return { x: 0, y: plot.height() + 5 };
                    } else if (data.orientation === 'vertical' && data.edge.includes('bottom')) {
                        return { x: 0, y: -(plot.height() + 5) };
                    }
                };
                const delta = getDelta();
                plot.pan({ left: delta.x, top: delta.y });

                jasmine.clock().tick(20);

                expect(spy).toHaveBeenCalledTimes(1);
                const eventObject = spy.calls.argsFor(0)[0];
                const handle = plot.getAxisHandles()[0];
                expect(eventObject.detail.orientation).toBe(data.orientation);
                expect(eventObject.detail.edge).toBe(data.edge);
                expect(eventObject.detail.target).toBe(handle.thumb);
            });
        });
    });

    describe('thumbIntoRange event', () => {
        [
            { orientation: 'horizontal', location: 'far', edge: 'topleft' },
            { orientation: 'horizontal', location: 'far', edge: 'topright' },
            { orientation: 'horizontal', location: 'near', edge: 'bottomleft' },
            { orientation: 'horizontal', location: 'near', edge: 'bottomright' },
            { orientation: 'vertical', location: 'far', edge: 'topright' },
            { orientation: 'vertical', location: 'far', edge: 'bottomright' },
            { orientation: 'vertical', location: 'near', edge: 'topleft' },
            { orientation: 'vertical', location: 'near', edge: 'bottomleft' }
        ].forEach((data) => {
            it(`should be fired exactly when moving a ${data.orientation} ${data.location} handle into the graph from ${data.edge} side`, () => {
                const getInitialPosition = () => {
                    if (data.orientation === 'horizontal' && data.edge.includes('left')) {
                        return -0.05;
                    } else if (data.orientation === 'horizontal' && data.edge.includes('right')) {
                        return 1.05;
                    } else if (data.orientation === 'vertical' && data.edge.includes('top')) {
                        return -0.05;
                    } else if (data.orientation === 'vertical' && data.edge.includes('bottom')) {
                        return 1.05;
                    }
                };
                plot = $.plot(placeholder, [sampleData], {
                    axisHandles: [
                        {
                            orientation: data.orientation,
                            location: data.location,
                            position: getInitialPosition()
                        }
                    ]
                });

                jasmine.clock().tick(20);

                const spy = jasmine.createSpy('thumbIntoRange');
                plot.getEventHolder().addEventListener('thumbIntoRange', spy);

                const getDelta = () => {
                    if (data.orientation === 'horizontal' && data.edge.includes('left')) {
                        return { x: -100, y: 0 }
                    } else if (data.orientation === 'horizontal' && data.edge.includes('right')) {
                        return { x: 100, y: 0 };
                    } else if (data.orientation === 'vertical' && data.edge.includes('top')) {
                        return { x: 0, y: -100 };
                    } else if (data.orientation === 'vertical' && data.edge.includes('bottom')) {
                        return { x: 0, y: 100 };
                    }
                };
                const delta = getDelta();
                plot.pan({ left: delta.x, top: delta.y });

                jasmine.clock().tick(20);

                expect(spy).toHaveBeenCalledTimes(1);
                const eventObject = spy.calls.argsFor(0)[0];
                const handle = plot.getAxisHandles()[0];
                expect(eventObject.detail.orientation).toBe(data.orientation);
                expect(eventObject.detail.edge).toBe(data.edge);
                expect(eventObject.detail.target).toBe(handle.thumb);
            });
        });
    });

    describe('thumbCreated, thumbWillBeRemoved, thumbVisibilityChanged', () => {
        function verifyEventFired(spy, thumb, visible) {
            expect(spy).toHaveBeenCalledTimes(1);
            const eventObject = spy.calls.argsFor(0)[0];
            expect(eventObject.detail.current).toBe(thumb);
            if (visible !== undefined) {
                expect(eventObject.detail.visible).toBe(visible);
            }
        }

        it('thumbCreated event should be fired when creating the plot with an axis handle', () => {
            plot = $.plot(placeholder, [sampleData], {
                axisHandles: [
                    {
                        orientation: 'vertical',
                        location: 'far',
                        position: 0.5
                    }
                ]
            });

            const spy = jasmine.createSpy('onThumbCreated');
            plot.getPlaceholder()[0].addEventListener('thumbCreated', spy);

            jasmine.clock().tick(20);

            const handle = plot.getAxisHandles()[0];
            verifyEventFired(spy, handle.thumb);
        });

        it('thumbCreated event should be fired when adding an axis handle at runtime', () => {
            plot = $.plot(placeholder, [sampleData], {
                axisHandles: []
            });

            plot.addAxisHandle({
                orientation: 'horizontal',
                location: 'near',
                position: 0.8
            });

            const spy = jasmine.createSpy('onThumbCreated');
            plot.getPlaceholder()[0].addEventListener('thumbCreated', spy);

            jasmine.clock().tick(20);

            const handle = plot.getAxisHandles()[0];
            verifyEventFired(spy, handle.thumb);
        });

        it('thumbWillBeRemoved event should be fired when an axis handle will be removed', () => {
            plot = $.plot(placeholder, [sampleData], {
                axisHandles: [
                    {
                        orientation: 'vertical',
                        location: 'near',
                        position: 0.4
                    }
                ]
            });

            jasmine.clock().tick(20);

            const spy = jasmine.createSpy('onThumbWillBeRemoved');
            plot.getPlaceholder()[0].addEventListener('thumbWillBeRemoved', spy);
            const handle = plot.getAxisHandles()[0];
            const thumbToRemove = handle.thumb;
            plot.removeAxisHandle(handle);

            verifyEventFired(spy, thumbToRemove);
        });

        it('thumbVisibilityChanged event should be fired and the thumb should be at the correct position', () => {
            plot = $.plot(placeholder, [sampleData], {
                axisHandles: [
                    {
                        orientation: 'horizontal',
                        location: 'far',
                        position: 0.4
                    }
                ]
            });

            jasmine.clock().tick(20);

            const handle = plot.getAxisHandles()[0];
            const spy = jasmine.createSpy('onThumbVisibilityChanged');
            plot.getPlaceholder()[0].addEventListener('thumbVisibilityChanged', spy);
            plot.setAxisHandle(handle, { show: false });

            jasmine.clock().tick(20);
            verifyEventFired(spy, handle.thumb, false);
            const plotOffset = plot.getPlotOffset();
            let expectedX = plotOffset.left + plot.width() * 0.4;
            const expectedY = plotOffset.top - handle.radius;
            let matrix = handle.thumb.getCTM();
            expect(matrix.e).toBeCloseTo(expectedX);
            expect(matrix.f).toBeCloseTo(expectedY);

            spy.calls.reset();

            plot.pan({left: -200, top: 0});
            plot.setAxisHandle(handle, { show: true });

            jasmine.clock().tick(20);
            verifyEventFired(spy, handle.thumb, true);
            expectedX = plot.getXAxes()[handle.axisIndex].p2c(handle.absolutePosition) + plotOffset.left;
            matrix = handle.thumb.getCTM();
            expect(matrix.e).toBeCloseTo(expectedX);
            expect(matrix.f).toBeCloseTo(expectedY);
        });

        it('thumbCreated and thumbWillBeRemoved event should be fired when positioning the handle', () => {
            plot = $.plot(placeholder, [sampleData], {
                axisHandles: [
                    {
                        orientation: 'vertical',
                        location: 'near'
                    }
                ]
            });

            jasmine.clock().tick(20);

            const handle = plot.getAxisHandles()[0];
            const onThumbWillBeRemoved = jasmine.createSpy('onThumbWillBeRemoved');
            plot.getPlaceholder()[0].addEventListener('thumbWillBeRemoved', onThumbWillBeRemoved);
            const onThumbCreated = jasmine.createSpy('onThumbCreated');
            plot.getPlaceholder()[0].addEventListener('thumbCreated', onThumbCreated);

            plot.setAxisHandle(handle, { orientation: 'horizontal' });
            expect(onThumbWillBeRemoved).toHaveBeenCalledTimes(1);
            jasmine.clock().tick(20);
            expect(onThumbCreated).toHaveBeenCalledTimes(1);

            onThumbCreated.calls.reset();
            onThumbWillBeRemoved.calls.reset();

            plot.setAxisHandle(handle, { location: 'far' });
            expect(onThumbWillBeRemoved).toHaveBeenCalledTimes(1);
            jasmine.clock().tick(20);
            expect(onThumbCreated).toHaveBeenCalledTimes(1);
        });
    });
});

describe('Axis handle interaction', () => {
    'use strict';

    const sampleData = [[0, 1], [1, 1.1], [2, 1.2]];
    let plot;
    let placeholder;
    let simulate;

    beforeAll(() => {
        simulate = window.simulate;
    });

    afterAll(() => {
        simulate = null;
    });

    beforeEach(function () {
        const fixture = setFixtures('<div id="demo-container" style="width: 800px;height: 600px">').find('#demo-container').get(0);
        placeholder = $('<div id="placeholder" style="width: 100%;height: 100%">');
        placeholder.appendTo(fixture);
    });

    afterEach(function () {
        plot.shutdown();
        plot = null;
        $('#placeholder').empty();
        placeholder = null;
    });

    it('should change the y-axis offset on thumbmove event', async() => {
        plot = $.plot(placeholder, [sampleData], {
            axisHandles: [
                {
                    orientation: 'vertical',
                    location: 'far',
                    position: 0.5
                }
            ]
        });

        const handle = plot.getAxisHandles()[0];
        await waitUntilAsync('thumb should be created', () => handle.thumb, 1000);
        const absolutePosition = handle.absolutePosition;

        const thumbX = plot.offset().left + plot.width();
        const thumbY = plot.offset().top + plot.height() * 0.5;
        const svgRoot = $.thumb.createSVGLayer(placeholder);
        const thumb = document.getElementsByClassName('thumb')[0];
        const initialCoords = [{ x: thumbX, y: thumbY }];
        const finalCoords = [{ x: thumbX, y: thumbY + 100 }];

        simulate.sendTouchEvents(initialCoords, thumb, 'touchstart');
        simulate.sendTouchEvents(finalCoords, svgRoot, 'touchmove');

        await waitUntilAsync('relative position should update', () => handle.position > 0.5, 1000);
        expect(handle.absolutePosition).toBe(absolutePosition);
        const yAxis = plot.getYAxes()[0];
        expect(yAxis.options.offset.below).toBeGreaterThan(0);
        expect(yAxis.options.offset.above).toBeGreaterThan(0);
    });

    it('should change the x-axis offset on thumbmove event', async() => {
        plot = $.plot(placeholder, [sampleData], {
            axisHandles: [
                {
                    orientation: 'horizontal',
                    location: 'near',
                    position: 0.5
                }
            ]
        });

        const handle = plot.getAxisHandles()[0];
        await waitUntilAsync('thumb should be created', () => handle.thumb, 1000);
        const absolutePosition = handle.absolutePosition;

        const thumbX = plot.offset().left + plot.width() * 0.5;
        const thumbY = plot.offset().top + plot.height();
        const svgRoot = $.thumb.createSVGLayer(placeholder);
        const thumb = document.getElementsByClassName('thumb')[0];
        const initialCoords = [{ x: thumbX, y: thumbY }];
        const finalCoords = [{ x: thumbX + 100, y: thumbY }];

        simulate.sendTouchEvents(initialCoords, thumb, 'touchstart');
        simulate.sendTouchEvents(finalCoords, svgRoot, 'touchmove');

        await waitUntilAsync('relative position should update', () => handle.position > 0.5, 1000);
        expect(handle.absolutePosition).toBe(absolutePosition);
        const xAxis = plot.getXAxes()[0];
        expect(xAxis.options.offset.below).toBeLessThan(0);
        expect(xAxis.options.offset.above).toBeLessThan(0);
    });
});
