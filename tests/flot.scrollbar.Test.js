describe('A scrollbar', function() {
    'use strict';

    let placeholder, options, data, plot;

    beforeEach(function () {
        let fixture = setFixtures('<div id="demo-container" style="width: 800px;height: 600px">').find('#demo-container').get(0);

        placeholder = $('<div id="placeholder" style="width: 100%;height: 100%">');
        placeholder.appendTo(fixture);

        options = {
            scrollbars: [{}]
        },
        data = [{ data: [0, 1, 2, 3], flatdata: true, lines: { show: true } }];

        jasmine.clock().install();
    });

    afterEach(function () {
        if (plot) {
            plot.shutdown();
        }
        placeholder.empty();
        jasmine.clock().uninstall();
    });

    describe('horizontal', function() {

        it('should create a scrollbar', function() {
            plot = $.plot(placeholder, data, options);
            
            let outerContainer = placeholder.find('.flot-scrollbar-horizontal');
            expect(outerContainer.length).toBe(1);
            expect(outerContainer.children().length).toBe(3);
            let scrollbar = outerContainer.find('.flot-scrollbar');
            expect(scrollbar.length).toBe(1);
            expect(scrollbar.find('.flot-scrollbar-below-handle').length).toBe(1);
            expect(scrollbar.find('.flot-scrollbar-above-handle').length).toBe(1);
        });

        it('should add offset to plot depending on size', function() {
            options.scrollbars[0].size = 100;
            plot = $.plot(placeholder, data, options);
            
            let offset = plot.getPlotOffset();
            expect(offset.bottom).toBeGreaterThanOrEqual(100);
        });

        it('should be positioned below plot', function() {
            plot = $.plot(placeholder, data, options);
            
            let container = placeholder.find('.flot-scrollbar-horizontal');
            expect(container.offset().left).toBe(placeholder.offset().left + plot.getPlotOffset().left);
            expect(container.offset().top + container.outerHeight()).toBe(placeholder.offset().top + placeholder.height());
            expect(container.width()).toBe(plot.width());
            expect(container.outerHeight()).toBe(18);
        });

        it('should be positioned according to axis min/max', function() {
            options.xaxis = {
                offset: { below: 1, above: -1 }
            }
            plot = $.plot(placeholder, data, options);
            
            let container = placeholder.find('.flot-scrollbar-container');
            let scrollbar = container.find('.flot-scrollbar');
            expect(scrollbar.offset().left - container.offset().left).toBeCloseTo(container.width() / 3);
            expect(scrollbar.width()).toBeCloseTo(container.width() / 3);
        });

        it('should zoom in on left handle drag', function() {
            plot = $.plot(placeholder, data, options);
            
            let container = placeholder.find('.flot-scrollbar-container');
            let leftHandle = placeholder.find('.flot-scrollbar-below-handle');
            let xaxis = plot.getXAxes()[0];
            simulateMove(leftHandle, 2 / (xaxis.datamax - xaxis.datamin) * container.width(), 0);

            expect(xaxis.min).toBeCloseTo(2);
            expect(xaxis.max).toBe(3);
        });

        it('should zoom in on right handle drag', function() {
            plot = $.plot(placeholder, data, options);
            
            let container = placeholder.find('.flot-scrollbar-container');
            let rightHandle = placeholder.find('.flot-scrollbar-above-handle');
            let xaxis = plot.getXAxes()[0];
            simulateMove(rightHandle, -2 / (xaxis.datamax - xaxis.datamin) * container.width(), 0);

            expect(xaxis.min).toBe(0);
            expect(xaxis.max).toBeCloseTo(1);
        });

        it('should pan on drag', function() {
            options.xaxis = {
                offset: { below: 1, above: -1 }
            }
            plot = $.plot(placeholder, data, options);
            
            let container = placeholder.find('.flot-scrollbar-container');
            let scrollbar = placeholder.find('.flot-scrollbar');
            let xaxis = plot.getXAxes()[0];
            simulateMove(scrollbar, 0.5 / (xaxis.datamax - xaxis.datamin) * container.width(), 0);

            expect(xaxis.min).toBeCloseTo(1.5);
            expect(xaxis.max).toBeCloseTo(2.5);
        });

        it('should pan on click', function() {
            options.xaxis = {
                offset: { below: 1, above: -1 }
            }
            plot = $.plot(placeholder, data, options);
            
            let container = placeholder.find('.flot-scrollbar-container');
            let xaxis = plot.getXAxes()[0];
            let x = 0.75 / (xaxis.datamax - xaxis.datamin) * container.width();
            let position = { clientX: container.offset().left + x, clientY: container.offset().top + container.height() / 2 };
            container.simulate('mousedown', position);
            container.simulate('mouseup', position);

            expect(xaxis.min).toBeCloseTo(0.25);
            expect(xaxis.max).toBeCloseTo(1.25);
        });

        it('should reset zoom on double click', function() {
            options.xaxis = {
                offset: { below: 1, above: -1 }
            }
            plot = $.plot(placeholder, data, options);
            
            let container = placeholder.find('.flot-scrollbar-container');
            container.dblclick();

            let xaxis = plot.getXAxes()[0];
            expect(xaxis.min).toBe(0);
            expect(xaxis.max).toBe(3);
        });

        it('should pan left on left button click', function() {
            options.xaxis = {
                offset: { below: 1, above: -1 }
            }
            plot = $.plot(placeholder, data, options);
            
            let moveLeftButton = placeholder.find('.flot-scrollbar-move-below');
            moveLeftButton.simulate('mousedown');

            let xaxis = plot.getXAxes()[0];
            expect(xaxis.min).toBeCloseTo(0.9);
            expect(xaxis.max).toBeCloseTo(1.9);
        });

        it('should pan right on right button click', function() {
            options.xaxis = {
                offset: { below: 1, above: -1 }
            }
            plot = $.plot(placeholder, data, options);
            
            let moveRightButton = placeholder.find('.flot-scrollbar-move-above');
            moveRightButton.simulate('mousedown');

            let xaxis = plot.getXAxes()[0];
            expect(xaxis.min).toBeCloseTo(1.1);
            expect(xaxis.max).toBeCloseTo(2.1);
        });

        it('should pan multiple times on click and hold', function() {
            options.xaxis = {
                offset: { below: 1, above: -1 }
            }
            plot = $.plot(placeholder, data, options);
            
            let moveLeftButton = placeholder.find('.flot-scrollbar-move-below');
            // starts moving after 500 ms and moves every 50 ms
            moveLeftButton.simulate('mousedown');
            jasmine.clock().tick(600);
            moveLeftButton.simulate('mouseup');
            let xaxis = plot.getXAxes()[0];
            expect(xaxis.min).toBeCloseTo(0.7);
            expect(xaxis.max).toBeCloseTo(1.7);
        });
    });

    describe('vertical', function() {

        beforeEach(function () {
            options.scrollbars[0].direction = 'vertical';
        });

        it('should create a scrollbar', function() {
            plot = $.plot(placeholder, data, options);
            
            let outerContainer = placeholder.find('.flot-scrollbar-vertical');
            expect(outerContainer.length).toBe(1);
            expect(outerContainer.children().length).toBe(3);
            let scrollbar = outerContainer.find('.flot-scrollbar');
            expect(scrollbar.length).toBe(1);
            expect(scrollbar.find('.flot-scrollbar-below-handle').length).toBe(1);
            expect(scrollbar.find('.flot-scrollbar-above-handle').length).toBe(1);
        });

        it('should add offset to plot depending on size', function() {
            options.scrollbars[0].size = 100;
            plot = $.plot(placeholder, data, options);
            
            let offset = plot.getPlotOffset();
            expect(offset.left).toBeGreaterThanOrEqual(100);
        });

        it('should be positioned next to plot', function() {
            plot = $.plot(placeholder, data, options);
            
            let container = placeholder.find('.flot-scrollbar-vertical');
            expect(container.offset().left).toBe(placeholder.offset().left);
            expect(container.offset().top).toBe(placeholder.offset().top + plot.getPlotOffset().top);
            expect(container.height()).toBe(plot.height());
            expect(container.outerWidth()).toBe(18);
        });

        it('should be positioned according to axis min/max', function() {
            options.yaxis = {
                offset: { below: 1, above: -1 }
            }
            plot = $.plot(placeholder, data, options);
            
            let container = placeholder.find('.flot-scrollbar-container');
            let scrollbar = container.find('.flot-scrollbar');
            expect(scrollbar.offset().top - container.offset().top).toBeCloseTo(container.height() / 3);
            expect(scrollbar.height()).toBeCloseTo(container.height() / 3);
        });

        it('should zoom in on below handle drag', function() {
            plot = $.plot(placeholder, data, options);
            
            let container = placeholder.find('.flot-scrollbar-container');
            let belowHandle = placeholder.find('.flot-scrollbar-below-handle');
            let yaxis = plot.getYAxes()[0];
            simulateMove(belowHandle, 0, -2 / (yaxis.datamax - yaxis.datamin) * container.height());

            expect(yaxis.min).toBeCloseTo(2);
            expect(yaxis.max).toBe(3);
        });

        it('should zoom in on above handle drag', function() {
            plot = $.plot(placeholder, data, options);
            
            let container = placeholder.find('.flot-scrollbar-container');
            let aboveHandle = placeholder.find('.flot-scrollbar-above-handle');
            let yaxis = plot.getYAxes()[0];
            simulateMove(aboveHandle, 0, 2 / (yaxis.datamax - yaxis.datamin) * container.height());

            expect(yaxis.min).toBe(0);
            expect(yaxis.max).toBeCloseTo(1);
        });

        it('should pan on drag', function() {
            options.yaxis = {
                offset: { below: 1, above: -1 }
            }
            plot = $.plot(placeholder, data, options);
            
            let container = placeholder.find('.flot-scrollbar-container');
            let scrollbar = placeholder.find('.flot-scrollbar');
            let yaxis = plot.getYAxes()[0];
            simulateMove(scrollbar, 0, -0.5 / (yaxis.datamax - yaxis.datamin) * container.height());

            expect(yaxis.min).toBeCloseTo(1.5);
            expect(yaxis.max).toBeCloseTo(2.5);
        });

        it('should pan on click', function() {
            options.yaxis = {
                offset: { below: 1, above: -1 }
            }
            plot = $.plot(placeholder, data, options);
            
            let container = placeholder.find('.flot-scrollbar-container');
            let yaxis = plot.getYAxes()[0];
            let y = 0.75 / (yaxis.datamax - yaxis.datamin) * container.height();
            let position = { clientX: container.offset().left + container.width() / 2, clientY: container.offset().top + container.height() - y };
            container.simulate('mousedown', position);
            container.simulate('mouseup', position);

            expect(yaxis.min).toBeCloseTo(0.25);
            expect(yaxis.max).toBeCloseTo(1.25);
        });

        it('should reset zoom on double click', function() {
            options.yaxis = {
                offset: { below: 1, above: -1 }
            }
            plot = $.plot(placeholder, data, options);
            
            let container = placeholder.find('.flot-scrollbar-container');
            container.dblclick();

            let yaxis = plot.getYAxes()[0];
            expect(yaxis.min).toBe(0);
            expect(yaxis.max).toBe(3);
        });

        it('should pan down on bottom button click', function() {
            options.yaxis = {
                offset: { below: 1, above: -1 }
            }
            plot = $.plot(placeholder, data, options);
            
            let moveBottomButton = placeholder.find('.flot-scrollbar-move-below');
            moveBottomButton.simulate('mousedown');

            let yaxis = plot.getYAxes()[0];
            expect(yaxis.min).toBeCloseTo(0.9);
            expect(yaxis.max).toBeCloseTo(1.9);
        });

        it('should pan up on top button click', function() {
            options.yaxis = {
                offset: { below: 1, above: -1 }
            }
            plot = $.plot(placeholder, data, options);
            
            let moveTopButton = placeholder.find('.flot-scrollbar-move-above');
            moveTopButton.simulate('mousedown');

            let yaxis = plot.getYAxes()[0];
            expect(yaxis.min).toBeCloseTo(1.1);
            expect(yaxis.max).toBeCloseTo(2.1);
        });

        it('should pan multiple times on click and hold', function() {
            options.yaxis = {
                offset: { below: 1, above: -1 }
            }
            plot = $.plot(placeholder, data, options);
            
            let moveBottomButton = placeholder.find('.flot-scrollbar-move-below');
            // starts moving after 500 ms and moves every 50 ms
            moveBottomButton.simulate('mousedown');
            jasmine.clock().tick(600);
            moveBottomButton.simulate('mouseup');
            let yaxis = plot.getYAxes()[0];
            expect(yaxis.min).toBeCloseTo(0.7);
            expect(yaxis.max).toBeCloseTo(1.7);
        });
    });

    function simulateMove(element, dx, dy) {
        let position = { clientX: element.offset().left + element.width() / 2, clientY: element.offset().top + element.height() / 2 };
        element.simulate('mousedown', position);
        position.clientX += dx;
        position.clientY += dy;
        $(document.body).simulate('mousemove', position);
        $(document.body).simulate('mouseup');
    }
});
