describe('A scrollbar', function() {
    'use strict';

    let placeholder, options, data, plot;

    beforeEach(function () {
        let fixture = setFixtures('<div id="demo-container" style="width: 800px;height: 600px">').find('#demo-container').get(0);

        placeholder = $('<div id="placeholder" style="width: 100%;height: 100%">');
        placeholder.appendTo(fixture);

        options = {
            scrollbar: {
                show: true
            }
        },
        data = [{ data: [0, 1, 2, 3], flatdata: true, lines: { show: true } }];
    });

    afterEach(function () {
        if (plot) {
            plot.shutdown();
        }
        placeholder.empty();
    });

    it('should create a scrollbar', function() {
        plot = $.plot(placeholder, data, options);
        
        let outerContainer = placeholder.find('.flot-scrollbar-outer-container');
        expect(outerContainer.length).toBe(1);
        expect(outerContainer.children().length).toBe(3);
        let scrollbar = outerContainer.find('.flot-scrollbar');
        expect(scrollbar.length).toBe(1);
        expect(scrollbar.find('.flot-scrollbar-left-handle').length).toBe(1);
        expect(scrollbar.find('.flot-scrollbar-right-handle').length).toBe(1);
    });

    it('should hide when disabled', function() {
        options.scrollbar.show = false;
        plot = $.plot(placeholder, data, options);
        
        let container = placeholder.find('.flot-scrollbar-outer-container');
        expect(container.length).toBe(0);
    });

    it('should add offset to plot depending on height', function() {
        options.scrollbar.height = 50;
        plot = $.plot(placeholder, data, options);
        
        let offset = plot.getPlotOffset();
        expect(offset.bottom).toBeGreaterThanOrEqual(50);
    });

    it('should be positioned below plot', function() {
        plot = $.plot(placeholder, data, options);
        
        let container = placeholder.find('.flot-scrollbar-outer-container');
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
        let leftHandle = placeholder.find('.flot-scrollbar-left-handle');
        let xaxis = plot.getXAxes()[0];
        simulateMove(leftHandle, 2 / (xaxis.datamax - xaxis.datamin) * container.width());

        expect(xaxis.min).toBeCloseTo(2);
        expect(xaxis.max).toBe(3);
    });

    it('should zoom in on right handle drag', function() {
        plot = $.plot(placeholder, data, options);
        
        let container = placeholder.find('.flot-scrollbar-container');
        let rightHandle = placeholder.find('.flot-scrollbar-right-handle');
        let xaxis = plot.getXAxes()[0];
        simulateMove(rightHandle, -2 / (xaxis.datamax - xaxis.datamin) * container.width());

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
        simulateMove(scrollbar, 0.5 / (xaxis.datamax - xaxis.datamin) * container.width());

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
        
        let moveLeftButton = placeholder.find('.flot-scrollbar-move-left');
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
        
        let moveRightButton = placeholder.find('.flot-scrollbar-move-right');
        moveRightButton.simulate('mousedown');

        let xaxis = plot.getXAxes()[0];
        expect(xaxis.min).toBeCloseTo(1.1);
        expect(xaxis.max).toBeCloseTo(2.1);
    });

    function simulateMove(element, dx) {
        let position = { clientX: element.offset().left + element.width() / 2, clientY: element.offset().top + element.height() / 2 };
        element.simulate('mousedown', position);
        position.clientX += dx;
        $(document.body).simulate('mousemove', position);
        $(document.body).simulate('mouseup');
    }
});
