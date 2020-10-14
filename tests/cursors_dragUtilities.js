// eslint-disable-next-line no-unused-vars
function loadDragSimulators() {
    function doDragStart(dragOptions, simulator) {
        simulator.simulateEvent(simulator.target, "mousedown", dragOptions);
        simulator.simulateEvent(simulator.target.ownerDocument, "mousemove", dragOptions);
    }

    function doDrag(dragOptions, simulator) {
        simulator.simulateEvent(simulator.target.ownerDocument, "mousemove", dragOptions);
    }

    function doDragEnd(dragOptions, simulator) {
        var eventDoc = simulator.target.ownerDocument;
        if ($.contains(eventDoc, simulator.target)) {
            simulator.simulateEvent(simulator.target, "mouseup", dragOptions);
            simulator.simulateEvent(simulator.target, "click", dragOptions);
        } else {
            simulator.simulateEvent(eventDoc, "mouseup", dragOptions);
        }
    }

    $.extend($.simulate.prototype, {
        simulateFlotdrag: function() {
            var options = $.extend({
                mouseX: 0,
                mouseY: 0
            }, this.options);
            var target = this.target,
                bBox = target.getBoundingClientRect(),
                x = Math.floor(bBox.left + options.mouseX),
                y = Math.floor(bBox.top + options.mouseY),
                dragOptions = { clientX: x, clientY: y, button: options.button },
                dx = options.dx || (options.x !== undefined ? options.x - x : 0),
                dy = options.dy || (options.y !== undefined ? options.y - y : 0);

            doDragStart(dragOptions, this);
            dragOptions = { clientX: x + dx, clientY: y + dy, button: options.button };
            doDrag(dragOptions, this);
            doDragEnd(dragOptions, this);
        },
        simulateFlotdragstart: function() {
            var options = $.extend({
                mouseX: 0,
                mouseY: 0,
                buttons: 0
            }, this.options);
            var target = this.target,
                bBox = target.getBoundingClientRect(),
                x = Math.floor(bBox.left + options.mouseX),
                y = Math.floor(bBox.top + options.mouseY),
                dragOptions = { clientX: x, clientY: y, buttons: options.buttons };

            doDragStart(dragOptions, this);
        },
        simulateFlotdragstep: function() {
            var options = $.extend({
                mouseX: 0,
                mouseY: 0
            }, this.options);
            var target = this.target,
                bBox = target.getBoundingClientRect(),
                x = Math.floor(bBox.left + options.mouseX),
                y = Math.floor(bBox.top + options.mouseY);

            var dragOptions = { clientX: x, clientY: y };
            doDrag(dragOptions, this);
        },
        simulateFlotdragend: function() {
            var options = $.extend({
                mouseX: 0,
                mouseY: 0
            }, this.options);
            var target = this.target,
                bBox = target.getBoundingClientRect(),
                x = Math.floor(bBox.left + options.mouseX),
                y = Math.floor(bBox.top + options.mouseY),
                dragOptions = { clientX: x, clientY: y, button: options.button };

            doDragEnd(dragOptions, this);
        }
    });
}
