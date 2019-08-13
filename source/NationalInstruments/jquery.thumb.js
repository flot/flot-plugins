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
/* Flot plugin used by flot-cursors-plugin and flot-axishandle-plugin
*/

/*global jQuery*/

(function ($) {
    'use strict';

    $.thumb = {};

    var currentState;

    $.thumb.createSVGLayer = function (placeholder, eventHolder) {
        if (placeholder && placeholder.find('.flot-thumbs')[0]) {
            return placeholder.find('.flot-thumbs')[0].firstChild;
        }

        var SVGContainer = document.createElement('div');
        SVGContainer.className = 'flot-thumbs';
        SVGContainer.style.position = 'absolute';
        SVGContainer.style.top = '0px';
        SVGContainer.style.left = '0px';
        SVGContainer.style.width = '100%';
        SVGContainer.style.height = '100%';
        SVGContainer.style.pointerEvents = 'none';

        // put the container in the dom so its gets its custom styles
        if (placeholder) {
            placeholder.append(SVGContainer);
        } else {
            document.body.appendChild(SVGContainer);
        }

        var svgLayer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svgLayer.setAttributeNS(null, 'width', '100%');
        svgLayer.setAttributeNS(null, 'height', '100%');

        // check if there is a custom icon, if so replace the standard icon
        var customIcon = window.getComputedStyle(SVGContainer).getPropertyValue('--customIcon');
        customIcon = (customIcon || '').trim();
        var customIconTextBoundary = window.getComputedStyle(SVGContainer).getPropertyValue('--customIconTextBoundary');
        customIconTextBoundary = (customIconTextBoundary || '').trim();

        // if a custom icon is specified use it, otherwise use the default icon
        var thumbIcon = customIcon || (
            '<symbol id="round" viewBox="0 0 50 50">' +
                '<polyline points="25,0 40,20 10,20 25,0"></polyline>' +
                '<circle cx="25" cy="25" r="20"/>' +
            '</symbol>'
        );

        // if custom boundary is specified use it.
        var thumbTextBoundary = customIconTextBoundary;
        // if we are using the default icon and no custom boundary is specified
        if (customIconTextBoundary === '' && customIcon === '') {
            thumbTextBoundary =
                '<symbol id="round" viewBox="0 0 50 50">' +
                    '<circle cx="25" cy="25" r="20"/>' +
                '</symbol>'
        }
        // if we still don't have a boundary, fallback on the icon itself
        if (thumbTextBoundary === '') {
            thumbTextBoundary = thumbIcon;
        }

        var svgThumbsSymbols =
            '<defs xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">' +
                thumbIcon +
                thumbTextBoundary +
                '<symbol id="l_round" viewBox="0 0 50 50">' +
                    '<use xlink:href="#round" x="0" y="0" width="50" height="50" transform="rotate(90 25 25)"/>' +
                '</symbol>' +
                '<symbol id="r_round" viewBox="0 0 50 50">' +
                    '<use xlink:href="#round" x="0" y="0" width="50" height="50" transform="rotate(270 25 25)"/>' +
                '</symbol>' +
                '<symbol id="b_round" viewBox="0 0 50 50">' +
                    '<use xlink:href="#round" x="0" y="0" width="50" height="50" transform="rotate(0 25 25)"/>' +
                '</symbol>' +
                '<symbol id="t_round" viewBox="0 0 50 50">' +
                    '<use xlink:href="#round" x="0" y="0" width="50" height="50" transform="rotate(180 25 25)"/>' +
                '</symbol>' +
                '<symbol id="l_tb" viewBox="0 0 50 50">' +
                    '<use xlink:href="#tb" x="0" y="0" width="50" height="50" transform="rotate(90 25 25)" />' +
                "</symbol>" +
                '<symbol id="r_tb" viewBox="0 0 50 50">' +
                    '<use xlink:href="#tb" x="0" y="0" width="50" height="50" transform="rotate(270 25 25)" />' +
                "</symbol>" +
                '<symbol id="b_tb" viewBox="0 0 50 50">' +
                    '<use xlink:href="#tb" x="0" y="0" width="50" height="50" transform="rotate(0 25 25)" />' +
                "</symbol>" +
                '<symbol id="t_tb" viewBox="0 0 50 50">' +
                    '<use xlink:href="#tb" x="0" y="0" width="50" height="50" transform="rotate(180 25 25)" />' +
                "</symbol>" +
            '</defs>';

        var parser = new DOMParser().parseFromString(svgThumbsSymbols, 'image/svg+xml');
        var svgDefs = document.importNode(parser.documentElement, true);
        // force any customIcon to have 'round' id
        svgDefs.children[0].setAttribute('id', 'round');
        svgDefs.children[1].setAttribute('id', 'tb');
        svgLayer.appendChild(svgDefs);

        SVGContainer.appendChild(svgLayer);

        svgLayer.eventHolder = eventHolder || document;
        bindEvents(svgLayer);

        return svgLayer;
    };

    $.thumb.createThumb = function (options) {
        var opts = {
                size: options.size || 20,
                x: options.x || 0,
                y: options.y || 0,
                svgRoot: options.svgRoot,
                shape: options.shape || 'bottom',
                abbreviation: options.abbreviation || '',
                constraintFunction: options.constraintFunction,
                classList: options.classList ? options.classList.slice() : ['draggable'],
                offset: options.offset || '0',
                fill: options.fill
            },
            thumbIcon = document.createElementNS('http://www.w3.org/2000/svg', 'use'),
            thumbLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text'),
            thumbTextBoundaryBox = document.createElementNS('http://www.w3.org/2000/svg', 'use'),
            thumbGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g'),
            thumbInteractionLayer = document.createElementNS('http://www.w3.org/2000/svg', 'rect'),
            svgLayer = opts.svgRoot,
            radius = opts.size,
            cx = opts.x,
            cy = opts.y,
            moveDirection = '';

        // Set the 'href' attribute using both versions. This is required because in Safari the 'href'
        // attribute is not supported, but 'xlink:href' is.
        function setHrefAttribute(svgElement, attributeValue) {
            svgElement.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', attributeValue);
            svgElement.setAttributeNS('http://www.w3.org/1999/xlink', 'href', attributeValue);
        }
        var offsetX = 0, offsetY = 0;
        switch (opts.shape) {
            case 'left':
                moveDirection = 'y';
                opts.classList.push('left');
                thumbGroup.shape = 'left';
                setHrefAttribute(thumbIcon, '#l_round');
                setHrefAttribute(thumbTextBoundaryBox, '#l_tb');
                // left side needs to reverse the sign
                offsetX = opts.offset[0] === '-' ? opts.offset.substr(1) : '-' + opts.offset;
                break;
            case 'right':
                moveDirection = 'y';
                opts.classList.push('right');
                thumbGroup.shape = 'right';
                setHrefAttribute(thumbIcon, '#r_round');
                setHrefAttribute(thumbTextBoundaryBox, '#r_tb');
                offsetX = opts.offset;
                break;
            case 'bottom':
                moveDirection = 'x';
                opts.classList.push('bottom');
                thumbGroup.shape = 'bottom';
                setHrefAttribute(thumbIcon, '#b_round');
                setHrefAttribute(thumbTextBoundaryBox, '#b_tb');
                offsetY = opts.offset;
                break;
            case 'top':
                moveDirection = 'x';
                opts.classList.push('top');
                thumbGroup.shape = 'top';
                setHrefAttribute(thumbIcon, '#t_round');
                setHrefAttribute(thumbTextBoundaryBox, '#t_tb');
                // top needs to reverse sign
                offsetY = opts.offset[0] === '-' ? opts.offset.substr(1) : '-' + opts.offset;
                break;
            default:
                break;
        }

        thumbIcon.setAttributeNS(null, 'width', 2 * radius);
        thumbIcon.setAttributeNS(null, 'height', 2 * radius);
        thumbIcon.setAttributeNS(null, 'transform', 'translate(' + -radius + ' ' + -radius + ')');
        thumbIcon.setAttributeNS(null, 'x', offsetX);
        thumbIcon.setAttributeNS(null, 'y', offsetY);
        thumbIcon.setAttribute('class', 'thumbIcon');
        thumbIcon.style.fill = opts.fill;

        // thumbTextBoundaryBox should match the symbol position / sizing
        thumbTextBoundaryBox.setAttributeNS(null, 'width', 2 * radius);
        thumbTextBoundaryBox.setAttributeNS(null, 'height', 2 * radius);
        thumbTextBoundaryBox.setAttributeNS(null, 'transform', 'translate(' + -radius + ' ' + -radius + ')');
        thumbTextBoundaryBox.setAttributeNS(null, 'x', offsetX);
        thumbTextBoundaryBox.setAttributeNS(null, 'y', offsetY);

        // thumb label positioning calculated via thumbTextBoundaryBox.
        thumbLabel.setAttributeNS(null, 'text-anchor', 'middle');
        thumbLabel.setAttributeNS(null, 'dominant-baseline', 'middle');
        thumbLabel.setAttributeNS(null, 'lengthAdjust', 'spacingAndGlyphs');
        thumbLabel.setAttribute('class', 'thumbLabel');
        thumbLabel.textContent = opts.abbreviation;
        thumbLabel.style.pointerEvents = 'none';

        thumbGroup.appendChild(thumbIcon);
        thumbGroup.appendChild(thumbTextBoundaryBox);
        thumbGroup.appendChild(thumbLabel);

        thumbGroup.setAttributeNS(null, 'transform', 'translate(' + cx + ' ' + cy + ')');
        thumbGroup.setAttribute('class', 'thumb');
        thumbGroup.classList.add(moveDirection);

        if (opts.classList) {
            for (var i = 0; i < opts.classList.length; i++) {
                if (opts.classList[i] !== '') {
                    thumbGroup.classList.add(opts.classList[i]);
                }
            }
        }

        thumbGroup.style.pointerEvents = 'all';
        thumbGroup.addEventListener('mousedown', selectElement, false);
        thumbGroup.addEventListener('touchstart', selectElement, false);
        $(thumbGroup).click(reorderThumbs);

        thumbGroup.constraintFunction = opts.constraintFunction;
        svgLayer.appendChild(thumbGroup);

        // thumb interaction layer
        const bbox = thumbIcon.getBBox();
        thumbInteractionLayer.setAttributeNS(null, 'width', bbox.width);
        thumbInteractionLayer.setAttributeNS(null, 'height', bbox.height);
        thumbInteractionLayer.setAttributeNS(null, 'x', bbox.x);
        thumbInteractionLayer.setAttributeNS(null, 'y', bbox.y);
        thumbInteractionLayer.setAttributeNS(null, 'transform', 'translate(' + -radius + ' ' + -radius + ')');
        thumbInteractionLayer.setAttribute('pointer-events', 'all');
        thumbInteractionLayer.classList.add('interactionLayer');
        thumbInteractionLayer.style.fill = 'transparent';
        thumbInteractionLayer.style.stroke = 'transparent';
        thumbGroup.appendChild(thumbInteractionLayer);

        // determine where to place the symbol by using the boundarybox
        const boundaryBox = thumbTextBoundaryBox.getBBox();
        const textCenterX = boundaryBox.x + boundaryBox.width / 2;
        const textCenterY = boundaryBox.y + boundaryBox.height / 2;
        thumbGroup.removeChild(thumbTextBoundaryBox);
        thumbLabel.setAttributeNS(null, 'x', textCenterX);
        thumbLabel.setAttributeNS(null, 'y', textCenterY);
        thumbLabel.setAttributeNS(null, 'transform', 'translate(' + -radius + ' ' + -radius + ')');

        if (/word/.test(window.getComputedStyle(thumbLabel).getPropertyValue('--wrap'))) {
            applyWordWrap(thumbLabel, radius * 2);
        } else {
            thumbLabel.setAttributeNS(null, 'textLength', radius);
        }

        return thumbGroup;
    };

    $.thumb.updateComputedXPosition = function (thumb, position) {
        var thumbPositionMatrix = thumb.getCTM();

        const matrix = 'matrix(' +
            thumbPositionMatrix.a + ' ' +
            thumbPositionMatrix.b + ' ' +
            thumbPositionMatrix.c + ' ' +
            thumbPositionMatrix.d + ' ' +
            position + ' ' +
            thumbPositionMatrix.f + ')';
        thumb.setAttribute('transform', matrix);
    };

    $.thumb.updateComputedYPosition = function (thumb, position) {
        var thumbPositionMatrix = thumb.getCTM();

        const matrix = 'matrix(' +
            thumbPositionMatrix.a + ' ' +
            thumbPositionMatrix.b + ' ' +
            thumbPositionMatrix.c + ' ' +
            thumbPositionMatrix.d + ' ' +
            thumbPositionMatrix.e + ' ' +
            position + ')';
        thumb.setAttribute('transform', matrix);
    };

    $.thumb.setHidden = function(thumb, hidden) {
        thumb.style.display = hidden ? 'none' : 'inline';
    };

    $.thumb.shutdown = function(svgRoot) {
        currentState = null;
        unbindEvents(svgRoot);
    };

    function bindEvents(svgRoot) {
        svgRoot.addEventListener('mousemove', moveElement, false);
        svgRoot.addEventListener('touchmove', moveElement, false);
        svgRoot.addEventListener('mouseup', deselectElement, false);
        svgRoot.addEventListener('touchend', deselectElement, false);
    }

    function moveElement(evt) {
        if (!currentState) {
            return;
        }
        if (evt.buttons === 0) {
            // in case the mouse button was released outside the plot area
            deselectElement(evt);
            return;
        }

        var page = getEventXYPosition(evt),
            center = { x: page.X - currentState.deltaHandlingX, y: page.Y - currentState.deltaHandlingY },
            target = extractTarget(evt),
            svgRoot = extractSVGFromTarget(target),
            eventHolder = svgRoot.eventHolder,
            positionHandled = false;

        if (currentState.selectedElement.constraintFunction) {
            [page.X, page.Y, positionHandled] = currentState.selectedElement.constraintFunction(page.X, page.Y, currentState.x, currentState.y, center.x, center.y);
        }

        if (!positionHandled) {
            var currentMatrix = currentState.selectedElement.getCTM(),
                dx = page.X - currentState.x,
                dy = page.Y - currentState.y;
    
            currentMatrix.e += dx;
            currentMatrix.f += dy;
            currentState.selectedElement.transform.baseVal.getItem(0).setMatrix(currentMatrix);
        }

        //update last mouse position
        currentState.x = page.X;
        currentState.y = page.Y;

        bringThumbToFront(currentState.selectedElement);

        evt.preventDefault();
        evt.stopPropagation();

        //dispach new event to update cursor position
        dispatchThumbEvent('thumbmove', evt, eventHolder);
    }

    function deselectElement(evt) {
        var target = extractTarget(evt),
            svgRoot = extractSVGFromTarget(target),
            eventHolder = svgRoot.eventHolder;

        if (currentState) {
            currentState = null;
            svgRoot.style.pointerEvents = 'none';
            eventHolder.dispatchEvent(new CustomEvent('thumbmoveend', { detail: evt }));
        }
    }

    function selectElement(evt) {
        var target = extractTarget(evt),
            svgRoot = extractSVGFromTarget(target),
            eventHolder = svgRoot.eventHolder;
        currentState = null;
        if (target && (target.getAttribute('class').indexOf('draggable') !== -1)) {
            var page = getEventXYPosition(evt),
                box = target.getBoundingClientRect(),
                doc = document.documentElement,
                scrollX = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0),
                scrollY = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);
            currentState = {
                selectedElement: target,
                x: page.X,
                y: page.Y,
                deltaHandlingX: page.X - (box.left + box.right) / 2 - scrollX,
                deltaHandlingY: page.Y - (box.top + box.bottom) / 2 - scrollY
            };
            svgRoot.style.pointerEvents = 'all';
        }

        if (!currentState) {
            return;
        }

        dispatchThumbEvent('thumbmovestart', evt, eventHolder);
    }

    function extractTarget(evt) {
        let target = evt.target;
        let classes = target.getAttribute('class');
        if (classes && classes.includes('interactionLayer')) {
            return target.parentNode;
        }
        return target;
    }

    function extractSVGFromTarget(target) {
        if (target.tagName === 'svg') {
            return target;
        }
        if (target.tagName === 'g') {
            return target.parentNode;
        }
        return null;
    }

    function reorderThumbs(evt) {
        var focusEl = extractTarget(evt),
            thumbsCluster = [];
        if (!focusEl || (focusEl.getAttribute('class').indexOf('thumb') === -1)) {
            return;
        }

        // bring thumb from the bottom of the cluster to top
        thumbsCluster = getThumbCluster(focusEl);
        if (thumbsCluster.length > 0) {
            bringThumbToFront(thumbsCluster[0]);
        }
    }

    // Re-adding the thumb to the svg
    function bringThumbToFront(thumbEl) {
        thumbEl.parentNode.appendChild(thumbEl);
    }

    function getThumbCluster(selectedThumb) {
        var selectedElBBox = selectedThumb.getBoundingClientRect(),
            selLeft = selectedElBBox.left,
            selRight = selectedElBBox.right,
            selTop = selectedElBBox.top,
            selBottom = selectedElBBox.bottom,
            svgLayer = selectedThumb.parentNode;

        var clusterContent = Array.prototype.slice.call(svgLayer.childNodes, 0).filter(function (el) {
            var elBBox = el.getBoundingClientRect(),
                elLeft = elBBox.left,
                elRight = elBBox.right,
                elTop = elBBox.top,
                elBottom = elBBox.bottom;

            if (elBBox.width > 0 && elBBox.height > 0) {
                // true if their boundingbox overlapp
                return (selLeft < elRight &&
                    selRight > elLeft &&
                    selTop < elBottom &&
                    selBottom > elTop);
            } else {
                return false;
            }
        });

        return clusterContent;
    }

    function dispatchThumbEvent(eventType, evt, eventTarget) {
        var page = getEventXYPosition(evt),
            thumbEvent = new CustomEvent(eventType, { detail: evt });
        thumbEvent.pageX = page.X - currentState.deltaHandlingX;
        thumbEvent.pageY = page.Y - currentState.deltaHandlingY;
        thumbEvent.selectedThumb = currentState.selectedElement;
        eventTarget.dispatchEvent(thumbEvent);
    }

    /**
     - getPageXY(e)
     Calculates the pageX and pageY using the screenX, screenY properties of the event
     and the scrolling of the page. This is needed because the pageX and pageY
     properties of the event are not correct while running tests in Edge. */
    function getPageXY(e) {
        // This code is inspired from https://stackoverflow.com/a/3464890
        var doc = document.documentElement,
            pageX = e.clientX + (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0),
            pageY = e.clientY + (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);
        return { X: pageX, Y: pageY };
    }

    function getEventXYPosition(evt) {
        var page;
        if (evt.touches) {
            page = {
                X: evt.touches[0].pageX,
                Y: evt.touches[0].pageY
            }
        } else {
            page = getPageXY(evt);
        }
        return page;
    }

    function unbindEvents(svgRoot) {
        Array.prototype.forEach.call(svgRoot.childNodes, function (el) {
            if (el.classList.contains('thumb')) {
                el.removeEventListener('mousedown', selectElement);
                el.removeEventListener('touchstart', selectElement);
            }
        });
        svgRoot.removeEventListener('mousemove', moveElement);
        svgRoot.removeEventListener('touchmove', moveElement);
        svgRoot.removeEventListener('mouseup', deselectElement);
        svgRoot.removeEventListener('touchend', deselectElement);
    }

    /**
     * Wraps the thumb label use the css white-space 'normal' rules
     * (collapse whitespace and wrap)
     * @param {SVGTextElement} thumbLabel the thumb label text element
     * @param {Number} maxWidth the width to wrap on.
     */
    function applyWordWrap(thumbLabel, maxWidth) {
        var width = maxWidth - 8; // 3 px of padding on either side.
        var fontSize = window.getComputedStyle(thumbLabel).fontSize.replace('px', '');
        var text = thumbLabel.textContent;
        var words = text.trim().split(/\s+/);
        if (words.length > 1) {
            // clear the parent text node
            thumbLabel.textContent = '';

            var tempSpan = document.createElementNS('http://www.w3.org/2000/svg', "tspan");
            tempSpan.setAttribute('x', thumbLabel.getAttribute('x'));
            tempSpan.setAttribute('y', thumbLabel.getAttribute('y'));
            tempSpan.setAttribute('pointer-events', 'none');

            tempSpan.setAttribute('font-size', fontSize);
            tempSpan.textContent = words[0];
            thumbLabel.appendChild(tempSpan);

            // iteratively add words to the span until its exceeds max width at which point we wrap
            for (var wordIndex = 1; wordIndex < words.length; wordIndex++) {
                var currentLength = tempSpan.firstChild.textContent.length;

                tempSpan.firstChild.textContent += " " + words[wordIndex];

                if (tempSpan.getComputedTextLength() > width) {
                    tempSpan.firstChild.textContent = tempSpan.firstChild.textContent.slice(0, currentLength);

                    // create a new span based on the first
                    tempSpan = tempSpan.cloneNode(true);
                    thumbLabel.appendChild(tempSpan);
                    tempSpan.textContent = words[wordIndex];
                }
            }

            for (var childIndex = 0; childIndex < thumbLabel.children.length; childIndex++) {
                // center the span by calculating an offset
                const offset = -((fontSize * ((thumbLabel.children.length / 2) - childIndex)) - fontSize / 2);
                thumbLabel.children[childIndex].setAttribute('dy', offset)
            }
        }
    }
})(jQuery);
