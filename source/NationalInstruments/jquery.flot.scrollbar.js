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
/* Flot plugin for adding scrollbars to the graph
*/

/*global jQuery*/

(function ($) {
    'use strict';

    const HANDLE_WIDTH = 10;

    class Scrollbar {
        static get defaultOptions() {
            return {
                scrollbar: {
                    show: false,
                    height: 18,
                    backgroundColor: 'rgb(240, 240, 240)',
                    barColor: 'rgb(195, 195, 195)'
                }
            }
        }

        constructor(plot, options) {
            this._plot = plot;
            this._options = options.scrollbar;
            this._scrolling = false;
            this._createHooks();
        }

        _createHooks() {
            this._plot.hooks.processOffset.push((plot, offset) => {
                this._processOffset(offset);
            });
            this._plot.hooks.draw.push((plot, ctx) => {
                this._render();
            });
        }

        _processOffset(offset) {
            offset.bottom += this._options.height;
        }

        get template() {
            return '<div class="flot-scrollbar-container">' +
                '<div class="flot-scrollbar-left-handle"></div>' +
                '<div class="flot-scrollbar"></div>' +
                '<div class="flot-scrollbar-right-handle"></div>' +
                '</div>'
        }

        _createElement() {
            const container = $(this.template)
                .css({
                    position: 'absolute',
                    bottom: 0,
                    boxSizing: 'border-box',
                    height: this._options.height + 'px',
                    padding: '2px 0',
                    backgroundColor: this._options.backgroundColor
                })
                .dblclick(() => this._plot.recenter({ axes: [this.xaxis] }))
                .on('mouseup', (e) => this._mouseClick(e));

            this._scrollbar = container.find('.flot-scrollbar')
                .css({
                    position: 'absolute',
                    height: 'calc(100% - 4px)',
                    backgroundColor: this._options.barColor
                })
                .hover(() => this._hoverIn(), () => this._hoverOut())
                .on('mousedown', (e) => this._mouseDown(e, true, true));

            this._leftHandle = container.find('.flot-scrollbar-left-handle')
                .css({
                    position: 'absolute',
                    height: 'calc(100% - 4px)',
                    width: HANDLE_WIDTH + 'px',
                    opacity: 0,
                    zIndex: 1,
                    cursor: 'ew-resize'
                })
                .hover(() => this._hoverIn(), () => this._hoverOut())
                .on('mousedown', (e) => this._mouseDown(e, true, false));

            this._rightHandle = container.find('.flot-scrollbar-right-handle')
                .css({
                    position: 'absolute',
                    height: 'calc(100% - 4px)',
                    width: HANDLE_WIDTH + 'px',
                    opacity: 0,
                    zIndex: 1,
                    cursor: 'ew-resize'
                })
                .hover(() => this._hoverIn(), () => this._hoverOut())
                .on('mousedown', (e) => this._mouseDown(e, false, true));

            return container;
        }

        _hoverIn() {
            if (!this._scrolling) {
                const color = $.color.parse(this._options.barColor).scale('rgb', 0.85).toString();
                this._scrollbar.css('backgroundColor', color);
            }
        }

        _hoverOut() {
            if (!this._scrolling) {
                this._scrollbar.css('backgroundColor', this._options.barColor);
            }
        }

        _mouseClick(event) {
            if (!this._scrolling) {
                const x = event.pageX - this._container.offset().left;
                const barWidthHalf = this._scrollbar.width() / 2;
                const left = (x - barWidthHalf);
                const right = (x + barWidthHalf);
                const { left: newLeft, right: newRight } = this._clipScrollbar(left, right, true, true);
                this._moveScrollbar(newLeft, newRight);
            }
        }
        
        _mouseDown(event, moveLeft, moveRight) {
            this._startScrolling(moveLeft, moveRight);
            const startx = event.pageX;
            const width = this._scrollbar.width();
            const startLeft = this._scrollbar.position().left;
            const startRight = startLeft + width;
            $(document.body).on('mousemove', (e) => {
                const dx = e.pageX - startx;
                const left = moveLeft ? startLeft + dx : startLeft;
                const right = moveRight ? startRight + dx : startRight;
                const { left: newLeft, right: newRight } = this._clipScrollbar(left, right, moveLeft, moveRight);
                this._moveScrollbar(newLeft, newRight);
            }).on('mouseup', () => {
                this._stopScrolling();
                $(document.body).off('mousemove').off('mouseup');
            });
        }

        _startScrolling(moveLeft, moveRight) {
            this._scrolling = true;

            const color = $.color.parse(this._options.barColor).scale('rgb', 0.7).toString();
            this._scrollbar.css('backgroundColor', color);

            if (moveLeft) {
                this._rightHandle.hide();
            }

            if (moveRight) {
                this._leftHandle.hide();
            }
        }

        _stopScrolling() {
            this._leftHandle.show();
            this._rightHandle.show();
            this._scrolling = false;
            if (this._scrollbar.is(':hover')) {
                this._hoverIn();
            } else {
                this._hoverOut();
            }
        }

        _clipScrollbar(left, right, moveLeft, moveRight) {
            const min = 0;
            const max = this._container.width();
            const width = this._scrollbar.width();

            if (moveLeft && left < min) {
                left = min;
                if (moveRight) {
                    right = width;
                }
            }

            if (moveRight && right > max) {
                right = max;
                if (moveLeft) {
                    left = max - width;
                }
            }

            return { left: left, right: right };
        }

        _moveScrollbar(left, right) {
            if (right > left && right - left > HANDLE_WIDTH * 2) {
                const width = this._plot.width();
                const xaxis = this.xaxis;
                const range = Math.abs(xaxis.datamax - xaxis.datamin);
                const min = left / width * range;
                const max = right / width * range;

                let offsetBelow = $.plot.saturated.saturate(xaxis.options.offset.below - (xaxis.min - min));
                let offsetAbove = $.plot.saturated.saturate(xaxis.options.offset.above - (xaxis.max - max));

                if (!isFinite(offsetBelow)) {
                    offsetBelow = 0;
                }

                if (!isFinite(offsetAbove)) {
                    offsetAbove = 0;
                }

                xaxis.options.offset = { below: offsetBelow, above: offsetAbove };

                this._plot.setupGrid(true);
                this._plot.draw();
            }
        }

        _positionScrollbar() {
            const width = this._plot.width();
            const xaxis = this.xaxis;
            const range = Math.abs(xaxis.datamax - xaxis.datamin);
            const left = xaxis.min / range * width;
            const right = xaxis.max / range * width;
            
            this._scrollbar.css({
                left: left,
                width: right - left
            });

            this._leftHandle.css({
                left: left - HANDLE_WIDTH / 2
            });

            this._rightHandle.css({
                left: right - HANDLE_WIDTH / 2,
            });
        }

        get xaxis() {
            return this._plot.getXAxes()[0];
        }

        _render() {
            const placeholder = this._plot.getPlaceholder();
            this._container = $('.flot-scrollbar-container');
            if (!this._container.length) {
                this._container = this._createElement().appendTo(placeholder);
            }

            this._container.css({
                left: this._plot.getPlotOffset().left,
                width: this._plot.width() + 'px',
                height: this._options.height + 'px',
            });

            this._positionScrollbar();
        }
    };

    function init(plot) {
        let scrollbar;

        plot.hooks.processOptions.push((plot, options) => {
            if (options.scrollbar && options.scrollbar.show) {
                scrollbar = new Scrollbar(plot, options);
            }
        });

        plot.getScrollbar = function() {
            return scrollbar;
        }
    }

    $.plot.plugins.push({
        init: init,
        options: Scrollbar.defaultOptions,
        name: 'scrollbar',
        version: '1.0'
    });
})(jQuery);
