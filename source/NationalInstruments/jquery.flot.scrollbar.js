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

    const HANDLE_SIZE = 10;
    const Direction = Object.freeze({
        Horizontal: 0,
        Vertical: 1
    });

    class Scrollbar {
        get defaultOptions() {
            return {
                size: 18,
                backgroundColor: 'rgb(240, 240, 240)',
                color: 'rgb(195, 195, 195)',
                direction: 'horizontal'
            }
        }

        constructor(plot, options) {
            this._plot = plot;
            this._options = Object.assign(this.defaultOptions, options);
            this.axis.options.autoScale = 'exact';
            this._scrolling = false;
            this._movingBelow = false;
            this._movingAbove = false;
            this._disableMoveBelow = false;
            this._disableMoveAbove = false;
            this._createHooks();
        }

        get direction() {
            switch (this._options.direction) {
                case 'horizontal':
                    return Direction.Horizontal;
                case 'vertical':
                    return Direction.Vertical;
                default:
                    return Direction.Horizontal;
            }
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
            switch (this.direction) {
                case Direction.Horizontal:
                    offset.bottom += this._options.size;
                    break;
                case Direction.Vertical:
                    offset.left += this._options.size;
                    break;
            }
        }

        get axisRange() {
            return Math.abs(this.axis.datamax - this.axis.datamin);
        }

        _getTemplate(className) {
            const html = '<div class="[className]">' +
                    '<div class="flot-scrollbar-move-below">' +
                        '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink style="width:100%;height:100%" viewBox="0 0 24 24">' +
                            '<polyline points="8,12 13,7 13,17" shape-rendering="crispEdges"/>' +
                        '</svg>' +
                    '</div>' +
                    '<div class="flot-scrollbar-container">' +
                        '<div class="flot-scrollbar">' +
                            '<div class="flot-scrollbar-below-handle"></div>' +
                            '<div class="flot-scrollbar-above-handle"></div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="flot-scrollbar-move-above">' +
                        '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink style="width:100%;height:100%" viewBox="0 0 24 24">' +
                            '<polyline points="17,12 11,7 11,17" shape-rendering="crispEdges"/>' +
                        '</svg>' +
                    '</div>' +
                '</div>'
            return html.replace('[className]', className);
        }

        _createElement(className) {
            const outerContainer = $(this._getTemplate(className))
                .css({
                    position: 'absolute',
                    bottom: 0,
                    backgroundColor: this.backgroundColor,
                    display: 'flex',
                    flexDirection: this.direction === Direction.Horizontal ? 'row' : 'column-reverse'
                });

            this._moveBelowButton = outerContainer.find('.flot-scrollbar-move-below')
                .css({
                    height: this.direction === Direction.Horizontal ? '100%' : '18px',
                    width: this.direction === Direction.Horizontal ? '18px' : '100%',
                    flex: '0 0 auto',
                    transform: this.direction === Direction.Horizontal ? '' : 'rotate(270deg)'
                })
                .hover(() => this._moveButtonHoverIn(this._moveBelowButton, this._disableMoveBelow), () => this._moveButtonHoverOut(this._moveBelowButton))
                .on('mousedown', () => this._moveButtonMouseDown(this._moveBelowButton))
                .on('mouseup mouseleave', () => this._moveButtonMouseUp(this._moveBelowButton));

            this._moveAboveButton = outerContainer.find('.flot-scrollbar-move-above')
                .css({
                    height: this.direction === Direction.Horizontal ? '100%' : '18px',
                    width: this.direction === Direction.Horizontal ? '18px' : '100%',
                    flex: '0 0 auto',
                    transform: this.direction === Direction.Horizontal ? '' : 'rotate(270deg)'
                })
                .hover(() => this._moveButtonHoverIn(this._moveAboveButton, this._disableMoveAbove), () => this._moveButtonHoverOut(this._moveAboveButton))
                .on('mousedown', () => this._moveButtonMouseDown(this._moveAboveButton))
                .on('mouseup mouseleave', () => this._moveButtonMouseUp(this._moveAboveButton));

            this._container = outerContainer.find('.flot-scrollbar-container')
                .css({
                    flex: '1 0 auto',
                    padding: this.direction === Direction.Horizontal ? '2px 0' : '0 2px'
                })
                .dblclick(() => this._plot.recenter({ axes: [this.axis] }))
                .on('mouseup', (e) => this._containerMouseClick(e));

            this._scrollbar = this._container.find('.flot-scrollbar')
                .css({
                    position: 'relative',
                    backgroundColor: this.scrollbarColor
                })
                .hover(() => this._scrollbarHoverIn(), () => this._scrollbarHoverOut())
                .on('mousedown', (e) => this._scrollbarMouseDown(e, true, true));

            this._belowHandle = this._scrollbar.find('.flot-scrollbar-below-handle')
                .css({
                    position: 'absolute',
                    height: this.direction === Direction.Horizontal ? '100%' : HANDLE_SIZE + 'px',
                    width: this.direction === Direction.Horizontal ? HANDLE_SIZE + 'px' : '100%',
                    left: 0,
                    bottom: 0,
                    opacity: 0,
                    zIndex: 1,
                    cursor: this.direction === Direction.Horizontal ? 'ew-resize' : 'ns-resize'
                })
                .hover(() => this._scrollbarHoverIn(), () => this._scrollbarHoverOut())
                .on('mousedown', (e) => this._scrollbarMouseDown(e, true, false));

            this._aboveHandle = this._scrollbar.find('.flot-scrollbar-above-handle')
                .css({
                    position: 'absolute',
                    height: this.direction === Direction.Horizontal ? '100%' : HANDLE_SIZE + 'px',
                    width: this.direction === Direction.Horizontal ? HANDLE_SIZE + 'px' : '100%',
                    right: 0,
                    top: 0,
                    opacity: 0,
                    zIndex: 1,
                    cursor: this.direction === Direction.Horizontal ? 'ew-resize' : 'ns-resize'
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

        get scrollbarSize() {
            return this.direction === Direction.Horizontal ? this._scrollbar.width() : this._scrollbar.height();
        }

        get containerSize() {
            return this.direction === Direction.Horizontal ? this._container.width() : this._container.height();
        }
        
        get moveAmount() {
            return this.scrollbarSize * 0.1;
        }

        _moveButtonMouseDown(moveButton) {
            let disabled, moveAmount;
            if (moveButton === this._moveBelowButton) {
                disabled = this._disableMoveBelow;
                this._movingBelow = !disabled;
                moveAmount = -this.moveAmount;
            } else if (moveButton === this._moveAboveButton) {
                disabled = this._disableMoveAbove;
                this._movingAbove = !disabled;
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
            if (moveButton === this._moveBelowButton) {
                this._movingBelow = false;
                disabled = this._disableMoveBelow;
            } else if (moveButton === this._moveAboveButton) {
                this._movingAbove = false;
                disabled = this._disableMoveAbove;
            }

            this._setMoveButtonColors(moveButton, disabled, false);
        }

        _containerMouseClick(event) {
            if (!this._scrolling) {
                let amount;
                switch (this.direction) {
                    case Direction.Horizontal:
                        const x = event.pageX - this._container.offset().left;
                        const currentX = this._scrollbar.offset().left - this._container.offset().left + this._scrollbar.width() / 2;
                        amount = x - currentX;
                        break;
                    case Direction.Vertical:
                        const y = event.pageY - this._container.offset().top;
                        const currentY = this._scrollbar.offset().top - this._container.offset().top + this._scrollbar.height() / 2;
                        amount = currentY - y;
                        break;
                }

                this._move(amount);
            }
        }

        _scrollbarMouseDown(event, moveBelow, moveAbove) {
            if (!(moveBelow && moveAbove)) {
                event.stopPropagation();
            }
            this._startScrolling(moveBelow, moveAbove);
            const start = this.direction === Direction.Horizontal ? event.pageX : event.pageY;
            const size = this.scrollbarSize;
            let startBelow, startAbove
            switch (this.direction) {
                case Direction.Horizontal:
                    startBelow = this._scrollbar.offset().left - this._container.offset().left;
                    startAbove = this.containerSize - startBelow - size;
                    break;
                case Direction.Vertical:
                    startAbove = this._scrollbar.offset().top - this._container.offset().top;
                    startBelow = this.containerSize - startAbove - size;
                    break;
            }
            $(document.body).on('mousemove', (e) => {
                const d = this.direction === Direction.Horizontal ? start - e.pageX : e.pageY - start;
                const below = moveBelow ? startBelow - d : startBelow;
                const above = moveAbove ? startAbove + d : startAbove;
                const { below: newBelow, above: newAbove } = this._clipScrollbar(below, above, moveBelow, moveAbove);
                this._moveScrollbar(newBelow, newAbove);
            }).on('mouseup', () => {
                this._stopScrolling();
                $(document.body).off('mousemove').off('mouseup');
            });
        }

        _startScrolling(moveBelow, moveAbove) {
            this._scrolling = true;
            this._scrollbar.css('backgroundColor', this.scrollbarMoveColor);

            if (moveBelow) {
                this._aboveHandle.hide();
            }

            if (moveAbove) {
                this._belowHandle.hide();
            }
        }

        _stopScrolling() {
            this._belowHandle.show();
            this._aboveHandle.show();
            this._scrolling = false;
            if (this._scrollbar.is(':hover')) {
                this._scrollbarHoverIn();
            } else {
                this._scrollbarHoverOut();
            }
        }

        _move(amount) {
            let below, above;
            switch (this.direction) {
                case Direction.Horizontal:
                    below = this._scrollbar.offset().left - this._container.offset().left + amount;
                    above = this.containerSize - below - this.scrollbarSize;
                    break;
                case Direction.Vertical:
                    above = this._scrollbar.offset().top - this._container.offset().top - amount;
                    below = this.containerSize - above - this.scrollbarSize;
                    break;
            }
            const { below: newBelow, above: newAbove } = this._clipScrollbar(below, above, true, true);
            this._moveScrollbar(newBelow, newAbove);
        }

        _clipScrollbar(below, above, moveBelow, moveAbove) {
            if (moveBelow && below < 0) {
                below = 0;
                if (moveAbove) {
                    above = this.containerSize - this.scrollbarSize;
                }
            }

            if (moveAbove && above < 0) {
                above = 0;
                if (moveBelow) {
                    below = this.containerSize - this.scrollbarSize;
                }
            }

            return { below: below, above: above };
        }

        _moveScrollbar(below, above) {
            const size = this.containerSize;
            if (Math.abs(size - above - below) > HANDLE_SIZE * 2) {
                const range = this.axisRange;
                let offsetBelow = $.plot.saturated.saturate(below / size * range);
                let offsetAbove = $.plot.saturated.saturate(-above / size * range);

                if (!isFinite(offsetBelow)) {
                    offsetBelow = 0;
                }
                
                if (!isFinite(offsetAbove)) {
                    offsetAbove = 0;
                }
                
                this.axis.options.offset = { below: offsetBelow, above: offsetAbove };

                this._plot.setupGrid(true);
                this._plot.draw();
            }
        }

        _positionScrollbar() {
            const size = this.containerSize;
            const axis = this.axis;
            const range = this.axisRange;
            const below = (axis.min - axis.datamin) / range * size;
            const above = (axis.datamax - axis.max) / range * size;

            switch (this.direction) {
                case Direction.Horizontal:
                    this._scrollbar.css({
                        left: below,
                        width: size - above - below,
                        height: '100%'
                    });
                    break;
                case Direction.Vertical:
                    this._scrollbar.css({
                        top: above,
                        height: size - above - below,
                        width: '100%'
                    });
                    break;
            }

            this._disableMoveBelow = below === 0;
            this._setMoveButtonColors(this._moveBelowButton, this._disableMoveBelow, this._movingBelow);
            this._disableMoveAbove = above === 0;
            this._setMoveButtonColors(this._moveAboveButton, this._disableMoveAbove, this._movingAbove);
        }

        get axis() {
            return this.direction === Direction.Horizontal ? this._plot.getXAxes()[0] : this._plot.getYAxes()[0];
        }

        _render() {
            const className = this.direction === Direction.Horizontal ? 'flot-scrollbar-horizontal' : 'flot-scrollbar-vertical';
            this._outerContainer = $('.' + className);
            if (!this._outerContainer.length) {
                this._outerContainer = this._createElement(className).appendTo(this._plot.getPlaceholder());
            }
            
            switch (this.direction) {
                case Direction.Horizontal:
                    this._outerContainer.css({
                        left: this._plot.getPlotOffset().left,
                        width: this._plot.width() + 'px',
                        height: this._options.size + 'px',
                    });
                    this._scrollbar.css('width', '100%');
                    break;
                case Direction.Vertical:
                    const getBorderWidth = () => {
                        const bw = this._plot.getOptions().grid.borderWidth;
                        return typeof bw === 'object' ? this.direction === Direction.Horizontal ? bw.bottom || 0 : bw.left || 0 : bw;
                    }

                    const getAxisWidth = () => {
                        return this.axis.box ? this.axis.box.width : 0;
                    }
                
                    this._outerContainer.css({
                        top: this._plot.getPlotOffset().top,
                        left: this._plot.getPlotOffset().left - getBorderWidth() - getAxisWidth() - this._options.size,
                        width: this._options.size + 'px',
                        height: this._plot.height() + 'px',
                    });
                    this._scrollbar.css('height', '100%');
                    break;
            }

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
        let scrollbars;

        plot.hooks.processOptions.push((plot, options) => {
            if (Array.isArray(options.scrollbars)) {
                scrollbars = options.scrollbars.map(scrollbarOptions => new Scrollbar(plot, scrollbarOptions));
            }
        });

        plot.getScrollbars = function() {
            return scrollbars;
        }
    }

    $.plot.plugins.push({
        init: init,
        options: { scrollbars: [] },
        name: 'scrollbar',
        version: '1.0'
    });
})(jQuery);
