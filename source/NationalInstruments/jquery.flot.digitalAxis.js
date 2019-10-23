/* The MIT License
Copyright (c) 2019 by National Instruments
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the 'Software'), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

(function ($) {
    'use strict';

    const ELEMENT_ID = 'flot-digital-axis';
    let initialize;
    
    function getDigitalAxis(plot) {
        let isDigitalAxis = (axis) => axis.options.type === 'digital';
        return plot.getYAxes().filter(axis => isDigitalAxis(axis))[0];
    }

    function init(plot) {
        plot.hooks.processOptions.push(processOptions);
    }

    function processOptions(plot, options) {
        let digitalAxis = getDigitalAxis(plot);
        if (digitalAxis) {
            plot.hooks.processDatapoints.push(processDatapoints);
            plot.hooks.processOffset.push(processOffset);
            plot.hooks.draw.push(draw);

            digitalAxis.options.show = false;

            for (let i = 0; i < options.buses.length; i++) {
                if (!options.buses[i].label) {
                    options.buses[i].label = `Bus ${i + 1}`;
                }
            }
        }
    }

    function processDatapoints(plot, series, datapoints) {
        initialize = true;
        if (series.digitalWaveform.show && !series.label) {
            let data = plot.getData();
            series.label = `Signal ${data.indexOf(series) + 1}`;
        }
    }
    
    function processOffset(plot, offset) {
        let digitalAxis = getDigitalAxis(plot);
        if (initialize || digitalAxis.options.elementWidth === undefined) {
            if (digitalAxis.options.width === 'automatic') {
                let placeholder = plot.getPlaceholder();
                let data = plot.getData();
                let buses = plot.getOptions().buses;
                let maxWidth = 0;
                let getElementWidth = (element) => {
                    element.css('visibility', 'hidden');
                    placeholder.append(element);
                    let elementWidth = element.outerWidth();
                    element.remove();
                    return elementWidth;
                };
    
                data.forEach(series => {
                    if (series.digitalWaveform.signal.visible) {
                        let assignedToBus = buses[series.digitalWaveform.signal.bus] !== undefined;
                        let signalElement = createSignalTreeItem(0, 0, series.label, digitalAxis.options.signalSymbol, assignedToBus);
                        let elementWidth = getElementWidth(signalElement);
                        maxWidth = Math.max(maxWidth, elementWidth);
                    }
                });
    
                buses.forEach(bus => {
                    let busElement = createBusTreeItem(0, 0, bus.label, digitalAxis.options.busSymbolCollapsed, false);
                    let elementWidth = getElementWidth(busElement);
                    maxWidth = Math.max(maxWidth, elementWidth);
                });
    
                if (maxWidth > 0) {
                    let relativeMaxWidth = (maxWidth + 10) / placeholder.width();
                    let axisWidth = Math.min(relativeMaxWidth, 0.5);
                    digitalAxis.options.elementWidth = placeholder.width() * axisWidth;
                } else {
                    digitalAxis.options.elementWidth = 0;
                }
            } else {
                digitalAxis.options.elementWidth = digitalAxis.options.width;
            }
        }

        offset.left += digitalAxis.options.elementWidth
    }

    function draw(plot, ctx) {
        let placeholder = plot.getPlaceholder();
        let tree = placeholder.find(`#${ELEMENT_ID}`);
        if (initialize) {
            if (tree.length) {
                tree[0].remove();
            }
            tree = createTree(plot);
            placeholder.append(tree);
            initialize = false;
        } else {
            if (tree.length) {
                positionTree(plot, tree);
            }
        }
    }

    function positionTree(plot, tree) {
        let plotOffset = plot.getPlotOffset();
        tree.css({
            'top': plotOffset.top,
            'bottom': plotOffset.bottom
        });

        let digitalAxis = getDigitalAxis(plot);
        let buses = plot.getOptions().buses;
        let busElements = tree.find('.flot-digital-axis-bus');
        for (let i = 0; i < busElements.length; i++) {
            let busElement = $(busElements[i]);
            let label = busElement.find('span').text();
            let bus = buses.find(bus => bus.label === label);
            if (bus) {
                let y1 = digitalAxis.p2c(bus.top);
                let y2 = digitalAxis.p2c(bus.bottom);
                busElement.css({
                    'top': y1,
                    'height': y2 - y1
                });
            }
        }

        let data = plot.getData();
        let signalElements = tree.find('.flot-digital-axis-signal');
        for (let i = 0; i < signalElements.length; i++) {
            let signalElement = $(signalElements[i]);
            let label = signalElement.find('span').text();
            let series = data.find(series => series.label === label);
            if (series) {
                let y1 = digitalAxis.p2c(series.digitalWaveform.signal.top);
                let y2 = digitalAxis.p2c(series.digitalWaveform.signal.bottom);
                signalElement.css({
                    'top': y1,
                    'height': y2 - y1
                });
            }
        }
    }
    
    function createTree(plot) {
        const tree = $(`<div id="${ELEMENT_ID}"></div>`);
        let digitalAxis = getDigitalAxis(plot);
        let plotOffset = plot.getPlotOffset();
        tree.css({
            'width': `${digitalAxis.options.elementWidth}px`,
            'position': 'absolute',
            'top': plotOffset.top,
            'bottom': plotOffset.bottom,
            'overflow': 'hidden'
        });

        let data = plot.getData();
        let buses = plot.getOptions().buses;

        buses.forEach((bus, index) => {
            if (bus.visible) {
                let signals = data.filter(series => series.digitalWaveform.signal.bus === index);
                let expanded = signals.some(series => series.digitalWaveform.signal.visible);
                let onShowHideSignals = () => {
                    initialize = true;
                    expanded ? plot.collapseBus(bus) : plot.expandBus(bus);
                    plot.setupGrid(true);
                    plot.draw();
                }

                let symbol = expanded ? digitalAxis.options.busSymbolExpanded : digitalAxis.options.busSymbolCollapsed;
                let busElement = createBusTreeItem(digitalAxis.p2c(bus.top), digitalAxis.p2c(bus.bottom), bus.label, symbol, expanded, onShowHideSignals);
                tree.append(busElement);

                signals.forEach(series => {
                    if (series.digitalWaveform.signal.visible) {
                        createSignalEntry(tree, series, data, digitalAxis, true);
                    }
                });
            }
        });

        let unassignedSignals = data.filter(series => !buses[series.digitalWaveform.signal.bus]);
        unassignedSignals.forEach(series => {
            if (series.digitalWaveform.signal.visible) {
                createSignalEntry(tree, series, data, digitalAxis, false);
            }
        })

        return tree;
    }

    function createSignalEntry(tree, series, data, digitalAxis, assignedToBus) {
        let signal = series.digitalWaveform.signal;
        let symbol = digitalAxis.options.signalSymbol;
        let signalElement = createSignalTreeItem(digitalAxis.p2c(signal.top), digitalAxis.p2c(signal.bottom), series.label, symbol, assignedToBus);
        tree.append(signalElement);
    }

    function createBusTreeItem(y1, y2, label, symbol, expanded, onShowHideSignals) {
        let container = createTreeItemContainer(y1, y2);
        container.addClass('flot-digital-axis-bus');
        let symbolElement = createTreeItemSymbol(expanded ? 'arrow-up' : 'arrow-down', symbol);
        symbolElement.css({
            'cursor': 'pointer'
        });
        symbolElement.click(onShowHideSignals);
        symbolElement.appendTo(container);
        createTreeItemLabel(label).appendTo(container);
        return container;
    }

    function createSignalTreeItem(y1, y2, label, symbol, indented) {
        let container = createTreeItemContainer(y1, y2);
        container.addClass('flot-digital-axis-signal');
        if (indented) {
            container.css('padding-left', '25px');
        }

        createTreeItemSymbol('digital-signal', symbol).appendTo(container);
        createTreeItemLabel(label).appendTo(container);
        return container;
    }

    function createTreeItemContainer(y1, y2) {
        let container = $('<div>', {
            css: {
                'position': 'absolute',
                'top': y1,
                'height': y2 - y1,
                'display': 'flex',
                'align-items': 'center'
            }
        });

        return container;
    }

    function createTreeItemLabel(text) {
        let container = $('<div>', {
            css: {
                'order': 2,
                'white-space': 'nowrap'
            }
        }).append($('<span>', {
            html: text
        }));

        return container;
    }

    function createTreeItemSymbol(symbol, html) {
        let symbolToSvgPath = (symbol) => {
            switch (symbol) {
                case 'arrow-down':
                    return 'M10 25 L 50 75 L 90 25';
                case 'arrow-up':
                    return 'M10 75 L 50 25 L 90 75';
                case 'digital-signal':
                    return 'M0 80 L 50 80 L 50 20 L 100 20';
                default:
                    return null;
            }
        }

        let container = $('<div>', {
            css: {
                'order': 1,
                'display': 'flex',
                'align-items': 'center',
                'margin-right': '10px'
            }
        });

        if (html) {
            container.append(html);
        } else {
            container.css('width', '12px');

            let svg = $(document.createElementNS("http://www.w3.org/2000/svg", "svg"));
            svg.css({
                'width': '100%',
                'height': '100%'
            });
            svg.attr({
                'viewBox': '0 0 100 100'
            });
            svg.appendTo(container);

            let path = $(document.createElementNS("http://www.w3.org/2000/svg", "path"));
            path.attr({
                'stroke': 'black',
                'stroke-width': 15,
                'fill': 'transparent',
                'd': symbolToSvgPath(symbol)
            });
            path.appendTo(svg);
        }

        return container;
    }

    let defaultOptions = {
        yaxis: {
            width: 'automatic'
        }
    };

    $.plot.plugins.push({
        init: init,
        options: defaultOptions,
        name: 'digitalAxis',
        version: '1.0'
    });
})(jQuery);
