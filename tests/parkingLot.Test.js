'use strict';

describe('Parking Lot', () => {
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

    it('should not be created without parkingLot in plot options', () => {
        plot = $.plot(placeholder, [sampleData], {});
        expect(plot.getParkingLot()).toBeUndefined();
    });

    describe('interaction', () => {
        [
            { mode: 'Horizontal', thumbLocation: 't', edge: 'topLeft' },
            { mode: 'Horizontal', thumbLocation: 't', edge: 'topRight' },
            { mode: 'Horizontal', thumbLocation: 'b', edge: 'bottomLeft' },
            { mode: 'Horizontal', thumbLocation: 'b', edge: 'bottomRight' },
            { mode: 'Vertical', thumbLocation: 'l', edge: 'topLeft' },
            { mode: 'Vertical', thumbLocation: 'l', edge: 'bottomLeft' },
            { mode: 'Vertical', thumbLocation: 'r', edge: 'topRight' },
            { mode: 'Vertical', thumbLocation: 'r', edge: 'bottomRight' }
        ].forEach((data) => {
            it(`a thumb should be moved into the ${data.edge} ${data.mode} docker by panning the graph`, () => {
                plot = $.plot(placeholder, [sampleData], {
                    cursors: [
                        {
                            color: 'blue',
                            position: data.mode === 'Horizontal' ? { relativeX: 0.5 } : { relativeY: 0.5 },
                            mode: data.mode === 'Horizontal' ? 'x' : 'y',
                            showThumbs: data.thumbLocation
                        }
                    ],
                    parkingLot: {}
                });

                jasmine.clock().tick(20);

                const getDelta = () => {
                    const edge = data.edge.toLowerCase();
                    if (data.mode === 'Horizontal' && edge.includes('left')) {
                        return { x: -(plot.width() * 0.5 + 5), y: 0 }
                    } else if (data.mode === 'Horizontal' && edge.includes('right')) {
                        return { x: plot.width() * 0.5 + 5, y: 0 };
                    } else if (data.mode === 'Vertical' && edge.includes('top')) {
                        return { x: 0, y: -(plot.height() + 5) };
                    } else if (data.mode === 'Vertical' && edge.includes('bottom')) {
                        return { x: 0, y: plot.height() + 5 };
                    }
                };
                const delta = getDelta();
                plot.pan({ left: -delta.x, top: -delta.y });

                jasmine.clock().tick(20);

                const thumb = plot.getCursors()[0].thumbs[0];
                const parkingLot = plot.getParkingLot();
                expect(parkingLot[`${data.edge}${data.mode}Docker`].has(thumb)).toBeTruthy();
            });
        });

        [
            { mode: 'Horizontal', thumbLocation: 't', edge: 'topLeft' },
            { mode: 'Horizontal', thumbLocation: 't', edge: 'topRight' },
            { mode: 'Horizontal', thumbLocation: 'b', edge: 'bottomLeft' },
            { mode: 'Horizontal', thumbLocation: 'b', edge: 'bottomRight' },
            { mode: 'Vertical', thumbLocation: 'l', edge: 'topLeft' },
            { mode: 'Vertical', thumbLocation: 'l', edge: 'bottomLeft' },
            { mode: 'Vertical', thumbLocation: 'r', edge: 'topRight' },
            { mode: 'Vertical', thumbLocation: 'r', edge: 'bottomRight' }
        ].forEach((data) => {
            it(`a thumb should be moved into the ${data.edge} ${data.mode} docker by dragging the thumb`, () => {
                plot = $.plot(placeholder, [sampleData], {
                    cursors: [
                        {
                            color: 'blue',
                            position: data.mode === 'Horizontal' ? { relativeX: 0.5 } : { relativeY: 0.5 },
                            mode: data.mode === 'Horizontal' ? 'x' : 'y',
                            showThumbs: data.thumbLocation
                        }
                    ],
                    parkingLot: {}
                });

                jasmine.clock().tick(20);

                const getDelta = () => {
                    const edge = data.edge.toLowerCase();
                    if (data.mode === 'Horizontal' && edge.includes('left')) {
                        return { x: -(plot.width() * 0.5 + 5), y: 0 }
                    } else if (data.mode === 'Horizontal' && edge.includes('right')) {
                        return { x: plot.width() * 0.5 + 5, y: 0 };
                    } else if (data.mode === 'Vertical' && edge.includes('top')) {
                        return { x: 0, y: -(plot.height() * 0.5 + 5) };
                    } else if (data.mode === 'Vertical' && edge.includes('bottom')) {
                        return { x: 0, y: plot.height() * 0.5 + 5 };
                    }
                };
                const delta = getDelta();

                const getCursorXY = () => {
                    const offset = plot.offset();
                    switch (data.thumbLocation) {
                        case 't':
                            return { x: offset.left + plot.width() * 0.5, y: offset.top };
                        case 'l':
                            return { x: offset.left, y: offset.top + plot.height() * 0.5 };
                        case 'b':
                            return { x: offset.left + plot.width() * 0.5, y: offset.top + plot.height() };
                        case 'r':
                            return { x: offset.left + plot.width(), y: offset.top + plot.height() * 0.5 };
                    }
                };
                const cursorXY = getCursorXY();

                const svgRoot = placeholder.find('.flot-thumbs')[0].firstChild;
                const thumb = plot.getCursors()[0].thumbs[0];
                simulate.sendTouchEvents([cursorXY], thumb, 'touchstart');
                simulate.sendTouchEvents([{ x: cursorXY.x + delta.x, y: cursorXY.y + delta.y }], svgRoot, 'touchmove');
                // the existence of the thumb in the parking lot depends on the thumb's position and the thumb's position is updated after mouse/touch movement.
                // the first touch move updates the position and the following touch move makes the thumb into the parking lot.
                simulate.sendTouchEvents([{ x: cursorXY.x + delta.x, y: cursorXY.y + delta.y }], svgRoot, 'touchmove');

                jasmine.clock().tick(20);

                const parkingLot = plot.getParkingLot();
                expect(parkingLot[`${data.edge}${data.mode}Docker`].has(thumb)).toBeTruthy();
            });
        });

        [
            { thumbLocation: 't', relativePosition: -0.05, expectedDocker: 'topLeftHorizontalDocker' },
            { thumbLocation: 't', relativePosition: 1.05, expectedDocker: 'topRightHorizontalDocker' },
            { thumbLocation: 'b', relativePosition: -0.05, expectedDocker: 'bottomLeftHorizontalDocker' },
            { thumbLocation: 'b', relativePosition: 1.05, expectedDocker: 'bottomRightHorizontalDocker' },
            { thumbLocation: 'l', relativePosition: -0.05, expectedDocker: 'topLeftVerticalDocker' },
            { thumbLocation: 'l', relativePosition: 1.05, expectedDocker: 'bottomLeftVerticalDocker' },
            { thumbLocation: 'r', relativePosition: -0.05, expectedDocker: 'topRightVerticalDocker' },
            { thumbLocation: 'r', relativePosition: 1.05, expectedDocker: 'bottomRightVerticalDocker' }
        ].forEach((data) => {
            it(`a cursor thumb should be moved into the range from the ${data.expectedDocker} by panning the graph`, () => {
                plot = $.plot(placeholder, [sampleData], {
                    cursors: [
                        {
                            position: data.thumbLocation.search(/[tb]/) !== -1 ? { relativeX: data.relativePosition } : { relativeY: data.relativePosition },
                            mode: data.thumbLocation.search(/[tb]/) !== -1 ? 'x' : 'y',
                            showThumbs: data.thumbLocation
                        }
                    ],
                    parkingLot: {}
                });

                jasmine.clock().tick(20);

                const parkingLot = plot.getParkingLot();
                const thumb = plot.getCursors()[0].thumbs[0];
                expect(parkingLot[`${data.expectedDocker}`].has(thumb)).toBeTruthy();

                const getDelta = () => {
                    let x, y;
                    if (data.thumbLocation.search(/[tb]/) !== -1) {
                        x = plot.width() * (data.relativePosition < 0 ? 0.5 : -0.5);
                        y = 0;
                    } else {
                        x = 0;
                        y = plot.height() * (data.relativePosition < 0 ? 0.5 : -0.5);
                    }
                    return { x, y };
                };
                const delta = getDelta();
                plot.pan({ left: -delta.x, top: -delta.y });
                jasmine.clock().tick(20);

                expect(parkingLot[`${data.expectedDocker}`].size).toBe(0);
            });
        });

        const getInitialCoordinateAndDelta = (plot, thumbLocation, position) => {
            const offset = plot.offset();
            const plotOffset = plot.getPlotOffset();
            const origin = {
                left: offset.left - plotOffset.left,
                top: offset.top - plotOffset.top
            };
            const coordinates = {
                topLeft: { x: origin.left + 17, y: origin.top + 17 },
                topRight: { x: origin.left + plotOffset.left + plot.width() + plotOffset.right - 17, y: origin.top + 17 },
                bottomLeft: { x: origin.left + 17, y: origin.top + plotOffset.top + plot.height() + plotOffset.bottom - 17 },
                bottomRight: { x: origin.left + plotOffset.left + plot.width() + plotOffset.right - 17, y: origin.top + plotOffset.top + plot.height() + plotOffset.bottom - 17 }
            };
            if (thumbLocation === 't' && position < 0) {
                return { ...coordinates.topLeft, deltaX: plot.width() * 0.5, deltaY: 0 };
            } else if (thumbLocation === 't' && position > 1) {
                return { ...coordinates.topRight, deltaX: plot.width() * -0.5, deltaY: 0 };
            } else if (thumbLocation === 'b' && position < 0) {
                return { ...coordinates.bottomLeft, deltaX: plot.width() * 0.5, deltaY: 0 };
            } else if (thumbLocation === 'b' && position > 1) {
                return { ...coordinates.bottomRight, deltaX: plot.width() * -0.5, deltaY: 0 };
            } else if (thumbLocation === 'l' && position < 0) {
                return { ...coordinates.topLeft, deltaX: 0, deltaY: plot.height() * 0.5 };
            } else if (thumbLocation === 'l' && position > 1) {
                return { ...coordinates.bottomLeft, deltaX: 0, deltaY: plot.height() * -0.5 };
            } else if (thumbLocation === 'r' && position < 0) {
                return { ...coordinates.topRight, deltaX: 0, deltaY: plot.height() * 0.5 };
            } else if (thumbLocation === 'r' && position > 1) {
                return { ...coordinates.bottomRight, deltaX: 0, deltaY: plot.height() * -0.5 };
            }
        };

        [
            { thumbLocation: 't', relativePosition: -0.05, expectedDocker: 'topLeftHorizontalDocker' },
            { thumbLocation: 't', relativePosition: 1.05, expectedDocker: 'topRightHorizontalDocker' },
            { thumbLocation: 'b', relativePosition: -0.05, expectedDocker: 'bottomLeftHorizontalDocker' },
            { thumbLocation: 'b', relativePosition: 1.05, expectedDocker: 'bottomRightHorizontalDocker' },
            { thumbLocation: 'l', relativePosition: -0.05, expectedDocker: 'topLeftVerticalDocker' },
            { thumbLocation: 'l', relativePosition: 1.05, expectedDocker: 'bottomLeftVerticalDocker' },
            { thumbLocation: 'r', relativePosition: -0.05, expectedDocker: 'topRightVerticalDocker' },
            { thumbLocation: 'r', relativePosition: 1.05, expectedDocker: 'bottomRightVerticalDocker' }
        ].forEach((data) => {
            it(`a cursor thumb should be moved into the range from the ${data.expectedDocker} by dragging the thumb`, () => {
                plot = $.plot(placeholder, [sampleData], {
                    cursors: [
                        {
                            position: data.thumbLocation.search(/[tb]/) !== -1 ? { relativeX: data.relativePosition } : { relativeY: data.relativePosition },
                            mode: data.thumbLocation.search(/[tb]/) !== -1 ? 'x' : 'y',
                            showThumbs: data.thumbLocation
                        }
                    ],
                    parkingLot: {}
                });

                jasmine.clock().tick(20);

                const parkingLot = plot.getParkingLot();
                const thumb = plot.getCursors()[0].thumbs[0];
                expect(parkingLot[`${data.expectedDocker}`].has(thumb)).toBeTruthy();

                const coordinatesAndDelta = getInitialCoordinateAndDelta(plot, data.thumbLocation, data.relativePosition);
                const svgRoot = placeholder.find('.flot-thumbs')[0].firstChild;
                simulate.sendTouchEvents([{ x: coordinatesAndDelta.x, y: coordinatesAndDelta.y }], thumb, 'touchstart');
                simulate.sendTouchEvents([{ x: coordinatesAndDelta.x + coordinatesAndDelta.deltaX, y: coordinatesAndDelta.y + coordinatesAndDelta.deltaY }], svgRoot, 'touchmove');

                expect(parkingLot[`${data.expectedDocker}`].size).toBe(0);
            });
        });

        function getElementCenter(element) {
            var rect = element.getBoundingClientRect();
            return {
                x: (rect.left + rect.right) / 2,
                y: (rect.top + rect.bottom) / 2
            };
        }

        function validateThumbAlignToCursor(plot, thumb, thumbLocation, cursor) {
            switch (thumbLocation) {
                case 't':
                case 'b':
                    expect(getElementCenter(thumb).x - (cursor.x + plot.offset().left)).toBeLessThan(2);
                    break;
                case 'l':
                case 'r':
                    expect(getElementCenter(thumb).y - (cursor.y + plot.offset().top)).toBeLessThan(2);
                    break;
            }
        }

        function getGraphRange(plot) {
            return {
                left: plot.offset().left,
                right: plot.offset().left + plot.width(),
                top: plot.offset().top,
                bottom: plot.offset().top + plot.height()
            };
        }

        [
            { thumbLocationWord: 'top', edge: 'right', thumbLocation: 't' },
            { thumbLocationWord: 'top', edge: 'left', thumbLocation: 't' },
            { thumbLocationWord: 'bottom', edge: 'right', thumbLocation: 'b' },
            { thumbLocationWord: 'bottom', edge: 'left', thumbLocation: 'b' },
            { thumbLocationWord: 'left', edge: 'top', thumbLocation: 'l' },
            { thumbLocationWord: 'left', edge: 'bottom', thumbLocation: 'l' },
            { thumbLocationWord: 'right', edge: 'top', thumbLocation: 'r' },
            { thumbLocationWord: 'right', edge: 'bottom', thumbLocation: 'r' }
        ].forEach((parameter) => {
            it(`should keep cursor thumb aligned with cursor line when the cursor thumb on ${parameter.thumbLocationWord} is moved into the graph range from ${parameter.edge}`, () => {
                plot = $.plot("#placeholder", [sampleData], {
                    cursors: [
                        {
                            showThumbs: parameter.thumbLocation,
                            position: {
                                relativeX: parameter.edge === 'right' ? 1.05 : -0.05,
                                relativeY: parameter.edge === 'bottom' ? 1.05 : -0.05
                            }
                        }
                    ],
                    parkingLot: {
                    }
                });
                jasmine.clock().tick(20);

                var cursor = plot.getCursors()[0],
                    thumb = cursor.thumbs[0],
                    graphRange = getGraphRange(plot),
                    delta = { x: 0, y: 0 },
                    criticalDelta = { x: 0, y: 0 }, // The drag delta that almost but not drag the thumb into the range
                    secondDelta = { x: 0, y: 0 }, // Continue draging after the thumb gets into the range
                    thumbInitCenter = getElementCenter(thumb);

                switch (parameter.edge) {
                    case 'right':
                        delta.x = graphRange.right - thumbInitCenter.x;
                        criticalDelta.x = delta.x + 1;
                        secondDelta.x = -5;
                        break;
                    case 'left':
                        delta.x = graphRange.left + 1/* left edge has 1px righter for thumb moving in */ - thumbInitCenter.x;
                        criticalDelta.x = delta.x - 1;
                        secondDelta.x = 5;
                        break;
                    case 'bottom':
                        delta.y = graphRange.bottom - thumbInitCenter.y;
                        criticalDelta.y = delta.y + 1;
                        secondDelta.y = -5;
                        break;
                    case 'top':
                        delta.y = graphRange.top - thumbInitCenter.y;
                        criticalDelta.y = delta.y - 1;
                        secondDelta.y = 5;
                        break;
                }

                function expectThumbInParkingLot() {
                    expect(getElementCenter(thumb).x).toBeCloseTo(thumbInitCenter.x, 0);
                    expect(getElementCenter(thumb).y).toBeCloseTo(thumbInitCenter.y, 0);
                }

                simulate.mouseDown(thumb, 0, 0);

                simulate.mouseMove(thumb, criticalDelta.x, criticalDelta.y);
                jasmine.clock().tick(20);
                expectThumbInParkingLot();

                simulate.mouseMove(thumb, delta.x, delta.y);
                jasmine.clock().tick(20);
                validateThumbAlignToCursor(plot, thumb, parameter.thumbLocation, cursor);

                simulate.mouseMove(thumb, secondDelta.x, secondDelta.y);
                jasmine.clock().tick(20);
                validateThumbAlignToCursor(plot, thumb, parameter.thumbLocation, cursor);

                simulate.mouseUp(thumb, 0, 0);
            });
        });

        [
            { thumbLocationWord: 'top', edge: 'right', thumbLocation: 't', expectedDocker: 'topRightHorizontalDocker' },
            { thumbLocationWord: 'top', edge: 'left', thumbLocation: 't', expectedDocker: 'topLeftHorizontalDocker' },
            { thumbLocationWord: 'bottom', edge: 'right', thumbLocation: 'b', expectedDocker: 'bottomRightHorizontalDocker' },
            { thumbLocationWord: 'bottom', edge: 'left', thumbLocation: 'b', expectedDocker: 'bottomLeftHorizontalDocker' },
            { thumbLocationWord: 'left', edge: 'top', thumbLocation: 'l', expectedDocker: 'topLeftVerticalDocker' },
            { thumbLocationWord: 'left', edge: 'bottom', thumbLocation: 'l', expectedDocker: 'bottomLeftVerticalDocker' },
            { thumbLocationWord: 'right', edge: 'top', thumbLocation: 'r', expectedDocker: 'topRightVerticalDocker' },
            { thumbLocationWord: 'right', edge: 'bottom', thumbLocation: 'r', expectedDocker: 'bottomRightVerticalDocker' }
        ].forEach((parameter) => {
            it(`should keep cursor thumb aligned with cursor line until the center of thumb on ${parameter.thumbLocationWord} is moved out of the graph range cross ${parameter.edge} edge`, () => {
                plot = $.plot("#placeholder", [sampleData], {
                    cursors: [
                        {
                            showThumbs: parameter.thumbLocation,
                            position: { relativeX: 0.5, relativeY: 0.5 }
                        }
                    ],
                    parkingLot: {
                    }
                });
                jasmine.clock().tick(20);

                var cursor = plot.getCursors()[0],
                    thumb = cursor.thumbs[0],
                    parkingLot = plot.getParkingLot(),
                    graphRange = getGraphRange(plot),
                    criticalDelta = { x: 0, y: 0 }, // The drag delta that drag the thumb close to the edge
                    secondDelta = { x: 0, y: 0 }, // The final delta that drag the near-edge thumb out of the range
                    thumbInitCenter = getElementCenter(thumb);

                // Since Firefox's element position is a little different, 1px buffer is used for the critical condition
                switch (parameter.edge) {
                    case 'right':
                        criticalDelta.x = graphRange.right - thumbInitCenter.x - 1;
                        secondDelta.x = 2;
                        break;
                    case 'left':
                        criticalDelta.x = graphRange.left - thumbInitCenter.x + 1;
                        secondDelta.x = -2;
                        break;
                    case 'bottom':
                        criticalDelta.y = graphRange.bottom - thumbInitCenter.y - 1;
                        secondDelta.y = 2;
                        break;
                    case 'top':
                        criticalDelta.y = graphRange.top - thumbInitCenter.y + 1;
                        secondDelta.y = -2;
                        break;
                }

                simulate.mouseDown(thumb, 0, 0);

                simulate.mouseMove(thumb, criticalDelta.x, criticalDelta.y);
                jasmine.clock().tick(20);
                expect(parkingLot[`${parameter.expectedDocker}`].size).toBe(0);
                validateThumbAlignToCursor(plot, thumb, parameter.thumbLocation, cursor);

                simulate.mouseMove(thumb, secondDelta.x, secondDelta.y);
                jasmine.clock().tick(20);
                expect(parkingLot[`${parameter.expectedDocker}`].size).toBe(1);

                simulate.mouseUp(thumb, 0, 0);
            });
        });

        const isFirefox = typeof InstallTrigger !== 'undefined';
        // todo tlan: the following cases fail in Firefox
        const horizontalCases = [
            { orientation: 'horizontal', location: 'far', position: -0.05, expectedDocker: 'topLeftHorizontalDocker' },
            { orientation: 'horizontal', location: 'far', position: 1.05, expectedDocker: 'topRightHorizontalDocker' },
            { orientation: 'horizontal', location: 'near', position: -0.05, expectedDocker: 'bottomLeftHorizontalDocker' },
            { orientation: 'horizontal', location: 'near', position: 1.05, expectedDocker: 'bottomRightHorizontalDocker' }
        ];
        const verticalCases = [
            { orientation: 'vertical', location: 'near', position: -0.05, expectedDocker: 'topLeftVerticalDocker' },
            { orientation: 'vertical', location: 'near', position: 1.05, expectedDocker: 'bottomLeftVerticalDocker' },
            { orientation: 'vertical', location: 'far', position: -0.05, expectedDocker: 'topRightVerticalDocker' },
            { orientation: 'vertical', location: 'far', position: 1.05, expectedDocker: 'bottomRightVerticalDocker' }
        ];
        const all = isFirefox ? [...verticalCases] : [...horizontalCases, ...verticalCases];
        all.forEach((data) => {
            it(`an axis handle thumb should be moved into the range from the ${data.expectedDocker} by dragging the thumb`, () => {
                plot = $.plot(placeholder, [sampleData], {
                    axisHandles: [
                        {
                            position: data.position,
                            orientation: data.orientation,
                            location: data.location
                        }
                    ],
                    parkingLot: {}
                });

                jasmine.clock().tick(20);

                const thumb = plot.getAxisHandles()[0].thumb;
                const parkingLot = plot.getParkingLot();
                expect(parkingLot[`${data.expectedDocker}`].has(thumb)).toBeTruthy();

                const coordinatesAndDelta = getInitialCoordinateAndDelta(plot, thumb.shape.charAt(0), data.position);
                const svgRoot = placeholder.find('.flot-thumbs')[0].firstChild;
                simulate.sendTouchEvents([{ x: coordinatesAndDelta.x, y: coordinatesAndDelta.y }], thumb, 'touchstart');
                simulate.sendTouchEvents([{ x: coordinatesAndDelta.x + coordinatesAndDelta.deltaX, y: coordinatesAndDelta.y + coordinatesAndDelta.deltaY }], svgRoot, 'touchmove');

                expect(parkingLot[`${data.expectedDocker}`].size).toBe(0);
            });
        });

        // todo tlan: the same issue as above. The test passes in Edge and Chrome.
        if (!isFirefox) {
            it('The axis handle should be in the range when dragging its thumb into the graph even if the handle is actually far away from the graph', () => {
                plot = $.plot(placeholder, [sampleData], {
                    yaxes: [
                        { min: -3, max: 5, offset: {below: 0, above: 0}, autoScale: "none", show: true }
                    ],
                    axisHandles: [
                        { position: 0.5, orientation: 'vertical' }
                    ],
                    parkingLot: {}
                });
                jasmine.clock().tick(20);

                plot.pan({ left: 0, top: -500 });
                jasmine.clock().tick(20);
                const parkingLot = plot.getParkingLot();
                const handle = plot.getAxisHandles()[0];
                expect(parkingLot.bottomRightVerticalDocker.has(handle.thumb)).toBeTruthy();

                const dummyOutsidePosition = 1.05;
                const coordsAndDelta = getInitialCoordinateAndDelta(plot, 'r', dummyOutsidePosition);
                simulate.sendTouchEvents([{ x: coordsAndDelta.x, y: coordsAndDelta.y }], handle.thumb, 'touchstart');
                const svgRoot = placeholder.find('.flot-thumbs')[0].firstChild;
                const plotOffset = plot.getPlotOffset();
                simulate.sendTouchEvents([{ x: coordsAndDelta.x, y: plotOffset.top + plot.height() * 0.9 }], svgRoot, 'touchmove');

                jasmine.clock().tick(20);
                expect(parkingLot.bottomRightVerticalDocker.size).toBe(0);
                const yAxis = plot.getYAxes()[0];
                expect(handle.absolutePosition).toBeGreaterThan(yAxis.min);
                expect(handle.absolutePosition).toBeLessThan(yAxis.max);
            });
        }
    });

    describe('render', () => {
        [
            { edge: 'topLeft', horizontalSize: 3, verticalSize: 0 },
            { edge: 'topLeft', horizontalSize: 0, verticalSize: 3 },
            { edge: 'topLeft', horizontalSize: 3, verticalSize: 4 },
            { edge: 'topRight', horizontalSize: 3, verticalSize: 0 },
            { edge: 'topRight', horizontalSize: 0, verticalSize: 3 },
            { edge: 'topRight', horizontalSize: 3, verticalSize: 4 },
            { edge: 'bottomLeft', horizontalSize: 3, verticalSize: 0 },
            { edge: 'bottomLeft', horizontalSize: 0, verticalSize: 3 },
            { edge: 'bottomLeft', horizontalSize: 3, verticalSize: 4 },
            { edge: 'bottomRight', horizontalSize: 3, verticalSize: 0 },
            { edge: 'bottomRight', horizontalSize: 0, verticalSize: 3 },
            { edge: 'bottomRight', horizontalSize: 3, verticalSize: 4 }
        ].forEach((data) => {
            it(`should be correct at ${data.edge} when there are ${data.horizontalSize} horizontal thumbs and there are ${data.verticalSize} vertical thumbs`, () => {
                plot = $.plot(placeholder, [sampleData], {
                    // I'll create thumbs manually, so here cursors is empty
                    cursors: [],
                    parkingLot: {}
                });

                jasmine.clock().tick(20);

                const parkingLot = plot.getParkingLot();
                const svgRoot = parkingLot.svgRoot;
                const thumbRadius = parkingLot._thumbRadius;
                for (let i = 0; i < data.horizontalSize; i++) {
                    const thumb = $.thumb.createThumb({size: thumbRadius, svgRoot});
                    parkingLot[`${data.edge}HorizontalDocker`].add(thumb);
                }
                for (let i = 0; i < data.verticalSize; i++) {
                    const thumb = $.thumb.createThumb({size: thumbRadius, svgRoot});
                    parkingLot[`${data.edge}VerticalDocker`].add(thumb);
                }

                plot.triggerRedrawOverlay();

                jasmine.clock().tick(20);

                ['topLeft', 'topRight', 'bottomLeft', 'bottomRight']
                    .filter((edge) => edge !== data.edge)
                    .forEach((edge) => {
                        ['horizontal', 'vertical'].forEach((orientation) => {
                            const display = parkingLot._dockerBorders[edge][orientation].getAttributeNS(null, 'display');
                            expect(display).toBe('none');
                        });
                    });

                const getCoordinatesForDocker = () => {
                    const plotOffset = plot.getPlotOffset();
                    const thumbLayerWidth = plot.width() + plotOffset.left + plotOffset.right;
                    const thumbLayerHeight = plot.height() + plotOffset.top + plotOffset.bottom;
                    switch (data.edge) {
                        case 'topLeft':
                            return {
                                hx: 0,
                                hy: 0,
                                vx: 0,
                                vy: data.horizontalSize > 0 ? 34 : 0,
                                he: 17,
                                hf: 17,
                                ve: 17,
                                vf: 17 + (data.horizontalSize > 0 ? 34 : 0),
                                hSymbol: 1,
                                vSymbol: 1
                            };
                        case 'bottomLeft':
                            return {
                                hx: 0,
                                hy: thumbLayerHeight - 34,
                                vx: 0,
                                vy: thumbLayerHeight - (data.verticalSize * 34 + (data.horizontalSize > 0 ? 34 : 0)),
                                he: 17,
                                hf: thumbLayerHeight - 17,
                                ve: 17,
                                vf: thumbLayerHeight - (17 + (data.horizontalSize > 0 ? 34 : 0)),
                                hSymbol: 1,
                                vSymbol: -1
                            };
                        case 'topRight':
                            return {
                                hx: thumbLayerWidth - (data.horizontalSize * 34),
                                hy: 0,
                                vx: thumbLayerWidth - 34,
                                vy: data.horizontalSize > 0 ? 34 : 0,
                                he: thumbLayerWidth - 17,
                                hf: 17,
                                ve: thumbLayerWidth - 17,
                                vf: 17 + (data.horizontalSize > 0 ? 34 : 0),
                                hSymbol: -1,
                                vSymbol: 1
                            };
                        case 'bottomRight':
                            return {
                                hx: thumbLayerWidth - (data.horizontalSize * 34),
                                hy: thumbLayerHeight - 34,
                                vx: thumbLayerWidth - 34,
                                vy: thumbLayerHeight - (data.verticalSize * 34 + (data.horizontalSize > 0 ? 34 : 0)),
                                he: thumbLayerWidth - 17,
                                hf: thumbLayerHeight - 17,
                                ve: thumbLayerWidth - 17,
                                vf: thumbLayerHeight - (17 + (data.horizontalSize > 0 ? 34 : 0)),
                                hSymbol: -1,
                                vSymbol: -1
                            };
                    }
                };
                const coordinates = getCoordinatesForDocker();

                const horizontalDocker = parkingLot._dockerBorders[data.edge].horizontal;
                if (data.horizontalSize > 0) {
                    expect(horizontalDocker.getAttributeNS(null, 'display')).toBe('inline');
                    expect(horizontalDocker.getAttributeNS(null, 'width')).toBe(`${data.horizontalSize * 34}`);
                    expect(horizontalDocker.getAttributeNS(null, 'height')).toBe('34');
                    expect(horizontalDocker.getAttributeNS(null, 'x')).toBe(`${coordinates.hx}`);
                    expect(horizontalDocker.getAttributeNS(null, 'y')).toBe(`${coordinates.hy}`);
                    let index = 0;
                    parkingLot[`${data.edge}HorizontalDocker`].forEach((thumb) => {
                        expect(thumb.getCTM().e).toBe(coordinates.he + 34 * coordinates.hSymbol * index++);
                        expect(thumb.getCTM().f).toBe(coordinates.hf);
                    });
                } else {
                    expect(horizontalDocker.getAttributeNS(null, 'display')).toBe('none');
                }

                const verticalDocker = parkingLot._dockerBorders[data.edge].vertical;
                if (data.verticalSize > 0) {
                    expect(verticalDocker.getAttributeNS(null, 'display')).toBe('inline');
                    expect(verticalDocker.getAttributeNS(null, 'width')).toBe('34');
                    expect(verticalDocker.getAttributeNS(null, 'height')).toBe(`${data.verticalSize * 34}`);
                    expect(verticalDocker.getAttributeNS(null, 'x')).toBe(`${coordinates.vx}`);
                    expect(verticalDocker.getAttributeNS(null, 'y')).toBe(`${coordinates.vy}`);
                    let index = 0;
                    parkingLot[`${data.edge}VerticalDocker`].forEach((thumb) => {
                        expect(thumb.getCTM().e).toBe(coordinates.ve);
                        expect(thumb.getCTM().f).toBe(coordinates.vf + 34 * coordinates.vSymbol * index++);
                    });
                } else {
                    expect(verticalDocker.getAttributeNS(null, 'display')).toBe('none');
                }
            });
        });
    });

    const verifyParkingLotHasThumb = (thumb, parkingLot, expectedDocker, thumbVisible = true) => {
        [
            'topLeftHorizontalDocker',
            'topLeftVerticalDocker',
            'topRightHorizontalDocker',
            'topRightVerticalDocker',
            'bottomLeftHorizontalDocker',
            'bottomLeftVerticalDocker',
            'bottomRightHorizontalDocker',
            'bottomRightVerticalDocker'
        ].forEach((docker) => {
            if (docker === expectedDocker) {
                expect(parkingLot[`${docker}`].has(thumb)).toBeTruthy();
                if (thumbVisible) {
                    expect(window.getComputedStyle(thumb).display).toBe('inline');
                } else {
                    expect(window.getComputedStyle(thumb).display).toBe('none');
                }
            } else {
                expect(parkingLot[`${docker}`].size).toBe(0);
            }
        });
    };

    describe('response to thumb creation and deletion', () => {
        const getDescription = (docker) => {
            return docker ? `be in the ${docker} and then should be removed from this docker` : 'not be in the parking lot';
        };

        [
            { thumbLocation: 't', relativePosition: 0.5, expectedDocker: undefined },
            { thumbLocation: 't', relativePosition: -0.05, expectedDocker: 'topLeftHorizontalDocker' },
            { thumbLocation: 't', relativePosition: 1.05, expectedDocker: 'topRightHorizontalDocker' },
            { thumbLocation: 'b', relativePosition: 0.5, expectedDocker: undefined },
            { thumbLocation: 'b', relativePosition: -0.05, expectedDocker: 'bottomLeftHorizontalDocker' },
            { thumbLocation: 'b', relativePosition: 1.05, expectedDocker: 'bottomRightHorizontalDocker' },
            { thumbLocation: 'l', relativePosition: 0.5, expectedDocker: undefined },
            { thumbLocation: 'l', relativePosition: -0.05, expectedDocker: 'topLeftVerticalDocker' },
            { thumbLocation: 'l', relativePosition: 1.05, expectedDocker: 'bottomLeftVerticalDocker' },
            { thumbLocation: 'r', relativePosition: 0.5, expectedDocker: undefined },
            { thumbLocation: 'r', relativePosition: -0.05, expectedDocker: 'topRightVerticalDocker' },
            { thumbLocation: 'r', relativePosition: 1.05, expectedDocker: 'bottomRightVerticalDocker' }
        ].forEach((data) => {
            it(`the cursor's thumb should ${getDescription(data.expectedDocker)}`, () => {
                plot = $.plot(placeholder, [sampleData], {
                    cursors: [
                        {
                            position: data.thumbLocation.search(/[tb]/) !== -1 ? { relativeX: data.relativePosition } : { relativeY: data.relativePosition },
                            mode: data.thumbLocation.search(/[tb]/) !== -1 ? 'x' : 'y',
                            showThumbs: data.thumbLocation
                        }
                    ],
                    parkingLot: {}
                });

                jasmine.clock().tick(20);

                const cursor = plot.getCursors()[0];
                const parkingLot = plot.getParkingLot();
                verifyParkingLotHasThumb(cursor.thumbs[0], parkingLot, data.expectedDocker);

                plot.removeCursor(cursor);
                jasmine.clock().tick(20);
                verifyParkingLotHasThumb(null, parkingLot);
            });
        });

        [
            { orientation: 'horizontal', location: 'far', position: 0.5, expectedDocker: undefined },
            { orientation: 'horizontal', location: 'far', position: -0.05, expectedDocker: 'topLeftHorizontalDocker' },
            { orientation: 'horizontal', location: 'far', position: 1.05, expectedDocker: 'topRightHorizontalDocker' },
            { orientation: 'horizontal', location: 'near', position: 0.5, expectedDocker: undefined },
            { orientation: 'horizontal', location: 'near', position: -0.05, expectedDocker: 'bottomLeftHorizontalDocker' },
            { orientation: 'horizontal', location: 'near', position: 1.05, expectedDocker: 'bottomRightHorizontalDocker' },
            { orientation: 'vertical', location: 'near', position: 0.5, expectedDocker: undefined },
            { orientation: 'vertical', location: 'near', position: -0.05, expectedDocker: 'topLeftVerticalDocker' },
            { orientation: 'vertical', location: 'near', position: 1.05, expectedDocker: 'bottomLeftVerticalDocker' },
            { orientation: 'vertical', location: 'far', position: 0.5, expectedDocker: undefined },
            { orientation: 'vertical', location: 'far', position: -0.05, expectedDocker: 'topRightVerticalDocker' },
            { orientation: 'vertical', location: 'far', position: 1.05, expectedDocker: 'bottomRightVerticalDocker' }
        ].forEach((data) => {
            it(`the axis handle's thumb should ${getDescription(data.expectedDocker)}`, () => {
                plot = $.plot(placeholder, [sampleData], {
                    axisHandles: [
                        {
                            position: data.position,
                            orientation: data.orientation,
                            location: data.location
                        }
                    ],
                    parkingLot: {}
                });

                jasmine.clock().tick(20);

                const handle = plot.getAxisHandles()[0];
                const parkingLot = plot.getParkingLot();
                verifyParkingLotHasThumb(handle.thumb, parkingLot, data.expectedDocker);

                plot.removeAxisHandle(handle);
                jasmine.clock().tick(20);
                verifyParkingLotHasThumb(null, parkingLot);
            });
        });
    });

    describe('response to thumb visibility changes', () => {
        [
            { thumbLocation: 't', relativePosition: -0.05, expectedDocker: 'topLeftHorizontalDocker' },
            { thumbLocation: 't', relativePosition: 1.05, expectedDocker: 'topRightHorizontalDocker' },
            { thumbLocation: 'b', relativePosition: -0.05, expectedDocker: 'bottomLeftHorizontalDocker' },
            { thumbLocation: 'b', relativePosition: 1.05, expectedDocker: 'bottomRightHorizontalDocker' },
            { thumbLocation: 'l', relativePosition: -0.05, expectedDocker: 'topLeftVerticalDocker' },
            { thumbLocation: 'l', relativePosition: 1.05, expectedDocker: 'bottomLeftVerticalDocker' },
            { thumbLocation: 'r', relativePosition: -0.05, expectedDocker: 'topRightVerticalDocker' },
            { thumbLocation: 'r', relativePosition: 1.05, expectedDocker: 'bottomRightVerticalDocker' }
        ].forEach((data) => {
            it(`the cursor's thumb should be removed from ${data.expectedDocker} when hiding the cursor`, () => {
                plot = $.plot(placeholder, [sampleData], {
                    cursors: [
                        {
                            position: data.thumbLocation.search(/[tb]/) !== -1 ? { relativeX: data.relativePosition } : { relativeY: data.relativePosition },
                            mode: data.thumbLocation.search(/[tb]/) !== -1 ? 'x' : 'y',
                            showThumbs: data.thumbLocation
                        }
                    ],
                    parkingLot: {}
                });

                jasmine.clock().tick(20);

                const cursor = plot.getCursors()[0];
                const parkingLot = plot.getParkingLot();
                verifyParkingLotHasThumb(cursor.thumbs[0], parkingLot, data.expectedDocker);

                plot.setCursor(cursor, { show: false });
                jasmine.clock().tick(20);
                verifyParkingLotHasThumb(null, parkingLot);
            });
        });

        [
            { orientation: 'horizontal', location: 'far', position: -0.05, expectedDocker: 'topLeftHorizontalDocker' },
            { orientation: 'horizontal', location: 'far', position: 1.05, expectedDocker: 'topRightHorizontalDocker' },
            { orientation: 'horizontal', location: 'near', position: -0.05, expectedDocker: 'bottomLeftHorizontalDocker' },
            { orientation: 'horizontal', location: 'near', position: 1.05, expectedDocker: 'bottomRightHorizontalDocker' },
            { orientation: 'vertical', location: 'near', position: -0.05, expectedDocker: 'topLeftVerticalDocker' },
            { orientation: 'vertical', location: 'near', position: 1.05, expectedDocker: 'bottomLeftVerticalDocker' },
            { orientation: 'vertical', location: 'far', position: -0.05, expectedDocker: 'topRightVerticalDocker' },
            { orientation: 'vertical', location: 'far', position: 1.05, expectedDocker: 'bottomRightVerticalDocker' }
        ].forEach((data) => {
            it(`the axis handle's thumb should be removed from ${data.expectedDocker} when hiding the ${data.location} ${data.orientation} handle`, () => {
                plot = $.plot(placeholder, [sampleData], {
                    axisHandles: [
                        {
                            position: data.position,
                            orientation: data.orientation,
                            location: data.location
                        }
                    ],
                    parkingLot: {}
                });

                jasmine.clock().tick(20);

                const handle = plot.getAxisHandles()[0];
                const parkingLot = plot.getParkingLot();
                verifyParkingLotHasThumb(handle.thumb, parkingLot, data.expectedDocker);

                plot.setAxisHandle(handle, { show: false });
                jasmine.clock().tick(20);
                verifyParkingLotHasThumb(null, parkingLot);
            });
        });

        const getDelta = (plot, direction) => {
            switch (direction) {
                case 'left':
                    return { left: plot.width() * 0.5 + 5, top: 0 };
                case 'right':
                    return { left: -(plot.width() * 0.5 + 5), top: 0 };
                case 'top':
                    return { left: 0, top: plot.height() * 0.5 + 10 };
                case 'bottom':
                    return { left: 0, top: -(plot.height() * 0.5 + 10) };
            }
        };

        [
            { thumbLocation: 't', panMode: 'left', expectedDocker: 'topLeftHorizontalDocker' },
            { thumbLocation: 't', panMode: 'right', expectedDocker: 'topRightHorizontalDocker' },
            { thumbLocation: 'b', panMode: 'left', expectedDocker: 'bottomLeftHorizontalDocker' },
            { thumbLocation: 'b', panMode: 'right', expectedDocker: 'bottomRightHorizontalDocker' },
            { thumbLocation: 'l', panMode: 'top', expectedDocker: 'topLeftVerticalDocker' },
            { thumbLocation: 'l', panMode: 'bottom', expectedDocker: 'bottomLeftVerticalDocker' },
            { thumbLocation: 'r', panMode: 'top', expectedDocker: 'topRightVerticalDocker' },
            { thumbLocation: 'r', panMode: 'bottom', expectedDocker: 'bottomRightVerticalDocker' }
        ].forEach((data) => {
            it(`the cursor's thumb should be added to ${data.expectedDocker} after panning the graph to ${data.panMode} side and showing it`, () => {
                plot = $.plot(placeholder, [sampleData], {
                    cursors: [
                        {
                            position: data.thumbLocation.search(/[tb]/) !== -1 ? { relativeX: 0.5 } : { relativeY: 0.5 },
                            mode: data.thumbLocation.search(/[tb]/) !== -1 ? 'x' : 'y',
                            showThumbs: data.thumbLocation
                        }
                    ],
                    parkingLot: {}
                });

                jasmine.clock().tick(20);

                const cursor = plot.getCursors()[0];
                plot.setCursor(cursor, { show: false });
                plot.pan(getDelta(plot, data.panMode));
                jasmine.clock().tick(20);

                plot.setCursor(cursor, { show: true });
                jasmine.clock().tick(20);

                const parkingLot = plot.getParkingLot();
                verifyParkingLotHasThumb(cursor.thumbs[0], parkingLot, data.expectedDocker);
            });
        });

        [
            { orientation: 'horizontal', location: 'far', panMode: 'left', expectedDocker: 'topLeftHorizontalDocker' },
            { orientation: 'horizontal', location: 'far', panMode: 'right', expectedDocker: 'topRightHorizontalDocker' },
            { orientation: 'horizontal', location: 'near', panMode: 'left', expectedDocker: 'bottomLeftHorizontalDocker' },
            { orientation: 'horizontal', location: 'near', panMode: 'right', expectedDocker: 'bottomRightHorizontalDocker' },
            { orientation: 'vertical', location: 'near', panMode: 'top', expectedDocker: 'topLeftVerticalDocker' },
            { orientation: 'vertical', location: 'near', panMode: 'bottom', expectedDocker: 'bottomLeftVerticalDocker' },
            { orientation: 'vertical', location: 'far', panMode: 'top', expectedDocker: 'topRightVerticalDocker' },
            { orientation: 'vertical', location: 'far', panMode: 'bottom', expectedDocker: 'bottomRightVerticalDocker' }
        ].forEach((data) => {
            it(`the axis handle's thumb should be added to ${data.expectedDocker} after panning the graph to ${data.panMode} side and showing it`, () => {
                plot = $.plot(placeholder, [sampleData], {
                    axisHandles: [
                        {
                            position: 0.5,
                            orientation: data.orientation,
                            location: data.location
                        }
                    ],
                    parkingLot: {}
                });

                jasmine.clock().tick(20);

                const handle = plot.getAxisHandles()[0];
                plot.setAxisHandle(handle, { show: false });
                plot.pan(getDelta(plot, data.panMode));
                jasmine.clock().tick(20);

                plot.setAxisHandle(handle, { show: true });
                jasmine.clock().tick(20);

                const parkingLot = plot.getParkingLot();
                verifyParkingLotHasThumb(handle.thumb, parkingLot, data.expectedDocker);
            });
        });

        [
            { thumbLocation: 't', panMode: 'left', expectedDocker: 'topLeftHorizontalDocker' },
            { thumbLocation: 't', panMode: 'right', expectedDocker: 'topRightHorizontalDocker' },
            { thumbLocation: 'b', panMode: 'left', expectedDocker: 'bottomLeftHorizontalDocker' },
            { thumbLocation: 'b', panMode: 'right', expectedDocker: 'bottomRightHorizontalDocker' },
            { thumbLocation: 'l', panMode: 'top', expectedDocker: 'topLeftVerticalDocker' },
            { thumbLocation: 'l', panMode: 'bottom', expectedDocker: 'bottomLeftVerticalDocker' },
            { thumbLocation: 'r', panMode: 'top', expectedDocker: 'topRightVerticalDocker' },
            { thumbLocation: 'r', panMode: 'bottom', expectedDocker: 'bottomRightVerticalDocker' }
        ].forEach((data) => {
            it(`the cursor's thumb should be added to ${data.expectedDocker} after panning the graph to ${data.panMode} side and hiding it when parking lot is not shown`, () => {
                plot = $.plot(placeholder, [sampleData], {
                    cursors: [
                        {
                            position: data.thumbLocation.search(/[tb]/) !== -1 ? { relativeX: 0.5 } : { relativeY: 0.5 },
                            mode: data.thumbLocation.search(/[tb]/) !== -1 ? 'x' : 'y',
                            showThumbs: data.thumbLocation
                        }
                    ],
                    parkingLot: { show: false }
                });

                jasmine.clock().tick(20);

                const cursor = plot.getCursors()[0];
                plot.setCursor(cursor, { show: false });
                plot.pan(getDelta(plot, data.panMode));
                jasmine.clock().tick(20);

                plot.setCursor(cursor, { show: true });
                jasmine.clock().tick(20);

                const parkingLot = plot.getParkingLot();
                verifyParkingLotHasThumb(cursor.thumbs[0], parkingLot, data.expectedDocker, false);
            });
        });

        [
            { orientation: 'horizontal', location: 'far', panMode: 'left', expectedDocker: 'topLeftHorizontalDocker' },
            { orientation: 'horizontal', location: 'far', panMode: 'right', expectedDocker: 'topRightHorizontalDocker' },
            { orientation: 'horizontal', location: 'near', panMode: 'left', expectedDocker: 'bottomLeftHorizontalDocker' },
            { orientation: 'horizontal', location: 'near', panMode: 'right', expectedDocker: 'bottomRightHorizontalDocker' },
            { orientation: 'vertical', location: 'near', panMode: 'top', expectedDocker: 'topLeftVerticalDocker' },
            { orientation: 'vertical', location: 'near', panMode: 'bottom', expectedDocker: 'bottomLeftVerticalDocker' },
            { orientation: 'vertical', location: 'far', panMode: 'top', expectedDocker: 'topRightVerticalDocker' },
            { orientation: 'vertical', location: 'far', panMode: 'bottom', expectedDocker: 'bottomRightVerticalDocker' }
        ].forEach((data) => {
            it(`the axis handle's thumb should be added to ${data.expectedDocker} after panning the graph to ${data.panMode} side and hiding it when parking lot is not shown`, () => {
                plot = $.plot(placeholder, [sampleData], {
                    axisHandles: [
                        {
                            position: 0.5,
                            orientation: data.orientation,
                            location: data.location
                        }
                    ],
                    parkingLot: { show: false }
                });

                jasmine.clock().tick(20);

                const handle = plot.getAxisHandles()[0];
                plot.setAxisHandle(handle, { show: false });
                plot.pan(getDelta(plot, data.panMode));
                jasmine.clock().tick(20);

                plot.setAxisHandle(handle, { show: true });
                jasmine.clock().tick(20);

                const parkingLot = plot.getParkingLot();
                verifyParkingLotHasThumb(handle.thumb, parkingLot, data.expectedDocker, false);
            });
        });
    });

    it('plot offset changes by show property', () => {
        plot = $.plot(placeholder, [sampleData], {
            parkingLot: {}
        });
        jasmine.clock().tick(20);
        const offset = plot.getPlotOffset();

        const plotWithParkingLotHidden = $.plot(placeholder, [sampleData], {
            parkingLot: { show: false }
        });
        jasmine.clock().tick(20);
        const offsetWithParkingLotHidden = plotWithParkingLotHidden.getPlotOffset();

        expect(offset.left - offsetWithParkingLotHidden.left).toBeGreaterThan(20);
        expect(offset.top - offsetWithParkingLotHidden.top).toBeGreaterThan(20);
        expect(offset.right - offsetWithParkingLotHidden.right).toBeGreaterThan(20);
        expect(offset.bottom - offsetWithParkingLotHidden.bottom).toBeGreaterThan(20);
    });
});
