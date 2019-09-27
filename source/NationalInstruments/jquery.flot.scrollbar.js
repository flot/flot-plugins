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
                    color: 'rgb(195, 195, 195)'
                }
            }
        }

        constructor(plot, options) {
            this._plot = plot;
            this._options = options.scrollbar;
            this._scrolling = false;
            this._movingLeft = false;
            this._movingRight = false;
            this._disableMoveLeft = false;
            this._disableMoveRight = false;
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
            return '<div class="flot-scrollbar-outer-container">' +
                    '<div class="flot-scrollbar-move-left">' +
                        '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink style="width:100%;height:100%" viewBox="0 0 24 24">' +
                            '<polyline points="8,12 13,7 13,17" shape-rendering="crispEdges"/>' +
                        '</svg>' +
                    '</div>' +
                    '<div class="flot-scrollbar-container">' +
                        '<div class="flot-scrollbar">' +
                            '<div class="flot-scrollbar-left-handle"></div>' +
                            '<div class="flot-scrollbar-right-handle"></div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="flot-scrollbar-move-right">' +
                        '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink style="width:100%;height:100%" viewBox="0 0 24 24">' +
                            '<polyline points="17,12 11,7 11,17" shape-rendering="crispEdges"/>' +
                        '</svg>' +
                    '</div>' +
                '</div>'
        }

        _createElement() {
            const outerContainer = $(this.template)
                .css({
                    position: 'absolute',
                    bottom: 0,
                    height: this._options.height + 'px',
                    backgroundColor: this.backgroundColor,
                    display: 'flex'
                });

            this._moveLeftButton = outerContainer.find('.flot-scrollbar-move-left')
                .css({
                    height: this._options.height + 'px',
                    width: '18px',
                    flex: '0 0 auto'
                })
                .hover(() => this._moveButtonHoverIn(this._moveLeftButton, this._disableMoveLeft), () => this._moveButtonHoverOut(this._moveLeftButton))
                .on('mousedown', () => this._moveButtonMouseDown(this._moveLeftButton))
                .on('mouseup mouseleave', () => this._moveButtonMouseUp(this._moveLeftButton));

            this._moveRightButton = outerContainer.find('.flot-scrollbar-move-right')
                .css({
                    height: this._options.height + 'px',
                    width: '18px',
                    flex: '0 0 auto'
                })
                .hover(() => this._moveButtonHoverIn(this._moveRightButton, this._disableMoveRight), () => this._moveButtonHoverOut(this._moveRightButton))
                .on('mousedown', () => this._moveButtonMouseDown(this._moveRightButton))
                .on('mouseup mouseleave', () => this._moveButtonMouseUp(this._moveRightButton));

            this._container = outerContainer.find('.flot-scrollbar-container')
                .css({
                    flex: '1 0 auto',
                    boxSizing: 'border-box',
                    padding: '2px 0'
                })
                .dblclick(() => this._plot.recenter({ axes: [this.xaxis] }))
                .on('mouseup', (e) => this._containerMouseClick(e));

            this._scrollbar = this._container.find('.flot-scrollbar')
                .css({
                    position: 'relative',
                    height: '100%',
                    backgroundColor: this.scrollbarColor
                })
                .hover(() => this._scrollbarHoverIn(), () => this._scrollbarHoverOut())
                .on('mousedown', (e) => this._scrollbarMouseDown(e, true, true));

            this._leftHandle = this._scrollbar.find('.flot-scrollbar-left-handle')
                .css({
                    position: 'absolute',
                    height: '100%',
                    width: HANDLE_WIDTH + 'px',
                    left: 0,
                    opacity: 0,
                    zIndex: 1,
                    cursor: 'ew-resize'
                })
                .hover(() => this._scrollbarHoverIn(), () => this._scrollbarHoverOut())
                .on('mousedown', (e) => this._scrollbarMouseDown(e, true, false));

            this._rightHandle = this._scrollbar.find('.flot-scrollbar-right-handle')
                .css({
                    position: 'absolute',
                    height: '100%',
                    width: HANDLE_WIDTH + 'px',
                    right: 0,
                    opacity: 0,
                    zIndex: 1,
                    cursor: 'ew-resize'
                })
                .hover(() => this._scrollbarHoverIn(), () => this._scrollbarHoverOut())
                .on('mousedown', (e) => this._scrollbarMouseDown(e, false, true));

            return outerContainer;
        }

        _scrollbarHoverIn() {
            if (!this._scrolling) {
                this._scrollbar.css('backgroundColor', this.scrollbarHoverColor);
            }
        }

        _scrollbarHoverOut() {
            if (!this._scrolling) {
                this._scrollbar.css('backgroundColor', this.scrollbarColor);
            }
        }

        _moveButtonHoverIn(moveButton, disabled) {
            if (!disabled) {
                moveButton.css('backgroundColor', this.moveButtonHoverColor);
            }
        }

        _moveButtonHoverOut(moveButton) {
            moveButton.css('backgroundColor', 'unset');
        }

        _setMoveButtonColors(moveButton, disabled, moving) {
            if (moving && !disabled) {
                moveButton.css('fill', this.backgroundColor);
                moveButton.css('backgroundColor', this.scrollbarMoveColor);
            } else {
                moveButton.css('fill', disabled ? this.moveButtonDisabledColor : this.moveButtonColor);
                if (moveButton.is(':hover') && !disabled) {
                    this._moveButtonHoverIn(moveButton, disabled);
                } else {
                    this._moveButtonHoverOut(moveButton);
                }
            }
        }

        get moveAmount() {
            return this._scrollbar.width() * 0.1;
        }

        _moveButtonMouseDown(moveButton) {
            let disabled, moveAmount;
            if (moveButton === this._moveLeftButton) {
                disabled = this._disableMoveLeft;
                this._movingLeft = !disabled;
                moveAmount = -this.moveAmount;
            } else if (moveButton === this._moveRightButton) {
                disabled = this._disableMoveRight;
                this._movingRight = !disabled;
                moveAmount = this.moveAmount;
            }

            if (!disabled) {
                this._setMoveButtonColors(moveButton, disabled, true);
                this._move(moveAmount);
                this._moveTimeout = setTimeout(() => {
                    this._moveInterval = setInterval(() => {
                        this._move(moveAmount);
                    }, 50);
                }, 500);
            }
        }

        _moveButtonMouseUp(moveButton) {
            clearTimeout(this._moveTimeout);
            clearInterval(this._moveInterval);
            
            let disabled;
            if (moveButton === this._moveLeftButton) {
                this._movingLeft = false;
                disabled = this._disableMoveLeft;
            } else if (moveButton === this._moveRightButton) {
                this._movingRight = false;
                disabled = this._disableMoveRight;
            }

            this._setMoveButtonColors(moveButton, disabled, false);
        }

        _containerMouseClick(event) {
            if (!this._scrolling) {
                const x = event.pageX - this._container.offset().left;
                const currentX = this._scrollbar.offset().left - this._container.offset().left + this._scrollbar.width() / 2;
                const amount = x - currentX;
                this._move(amount);
            }
        }

        _scrollbarMouseDown(event, moveLeft, moveRight) {
            if (!(moveLeft && moveRight)) {
                event.stopPropagation();
            }
            this._startScrolling(moveLeft, moveRight);
            const startx = event.pageX;
            const width = this._scrollbar.width();
            const startLeft = this._scrollbar.offset().left - this._container.offset().left;
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
            this._scrollbar.css('backgroundColor', this.scrollbarMoveColor);

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
                this._scrollbarHoverIn();
            } else {
                this._scrollbarHoverOut();
            }
        }

        _move(amount) {
            const left = this._scrollbar.offset().left - this._container.offset().left + amount;
            const right = left + this._scrollbar.width();
            const { left: newLeft, right: newRight } = this._clipScrollbar(left, right, true, true);
            this._moveScrollbar(newLeft, newRight);
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
                const width = this._container.width();
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
            const width = this._container.width();
            const xaxis = this.xaxis;
            const range = Math.abs(xaxis.datamax - xaxis.datamin);
            const left = xaxis.min / range * width;
            const right = xaxis.max / range * width;
            
            this._scrollbar.css({
                left: left,
                width: right - left,
            });

            this._disableMoveLeft = left === 0;
            this._setMoveButtonColors(this._moveLeftButton, this._disableMoveLeft, this._movingLeft);
            this._disableMoveRight = right === width;
            this._setMoveButtonColors(this._moveRightButton, this._disableMoveRight, this._movingRight);
        }

        get xaxis() {
            return this._plot.getXAxes()[0];
        }

        _render() {
            const placeholder = this._plot.getPlaceholder();
            this._outerContainer = $('.flot-scrollbar-outer-container');
            if (!this._outerContainer.length) {
                this._outerContainer = this._createElement().appendTo(placeholder);
            }

            this._outerContainer.css({
                left: this._plot.getPlotOffset().left,
                width: this._plot.width() + 'px',
                height: this._options.height + 'px',
            });

            this._positionScrollbar();
        }

        get backgroundColor() {
            return this._options.backgroundColor;
        }
        
        get scrollbarColor() {
            return this._options.color;
        }
        
        get scrollbarHoverColor() {
            return $.color.parse(this.scrollbarColor).scale('rgb', 0.85).toString();
        }

        get scrollbarMoveColor() {
            return $.color.parse(this.scrollbarColor).scale('rgb', 0.6).toString();
        }

        get moveButtonColor() {
            return $.color.parse(this.scrollbarColor).scale('rgb', 0.5).toString();
        }

        get moveButtonHoverColor() {
            return this.scrollbarColor;
        }
        
        get moveButtonDisabledColor() {
            return this.scrollbarHoverColor;
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
