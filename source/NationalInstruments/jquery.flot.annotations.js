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
/* Flot plugin for adding annotations to the graph
*/

/*global jQuery*/

(function ($) {
    'use strict';

    class Annotations {
        static get defaultOptions () {
            return [];
        }

        static get defaultAnnotationOptions () {
            return {
                show: false,
                location: 'relative', // how the location is interpreted - relative or absolute
                x: 0, // x position of annotation
                y: 0, // y position of annotation
                label: '', // string content of annotation (may contain newlines)
                showArrow: false, // show an arror pointing to location
                arrowDirection: '', // direction of arrow, values are compass directiond '', 'n', 's', 'e', 'w', 'ne', 'nw', 'se','sw', 
                                    // if the value is empty then the arrow will default based on which quadrant of the graph x & y are
                contentFormatter: c => c, // a format function for the content
                borderColor: '#000000', // border color
                borderThickness: 1, // border thickness in pixels
                backgroundColor: '#ffffff', // background color
                font: '', // font for text
                color: '#000000', // text color
                textAlign: 'left', // text alignment 'left', 'center', 'right'
                arrowLength: 20, // length of callout arrow
                arrowWidth: 5, // width of callout arrow where it meets the box
                padding: 5 // padding for text inside box
            }
        }

        constructor(plot, options) {
            this._plot = plot;
            this._annotations = [];
            this._processOptions(options);
            this._createHooks(plot);
        }

        _createAnnotation (options) {
            let destination = Annotations.defaultAnnotationOptions;
            Object.keys(options).forEach(function (key) {
                destination[key] = options[key];
            });
    
            return destination;
        }

        _createHooks(plot) {
            plot.hooks.drawOverlay.push((plot, ctx, overlay) => {
                this._drawOverlay(plot, ctx, overlay)
            });
        }

        _processOptions(options) {
            if (options.series && options.series.annotations) {
                options.series.annotations.forEach((options) => {
                    this.addAnnotation(options, false);
                });
            }
        }

        addAnnotation (options, redraw) {
            var currentAnnotation = this._createAnnotation(options);
            this._annotations.push(currentAnnotation);
            if (redraw !== false) {
                this._plot.triggerRedrawOverlay();
            }
        }

        removeAnnotation (annotation, redraw) {
            const index = this._annotations.findIndex((a) => {
                let found = true;
                Object.keys(annotation).forEach((k) => {
                    if (a[k] !== annotation[k]) {
                        found = false;
                    }
                });

                return found;
            });

            if (index !== -1) {
                this._annotations.splice(index, 1);
            }

            if (redraw !== false) {
                this._plot.triggerRedrawOverlay();
            }
        }

        getAnnotations () {
            return this._annotations;
        }

        _drawOverlay(plot, ctx) {
            const series = plot.getData();
            this._lineHeight = this._getLineHeight(plot);
            const plotOffset = plot.getPlotOffset();
            ctx.save();
            ctx.translate(plotOffset.left, plotOffset.top);
            for (let i = 0; i < this._annotations.length; i++) {
                if (!this._annotations[i].show) {
                    continue;
                }

                let formattedText = this._annotations[i].contentFormatter(this._annotations[i].label);
                let offset = this._calcOffset(plot, ctx, this._annotations[i]);
                let bounds = this._drawBox(plot, ctx, this._annotations[i], formattedText, offset);
                this._drawArrow(plot, ctx, this._annotations[i], offset);
                this._drawContent(plot, ctx, this._annotations[i], formattedText, bounds);
            }

            ctx.restore();
        }

        _defaultArrowDirection (plot, x, y) {
            let arrowDirn;
            let relX = x / plot.width();
            let relY = y / plot.height();
            if (relX < 0.5 && relY < 0.5) {
                arrowDirn = 'se';
            } else if (relX > 0.5 && relY < 0.5) {
                arrowDirn = 'sw';
            } else if (relX < 0.5 && relY > 0.5) {
                arrowDirn = 'ne';
            } else {
                arrowDirn = 'nw';
            }

            return arrowDirn;
        }

        _calcOffset(plot, ctx, annotation) {
            let offset = {x: 0, y: 0};
            if (!annotation.showArrow) {
                return offset;
            }

            let x = annotation.x;
            let y = annotation.y;
            let xaxis = plot.getXAxes()[0];
            let yaxis = plot.getYAxes()[0];
            let arrowDirn = annotation.arrowDirection;
            if (annotation.location === 'absolute') {
                x = xaxis.p2c(annotation.x);
                y = yaxis.p2c(annotation.y);
            } else {
                x = annotation.x * plot.width();
                y = annotation.y * plot.height();
            }

            if (arrowDirn === '') {
                arrowDirn = this._defaultArrowDirection(plot, x, y);
            }

            let al = annotation.arrowLength;
            if (arrowDirn.includes('n')) {
                offset.y = -al;
            }
            if (arrowDirn.includes('s')) {
                offset.y = al;
            }
            if (arrowDirn.includes('e')) {
                offset.x = -al;
            }
            if (arrowDirn.includes('w')) {
                offset.x = al;
            }

            return offset;
        }


        _drawArrow(plot, ctx, annotation, offset) {
            if (!annotation.showArrow) {
                return;
            }

            let edge1;
            let edge2;
            let arrowDirn = annotation.arrowDirection;
            let x = annotation.x;
            let y = annotation.y;
            let xaxis = plot.getXAxes()[0];
            let yaxis = plot.getYAxes()[0];
            if (annotation.location === 'absolute') {
                x = xaxis.p2c(annotation.x);
                y = yaxis.p2c(annotation.y);
            } else {
                x = annotation.x * plot.width();
                y = annotation.y * plot.height();
            }

            if (arrowDirn === '') {
                arrowDirn = this._defaultArrowDirection(plot, x, y);
            }

            let aw = annotation.arrowWidth;
            switch (arrowDirn) {
                case 'n':
                    edge1 = {x: offset.x + aw, y: offset.y - 1};
                    edge2 = {x: offset.x - aw, y: offset.y - 1};
                    break;
                case 's':
                    edge1 = {x: offset.x + aw, y: offset.y + 1};
                    edge2 = {x: offset.x - aw, y: offset.y + 1};
                    break;
                case 'e':
                    edge1 = {y: offset.y + aw, x: offset.x};
                    edge2 = {y: offset.y - aw, x: offset.x};
                   break;
                case 'w':
                    edge1 = {y: offset.y + aw, x: offset.x};
                    edge2 = {y: offset.y - aw, x: offset.x};
                    break;
                case 'ne':
                    edge1 = {x: offset.x, y: offset.y - aw};
                    edge2 = {x: offset.x + aw, y: offset.y};
                    break;
                case 'nw':
                    edge1 = {x: offset.x, y: offset.y - aw};
                    edge2 = {x: offset.x - aw, y: offset.y};
                    break;
                case 'se':
                    edge1 = {x: offset.x + aw, y: offset.y};
                    edge2 = {x: offset.y, y: offset.y + aw};
                    break;
                case 'sw':
                    edge1 = {x: offset.x - aw, y: offset.y};
                    edge2 = {x: offset.x, y: offset.y  + aw};
                    break;
            }

            ctx.save();
            ctx.fillStyle = annotation.backgroundColor;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + edge1.x, y + edge1.y);
            ctx.lineTo(x + edge2.x, y + edge2.y);
            ctx.fill();
            ctx.restore();
            ctx.save();
            ctx.strokeStyle = annotation.borderColor;
            ctx.lineWidth = annotation.borderThickness;
            ctx.beginPath();
            ctx.moveTo(x + edge1.x, y + edge1.y);
            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x + edge2.x, y + edge2.y);
            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.restore();
        }

        _lineCount (str) {
            return str.split('<br>').length;
        } 

        _lineWidth (ctx, str) {
            let lines = str.split('<br>');
            let longest = {width: 0};
            for (let i = 0; i < lines.length; i++) {
                let size = ctx.measureText(lines[i]);
                if (size.width > longest.width) {
                    longest = size;
                }
            }

            return longest;
        }

        _getLineHeight (plot) {
            let surface = plot.getSurface();
            let styles = window.getComputedStyle(surface.element);
            let lineHeight = parseFloat(styles['lineHeight']);
            return lineHeight;
        }

        _drawBox (plot, ctx, annotation, formattedText, offset) {
            let x = annotation.x;
            let y = annotation.y;
            let xaxis = plot.getXAxes()[0];
            let yaxis = plot.getYAxes()[0];
            let arrowDirn = annotation.arrowDirection;
            let lineCount = this._lineCount(formattedText);
            if (annotation.location === 'absolute') {
                x = xaxis.p2c(annotation.x);
                y = yaxis.p2c(annotation.y);
            } else {
                x = annotation.x * plot.width();
                y = annotation.y * plot.height();
            }

            let padding = annotation.padding;
            x += offset.x;
            y += offset.y;
            let size = this._lineWidth(ctx, formattedText);
            let width = size.width + 2 * padding;
            let height = lineCount * this._lineHeight + 2 * padding;

            if (arrowDirn === '') {
                arrowDirn = this._defaultArrowDirection(plot, x, y);
            }

            switch (arrowDirn) {
                case 'n':
                    x = x - width / 2;
                    y = y - height;
                    break;
                case 's':
                    x = x - width / 2;
                    break;
                case 'e':
                    x = x - width;
                    y = y - height / 2;
                    break;
                case 'w':
                    y = y - height / 2;
                    break;
                case 'ne':
                    y = y - height;
                    break;
                case 'nw':
                    x = x - width;
                    y = y - height;
                    break;
                case 'se':
                    break;
                case 'sw':
                    x = x - width;
                    break;
            }

            ctx.save();
            ctx.strokeStyle = annotation.borderColor;
            ctx.fillStyle = annotation.backgroundColor;
            ctx.lineWidth = annotation.borderThickness;
            ctx.beginPath();
            ctx.fillRect(x, y, width, height);
            ctx.strokeRect(x, y, width, height);
            ctx.restore();

            return {x: x, y: y, width: width, height: height};
        }

        _drawContent (plot, ctx, annotation, formattedText, bounds) {
            let lines = formattedText.split('<br>');
            let padding = annotation.padding;
            ctx.save();
            ctx.font = annotation.font;
            ctx.fillStyle = annotation.color;
            ctx.textAlign = annotation.textAlign;
            let top = bounds.y + padding;
            let left = bounds.x + padding;
            if (annotation.textAlign === 'right') {
                left += bounds.width - 2 * padding;
            } else if (annotation.textAlign === 'center') {
                left += bounds.width / 2 - padding;
            }

            for (let i = 0; i < lines.length; i++) {
                let size = ctx.measureText(lines[i]);
                ctx.fillText(lines[i], left, top+ (size.actualBoundingBoxAscent + size.actualBoundingBoxDescent));
                top = top + this._lineHeight;
            }

            ctx.restore();
        }
    };

    function init(plot) {
        let annotations;

        plot.hooks.processOptions.push((plot, options) => {
            if (options.series.annotations) {
                annotations = new Annotations(plot, options);
            }
        });

        plot.getAnnotations = function () {
            return annotations.getAnnotations();
        }

        plot.addAnnotation = function (options) {
            if (!annotations) {
                annotations = new Annotations(this, options);
            }

            annotations.addAnnotation(options, true);
        }

        plot.removeAnnotation = function (options) {
            if (!annotations) {
                return;
            }

            annotations.removeAnnotation(options, true);
        }
    }

    $.plot.plugins.push({
        init: init,
        options: Annotations.defaultOptions,
        name: 'annotations',
        version: '1.0'
    });
})(jQuery);
