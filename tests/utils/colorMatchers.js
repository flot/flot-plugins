/* eslint-disable no-unused-vars */

function setPixelRatio(plot, pixelRatio) {
    plot.getSurface().clear();
    plot.getSurface().pixelRatio = pixelRatio;
    plot.getPlaceholder().find('canvas').each(function(_, canvas) {
        canvas.width = canvas.width * pixelRatio;
        canvas.height = canvas.height * pixelRatio;

        var context = canvas.getContext('2d');
        context.restore();
        context.save();
        context.scale(pixelRatio, pixelRatio);
    });
    plot.draw();
}

function px(str) {
    return parseInt(str.slice(0, -2));
}

function createTestMatrix(columns, rows, value) {
    var data = [];
    for (var i = 0; i < columns; i++) {
        data[i] = [];
        for (var j = 0; j < rows; j++) {
            data[i][j] = value != null ? value : Math.random();
        }
    }
    return data;
}

function createPatternTestMatrix(columns, rows) {
    var data = [];
    for (var i = 0; i < columns; i++) {
        data[i] = [];
        for (var j = 0; j < rows; j++) {
            data[i][j] = (i + j) % 2;
        }
    }
    return data;
}

function createBorderTestMatrix(columns, rows) {
    var data = [], d = 1;
    for (var i = 0; i < columns; i++) {
        data[i] = [];
        for (var j = 0; j < rows; j++) {
            if (i === d || i === columns - 1 - d || j === d || j === rows - 1 - d) {
                data[i][j] = 1;
            } else {
                data[i][j] = 0;
            }
        }
    }
    return data;
}
