describe('thumb plugin', function () {
    'use strict';

    describe('createSVGLayer', function() {
        var placeholder;

        beforeEach(function() {
            placeholder = setFixtures('<div id="test-container" style="width: 600px;height: 400px">')
                .find('#test-container');
        });

        it('should create a svg element if it does not exist', function() {
            $.thumb.createSVGLayer(placeholder);
            expect($('svg')[0]).not.toBeNull();
        });

        it('should return an svg element after creation', function() {
            expect($.thumb.createSVGLayer(placeholder)).not.toBeNull();
        });
    });

    describe('createThumb', function() {
        var placeholder, svgRoot;

        beforeEach(function() {
            placeholder = setFixtures('<div id="test-container" style="width: 600px;height: 400px">')
                .find('#test-container');
            svgRoot = $.thumb.createSVGLayer(placeholder);
        });

        it('should create a svg thumb element', function() {
            var thumbOpts = {
                x: 50,
                y: 50,
                size: 20,
                svgRoot: svgRoot
            }
            $.thumb.createThumb(thumbOpts);
            expect(document.getElementsByClassName('thumb')[0]).not.toBeNull();
        });

        it('should create a svg thumb with certain radius', function() {
            var thumbOpts = {
                x: 50,
                y: 50,
                size: 20,
                svgRoot: svgRoot
            }
            $.thumb.createThumb(thumbOpts);
            var radius = document.getElementsByClassName('thumb')[0].childNodes[0].getAttribute('width') / 2;
            expect(radius).toEqual(20);
        });

        it('should create a svg thumb with center of circle at a certain place', function() {
            var thumbOpts = {
                x: 50,
                y: 50,
                size: 20,
                svgRoot: svgRoot
            }
            $.thumb.createThumb(thumbOpts);
            var thumb = document.getElementsByClassName('thumb')[0];
            expect(thumb.getCTM().e).toEqual(50);
            expect(thumb.getCTM().f).toEqual(50);
        });

        ['bottom', 'top', 'left', 'right'].forEach((shape) => {
            it('should have expected shape token in the classList', () => {
                const thumbElement = $.thumb.createThumb({
                    svgRoot,
                    shape
                });

                expect(thumbElement.classList.contains(shape)).toBeTruthy();
            });
        });
    });

    describe('thumbs navigation', function() {
        var placeholder, svgRoot, thumb;

        beforeEach(function() {
            placeholder = setFixtures('<div id="test-container" style="width: 600px;height: 400px">')
                .find('#test-container');
            svgRoot = $.thumb.createSVGLayer(placeholder);
            var thumbOpts = {
                x: 0,
                y: 0,
                size: 20,
                svgRoot: svgRoot,
                classList: ['draggable']
            }
            $.thumb.createThumb(thumbOpts);
            thumb = document.getElementsByClassName('thumb')[0];
        });

        it('touchstart should trigger thumbmovestart event', function() {
            var spy = jasmine.createSpy('thumbmovestart handler'),
                initialCoords = [{x: 0, y: 0}];

            document.addEventListener('thumbmovestart', spy);

            simulate.sendTouchEvents(initialCoords, thumb, 'touchstart');

            expect(spy).toHaveBeenCalled();
            expect(spy.calls.count()).toBe(1);
        });

        it('mousedown should trigger thumbmovestart event', function() {
            var spy = jasmine.createSpy('thumbmovestart handler'),
                initialCoords = [{x: 50, y: 50}];

            document.addEventListener('thumbmovestart', spy);

            simulate.mouseDown(thumb, initialCoords[0].x, initialCoords[0].y);

            expect(spy).toHaveBeenCalled();
            expect(spy.calls.count()).toBe(1);
        });

        it('touchend should trigger thumbmoveend event', function() {
            var spy = jasmine.createSpy('thumbmoveend handler'),
                initialCoords = [{x: 0, y: 0}];

            document.addEventListener('thumbmoveend', spy);

            simulate.sendTouchEvents(initialCoords, thumb, 'touchstart');
            simulate.sendTouchEvents(initialCoords, svgRoot, 'touchend');

            expect(spy).toHaveBeenCalled();
            expect(spy.calls.count()).toBe(1);
        });

        it('mouseup should trigger thumbmoveend event', function() {
            var spy = jasmine.createSpy('thumbmoveend handler'),
                initialCoords = [{x: 0, y: 0}];

            document.addEventListener('thumbmoveend', spy);

            simulate.mouseDown(thumb, initialCoords[0].x, initialCoords[0].y);
            simulate.mouseUp(thumb, initialCoords[0].x, initialCoords[0].y);

            expect(spy).toHaveBeenCalled();
            expect(spy.calls.count()).toBe(1);
        });

        it('touchmove should trigger thumbmove event', function() {
            var spy = jasmine.createSpy('thumbmove handler'),
                initialCoords = [{x: 0, y: 0}],
                finalCoords = [{x: 1, y: 1}];

            document.addEventListener('thumbmove', spy);

            simulate.sendTouchEvents(initialCoords, thumb, 'touchstart');
            simulate.sendTouchEvents(finalCoords, svgRoot, 'touchmove');

            expect(spy).toHaveBeenCalled();
            expect(spy.calls.count()).toBe(1);
        });

        it('touchmove should not trigger thumbmove event for circle not touched', function() {
            var spy = jasmine.createSpy('thumbmove handler'),
                initialCoords = [{x: 200, y: 200}],
                finalCoords = [{x: 1, y: 1}];

            document.addEventListener('thumbmove', spy);

            simulate.sendTouchEvents(initialCoords, svgRoot, 'touchstart');
            simulate.sendTouchEvents(finalCoords, svgRoot, 'touchmove');

            expect(spy).toHaveBeenCalled();
            expect(spy.calls.count()).toBe(1);
        });

        it('mousemove should trigger thumbmove event', function() {
            var spy = jasmine.createSpy('thumbmove handler'),
                initialCoords = [{x: 0, y: 0}],
                finalCoords = [{x: 1, y: 1}];

            document.addEventListener('thumbmove', spy);

            mouseDownOnThumb(initialCoords[0].x, initialCoords[0].y);
            mouseMoveOnSVG(finalCoords[0].x, finalCoords[0].y);

            expect(spy).toHaveBeenCalled();
            expect(spy.calls.count()).toBe(1);
        });

        it('touchmove should update svg element position', function() {
            var initialCoords = [{x: 0, y: 0}],
                finalCoords = [{x: 10, y: 10}];

            simulate.sendTouchEvents(initialCoords, thumb, 'touchstart');
            simulate.sendTouchEvents(finalCoords, svgRoot, 'touchmove');

            var currentMatrix = thumb.getCTM();

            expect(currentMatrix.e).toEqual(finalCoords[0].x - initialCoords[0].x);
            expect(currentMatrix.f).toEqual(finalCoords[0].y - initialCoords[0].y);
        });

        it('touchmove should take into accout constraint function', function() {
            var initialCoords = [{x: 0, y: 0}],
                finalCoords = [{x: 10, y: 10}],
                verticalConstraint = function (mouseX, mouseY, currentX, currentY) {
                    return [currentX, mouseY];
                };

            var thumbOpts = {
                x: 0,
                y: 0,
                size: 20,
                svgRoot: svgRoot,
                classList: ['draggable'],
                constraintFunction: verticalConstraint
            }
            $.thumb.createThumb(thumbOpts);
            thumb = document.getElementsByClassName('thumb')[1];

            simulate.sendTouchEvents(initialCoords, thumb, 'touchstart');
            simulate.sendTouchEvents(finalCoords, svgRoot, 'touchmove');

            var currentMatrix = thumb.getCTM();

            expect(currentMatrix.e).toEqual(0);
            expect(currentMatrix.f).toEqual(finalCoords[0].y - initialCoords[0].y);
        });

        it('mousemove should update svg element position', function() {
            var initialCoords = [{x: 0, y: 0}],
                finalCoords = [{x: 10, y: 10}];

            mouseDownOnThumb(initialCoords[0].x, initialCoords[0].y);
            mouseMoveOnSVG(finalCoords[0].x, finalCoords[0].y);

            var currentMatrix = thumb.getCTM();

            expect(currentMatrix.e).toEqual(finalCoords[0].x - initialCoords[0].x);
            expect(currentMatrix.f).toEqual(finalCoords[0].y - initialCoords[0].y);
        });

        it('mousemove should update svg element position', function() {
            var initialCoords = [{x: 0, y: 0}],
                finalCoords = [{x: 10, y: 10}],
                horizontalConstraint = function (mouseX, mouseY, currentX, currentY) {
                    return [mouseX, currentY];
                };

            var thumbOpts = {
                x: 0,
                y: 0,
                size: 20,
                svgRoot: svgRoot,
                classList: ['draggable'],
                constraintFunction: horizontalConstraint
            }
            $.thumb.createThumb(thumbOpts);
            thumb = document.getElementsByClassName('thumb')[1];

            mouseDownOnThumb(initialCoords[0].x, initialCoords[0].y);
            mouseMoveOnSVG(finalCoords[0].x, finalCoords[0].y);

            var currentMatrix = thumb.getCTM();

            expect(currentMatrix.e).toEqual(finalCoords[0].x - initialCoords[0].x);
            expect(currentMatrix.f).toEqual(0);
        });

        function mouseDownOnThumb(x, y) {
            // x and y are relative to the top-left SVG element
            simulate.mouseDown(thumb, x, y);
        }

        function mouseMoveOnSVG(x, y) {
            // x and y are relative to the top-left SVG element
            // making sure mouseMove correctly calculates the pageX and pageY
            var svgRootBBox = svgRoot.getBoundingClientRect();
            var thumbBBox = thumb.getBoundingClientRect();
            simulate.mouseMove(svgRoot, x + thumbBBox.left - svgRootBBox.left, y + thumbBBox.top - svgRootBBox.top);
        }
    });

    describe('shutdown', function() {
        var placeholder, svgRoot, thumb;

        beforeEach(function() {
            placeholder = setFixtures('<div id="test-container" style="width: 600px;height: 400px">')
                .find('#test-container');
            svgRoot = $.thumb.createSVGLayer(placeholder);
            var thumbOpts = {
                x: 0,
                y: 0,
                size: 20,
                svgRoot: svgRoot,
                classList: ['draggable']
            }
            $.thumb.createThumb(thumbOpts);
            thumb = document.getElementsByClassName('thumb')[0];
        });

        it('should remove touch and mouse handlers', function() {
            var spy = jasmine.createSpy('thumbsmove handler'),
                spy2 = jasmine.createSpy('thumbsmoveend handler'),
                initialCoords = [{x: 0, y: 0}],
                finalCoords = [{x: 1, y: 1}];

            document.addEventListener('thumbsmove', spy);
            document.addEventListener('thumbsmoveend', spy2);

            $.thumb.shutdown(svgRoot);

            //after shutdown, check if the events are still triggerd
            simulate.sendTouchEvents(initialCoords, thumb, 'touchstart');
            simulate.sendTouchEvents(finalCoords, svgRoot, 'touchmove');
            simulate.sendTouchEvents(finalCoords, svgRoot, 'touchend');

            expect(spy).not.toHaveBeenCalled();
            expect(spy.calls.count()).toBe(0);
            expect(spy2).not.toHaveBeenCalled();
            expect(spy2.calls.count()).toBe(0);

            simulate.sendTouchEvents(initialCoords, thumb, 'mousedown');
            simulate.sendTouchEvents(finalCoords, svgRoot, 'mousemove');
            simulate.sendTouchEvents(finalCoords, svgRoot, 'mouseup');

            expect(spy).not.toHaveBeenCalled();
            expect(spy.calls.count()).toBe(0);
            expect(spy2).not.toHaveBeenCalled();
            expect(spy2.calls.count()).toBe(0);
        });
    });

    describe('updateComputedXPosition', function() {
        var placeholder, svgRoot, thumb;

        beforeEach(function() {
            placeholder = setFixtures('<div id="test-container" style="width: 600px;height: 400px">')
                .find('#test-container');
            svgRoot = $.thumb.createSVGLayer(placeholder);
            var thumbOpts = {
                x: 0,
                y: 0,
                size: 20,
                svgRoot: svgRoot
            }
            $.thumb.createThumb(thumbOpts);
            thumb = document.getElementsByClassName('thumb')[0];
        });

        it('should update for a thumb the cx position', function() {
            var position = 30;
            $.thumb.updateComputedXPosition(thumb, position);
            expect(thumb.getCTM().e).toEqual(position);
        });
    });

    describe('updateComputedYPosition', function() {
        var placeholder, svgRoot, thumb;

        beforeEach(function() {
            placeholder = setFixtures('<div id="test-container" style="width: 600px;height: 400px">')
                .find('#test-container');
            svgRoot = $.thumb.createSVGLayer(placeholder);
            var thumbOpts = {
                x: 0,
                y: 0,
                size: 20,
                svgRoot: svgRoot
            }
            $.thumb.createThumb(thumbOpts);
            thumb = document.getElementsByClassName('thumb')[0];
        });

        it('should update for a thumb the cx position', function() {
            var position = 30;
            $.thumb.updateComputedYPosition(thumb, position);
            expect(thumb.getCTM().f).toEqual(position);
        });
    });

    describe('reorderTumbs', function() {
        var placeholder, svgRoot, thumbs,
            thumbA, thumbB, thumbC, thumbD;
        beforeEach(function() {
            placeholder = setFixtures('<div id="test-container" style="width: 600px;height: 400px; stroke:red;">')
                .find('#test-container');
            svgRoot = $.thumb.createSVGLayer(placeholder);
            var thumbOpts1 = {
                    radius: 20,
                    x: 150,
                    y: 150,
                    svgRoot: svgRoot,
                    shape: 'left',
                    abbreviation: 'A',
                    classList: ['draggable']
                },
                thumbOpts2 = {
                    radius: 20,
                    x: 150,
                    y: 150,
                    svgRoot: svgRoot,
                    shape: 'bottom',
                    abbreviation: 'B',
                    classList: ['draggable']
                },
                thumbOpts3 = {
                    radius: 20,
                    x: 300,
                    y: 300,
                    svgRoot: svgRoot,
                    shape: 'top',
                    abbreviation: 'C'
                },
                thumbOpts4 = {
                    radius: 20,
                    x: 300,
                    y: 300,
                    svgRoot: svgRoot,
                    shape: 'right',
                    abbreviation: 'D'
                };

            $.thumb.createThumb(thumbOpts1);
            $.thumb.createThumb(thumbOpts2);
            $.thumb.createThumb(thumbOpts3);
            $.thumb.createThumb(thumbOpts4);
            thumbs = document.getElementsByClassName('thumb');
            thumbA = thumbs[0];
            thumbB = thumbs[1];
            thumbC = thumbs[2];
            thumbD = thumbs[3];
        });

        function svgThumbOrder() {
            return Array.prototype.map.call(document.getElementsByClassName('thumb'),
                function(thumb) {
                    return thumb.childNodes[1].textContent;
                }
            ).join('');
        }

        it('should reorder the overlapping thumbs', function() {
            expect(svgThumbOrder()).toBe('ABCD');
            expect(svgRoot.lastChild).toBe(thumbD);
            expect(svgRoot.childNodes[1]).toBe(thumbA);
            expect(svgRoot.childNodes[2]).toBe(thumbB);
            expect(svgRoot.childNodes[3]).toBe(thumbC);
            expect(svgRoot.childNodes[4]).toBe(thumbD);

            // clicking on thumbD should reveal thumbC by
            // moving it to the lastChild of svgRoot
            simulate.sendTouchEvents([], thumbD, 'click');
            expect(svgThumbOrder()).toBe('ABDC');
            expect(svgRoot.lastChild).toBe(thumbC);
            expect(svgRoot.childNodes[1]).toBe(thumbA);
            expect(svgRoot.childNodes[2]).toBe(thumbB);
            expect(svgRoot.childNodes[3]).toBe(thumbD);
            expect(svgRoot.childNodes[4]).toBe(thumbC);

            // clicking on thumbC should reveal thumbD by
            // moving it to the lastChild of svgRoot
            simulate.sendTouchEvents([], thumbC, 'click');
            expect(svgThumbOrder()).toBe('ABCD');
            expect(svgRoot.lastChild).toBe(thumbD);
            expect(svgRoot.childNodes[1]).toBe(thumbA);
            expect(svgRoot.childNodes[2]).toBe(thumbB);
            expect(svgRoot.childNodes[3]).toBe(thumbC);
            expect(svgRoot.childNodes[4]).toBe(thumbD);
        });

        it('should bring the selected thumb to front', function() {
            var spy = jasmine.createSpy('thumbmove handler'),
                initialCoords = [{x: 150, y: 150}],
                finalCoords = [{x: 300, y: 300}];

            document.addEventListener('thumbmove', spy);

            // simulate mouse move for thumbB
            expect(svgThumbOrder()).toBe('ABCD');
            simulate.sendTouchEvents(initialCoords, thumbB, 'mousedown');
            simulate.sendTouchEvents(finalCoords, svgRoot, 'mousemove');

            // after move event, thumbB should be to the top of everything
            expect(spy).toHaveBeenCalled();
            expect(spy.calls.count()).toBe(1);
            expect(svgRoot.lastChild).toBe(thumbB);
            expect(svgThumbOrder()).toBe('ACDB');

            // thumbB should remain to the front
            simulate.sendTouchEvents(finalCoords, svgRoot, 'mouseup');
            expect(svgRoot.lastChild).toBe(thumbB);
            expect(svgThumbOrder()).toBe('ACDB');

            // simulate touch move for thumbA
            simulate.sendTouchEvents(initialCoords, thumbA, 'touchstart');
            simulate.sendTouchEvents(finalCoords, svgRoot, 'touchmove');

            // after move event, thumbS should be to the top of everything
            expect(spy.calls.count()).toBe(2);
            expect(svgRoot.lastChild).toBe(thumbA);
            expect(svgThumbOrder()).toBe('CDBA');

            // thumbA should remain to the front
            simulate.sendTouchEvents(finalCoords, svgRoot, 'touchend');
            expect(svgRoot.lastChild).toBe(thumbA);
            expect(svgThumbOrder()).toBe('CDBA');
        });
    });
});
