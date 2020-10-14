describe('JUMFlot tests', () => {
    'use strict';
    var series, ctx, placeholder, options;
    beforeEach(function () {
        placeholder = setFixtures('<div id="test-container" style="width: 200px;height: 100px;border-style: solid;border-width: 1px"><canvas id="theCanvas" style="width: 100%; height: 100%" /></div>')
        options = {
            grid: {show: true}
        };
        series = {
        };
    });

    describe('A graph background', function () {
        it('should draw a background when the graph is empty', function (done) {
            var bpo = [];
            series.data = [];
            function showPlots(imgLoaded) { //callback of preloading
                var imgs = imgLoaded;
                bpo.push({mode: "image", image: imgs.backImageHeatmap, active: true});
                options.grid.background = bpo[0];
                options.grid.background.active = true;
                $.plot(placeholder, data, options);
                var bg = document.querySelector('.flot-background');
                expect(bg).not.toBe(null);
                done();
            }
            var data = [
                {path: "styles/images/",
                    name: "backImageHeatmap",
                    type: "png"},
                {path: "styles/images/",
                    name: "Universal",
                    type: "png"}
            ];
            $.plot.JUMlib.data.loadImages(data, 5000, showPlots); // preload images
        });
        it('should draw a background when the graph is not empty', function (done) {
            var bpo = [];
            series.data = [1, 2, 3, 4, 5, 6];
            function showPlots(imgLoaded) { //callback of preloading
                var imgs = imgLoaded;
                bpo.push({mode: "image", image: imgs.backImageHeatmap, active: true});
                options.grid.background = bpo[0];
                options.grid.background.active = true;
                var plot = $.plot(placeholder, data, options);
                plot.setData([[[0, 0], [50, 50], [100, 100]]]);
                var bg = document.querySelector('.flot-background');
                expect(bg).not.toBe(null);
                done();
            }
            var data = [
                {path: "styles/images/",
                    name: "backImageHeatmap",
                    type: "png"},
                {path: "styles/images/",
                    name: "Universal",
                    type: "png"}
            ];
            $.plot.JUMlib.data.loadImages(data, 5000, showPlots); // preload images
        });
    });
    describe('a graph width bandwidth', () => {
        it('draws bandwidths', () => {
            var d1 = [
                [ 1, 160, 100 ], [ 2, 133, 87 ], [ 3, 138, 94 ],
                [ 4, 136, 84 ], [ 5, 125, 78 ], [ 6, 131, 84 ],
                [ 7, 136, 84 ], [ 8, 160, 99 ], [ 9, 123, 80 ],
                [ 10, 138, 85 ], [ 11, 139, 85 ], [ 12, 125, 79 ],
                [ 13, 130, 79 ], [ 14, 176, 92 ], [ 15, 137, 79 ],
                [ 16, 124, 81 ], [ 17, 122, 74 ], [ 18, 130, 82 ],
                [ 19, 132, 76 ], [ 20, 134, 83 ], [ 21, 126, 77 ],
                [ 22, 126, 74 ], [ 23, 121, 79 ], [ 24, 137, 72 ],
                [ 25, 138, 74 ], [ 26, 120, 79 ]
            ];
            options.xaxes = [{min: 0, max: 26, autoScale: 'none'}];
            options.yaxes = [{min: 60, max: 200, autoScale: 'none'}];
            options.series = {bandwidth: {active: true, lineWidth: 6, debug: false}};
            $.plot(placeholder, [{label: "Pressure", data: d1, bandwidth: {show: true, lineWidth: 8}}], options);
            ctx = document.querySelector('.flot-base').getContext('2d');
            spyOn(ctx, 'moveTo').and.callThrough();
            spyOn(ctx, 'lineTo').and.callThrough();
            $.plot(placeholder, [{label: "Pressure", data: d1, bandwidth: {show: true, lineWidth: 8}}], options);
            expect(ctx.moveTo).toHaveBeenCalled();
            expect(ctx.lineTo).toHaveBeenCalled();
        });
    });
    describe('a graph with bubbles', () => {
        it('draws bubbles', () => {
            var d1 = [
                [20, 20, 10],
                [40, 50, 20],
                [70, 10, 5],
                [80, 80, 7]
            ];
            options.series = {
                bubbles: {
                    active: true,
                    show: true,
                    linewidth: 2,
                    debug: false
                }
            };
            options.xaxes = [{min: 0, max: 100, autoScale: 'none'}];
            options.yaxes = [{min: 0, max: 100, autoScale: 'none'}];
            $.plot(placeholder, [{
                label: "Pressure",
                data: d1,
                bandwidth: {
                    show: true,
                    lineWidth: 8
                }
            }], options);
            ctx = document.querySelector('.flot-base').getContext('2d');
            spyOn(ctx, 'arc').and.callThrough();
            $.plot(placeholder, [{
                label: "Pressure",
                data: d1,
                bandwidth: {
                    show: true,
                    lineWidth: 8
                }
            }], options);
            expect(ctx.arc).toHaveBeenCalled();
        });
    });
    describe('a candlestick graph', () => {
        it('draws a candletick graph', () => {
            var dt = [
                [1, 50, 52, 49, 52], [1, 2, 51.5, 53, 51, 53],
                [3, 52, 52, 51, 54], [1, 4, 51, 49, 47, 53],
                [5, 48, 44, 42, 48], [1, 8, 45, 55, 45, 55],
                [9, 53, 57, 45, 58]
            ];
            var data = $.plot.candlestick.createCandlestick(
                {label: "my Company", data: dt, candlestick: {show: true, lineWidth: 2, debug: false}});
            options.series = {candlestick: {active: true}};
            options.xaxes = [{mode: "time", min: 0, max: 12, autoScale: 'none'}];
            options.yaxes = [{position: "left"}, {position: "right"}];
            $.plot(placeholder, data, options);
            ctx = document.querySelector('.flot-base').getContext('2d');
            spyOn(ctx, 'moveTo').and.callThrough();
            spyOn(ctx, 'lineTo').and.callThrough();
            $.plot(placeholder, data, options);
            expect(ctx.moveTo).toHaveBeenCalled();
            expect(ctx.lineTo).toHaveBeenCalled();
        });
    });
    describe('a contour graph', () => {
        it('draws a contour graph', () => {
            var d1 = [ [80, 150, 120, 160, 0], [250, 250, 150, 180, Math.PI / 4], [215, 200, 130, 50, 0] ];
            options.series = { contour: { active: true, ellipseStep: 0.1, debug: {active: false} } };
            options.xaxes = [{min: 0, max: 400, autoScale: 'none'}];
            options.yaxes = [{min: 0, max: 400, autoScale: 'none'}];

            $.plot(placeholder, d1, options);
            ctx = document.querySelector('.flot-base').getContext('2d');
            spyOn(ctx, 'moveTo').and.callThrough();
            spyOn(ctx, 'lineTo').and.callThrough();
            $.plot(placeholder, d1, options);
            expect(ctx.moveTo).toHaveBeenCalled();
            expect(ctx.lineTo).toHaveBeenCalled();
        });
    });
    describe('a gantt chart', () => {
        it('draws a gantt chart', () => {
            var d2 = [
                [ 5, 5, 8, "Put Water into Pot" ],
                [ 8, 4, 10, "Put Pot on Cooker" ],
                [10, 4, 23, "Cook Water"]
            ];
            options.series = {editMode: 'v',
                editable: true,
                gantt: { active: true, show: true, barHeight: 0.5 }
            };
            options.xaxes = [{min: 0, max: 23, mode: "time", autoScale: 'none'}];
            options.yaxes = [{min: 0.5, max: 5.5, ticks: [[1, "Bowl"], [2, "Cup"], [3, "Can"], [4, "Cooker"], [5, "Desk"]], autoScale: 'none'}];
            $.plot(placeholder, d2, options);
            ctx = document.querySelector('.flot-base').getContext('2d');
            spyOn(ctx, 'moveTo').and.callThrough();
            spyOn(ctx, 'lineTo').and.callThrough();
            $.plot(placeholder, d2, options);
            expect(ctx.moveTo).toHaveBeenCalled();
            expect(ctx.lineTo).toHaveBeenCalled();
        });
    });
    describe('a pyramid graph', () => {
        it('draws a pyramid graph', () => {
            var d1 = [
                {value: 50, label: "Bears"}, {value: 20, label: "Pandas"},
                {value: 3, label: "male"}, {value: 1, label: "Albino"}
            ];
            options.series = {pyramids: {active: true, show: true, mode: "slice"}};
            $.plot(placeholder, [d1], options);
            ctx = document.querySelector('.flot-base').getContext('2d');
            spyOn(ctx, 'moveTo').and.callThrough();
            spyOn(ctx, 'lineTo').and.callThrough();
            $.plot(placeholder, d1, options);
            expect(ctx.moveTo).toHaveBeenCalled();
            expect(ctx.lineTo).toHaveBeenCalled();
        });
    });
    describe('a rectangle graph', () => {
        it('draws a rectangle graph', () => {
            var dt1 = [
                {label: "Nuts", data: 200, color: {colors: ["white", "yellow", "orange", "blue"]}},
                {label: "strawberry", data: 100, color: "red"},
                {label: "apple", data: 60, color: "green"},
                {label: "banana", data: 20, color: "yellow"},
                {label: "coconut", data: 5, color: "darkorange"},
                {label: "blueberry", data: 2}
            ];
            var d1 = [{data: dt1, rectangle: {show: true}}];
            options.series = { rectangle: { active: true, show: true } };
            $.plot(placeholder, d1, options);
            ctx = document.querySelector('.flot-base').getContext('2d');
            spyOn(ctx, 'fillRect').and.callThrough();
            $.plot(placeholder, d1, options);
            expect(ctx.fillRect).toHaveBeenCalled();
        });
    });
    describe('a rose graph', () => {
        it('draws a rose graph', () => {
            var d1 = [ 10, 30, 40, 5, 60 ];
            var d2 = [ 20, 60, 50, 80, 70 ];
            var d3 = [ 50, 70, 90, 90, 80 ];
            var data = [
                { label: "high", color: "blue", data: d3, rose: { show: true } },
                { label: "middle", color: { colors: ["yellow", "orange", "red"] }, data: d2, rose: { show: true } },
                { label: "low", color: "green", data: d1, rose: {show: true} }
            ];
            options.series = {rose: {active: true, roseSize: 0.8, leafSize: 0.7}};
            options.grid.tickLabel = ["Apple", "Blueberry", "Lemon", "Nuts", "Orange"];
            $.plot(placeholder, data, options);
            ctx = document.querySelector('.flot-base').getContext('2d');
            spyOn(ctx, 'moveTo').and.callThrough();
            spyOn(ctx, 'lineTo').and.callThrough();
            $.plot(placeholder, data, options);
            expect(ctx.moveTo).toHaveBeenCalled();
            expect(ctx.lineTo).toHaveBeenCalled();
        });
    });
    describe('a spider graph', () => {
        it('draws a spider graph', () => {
            var d1 = [ [0, 10], [1, 20], [2, 80], [3, 70], [4, 60] ];
            var d2 = [ [0, 30], [1, 25], [2, 50], [3, 60], [4, 95] ];
            var d3 = [ [0, 50], [1, 40], [2, 60], [3, 95], [4, 30] ];
            var data = [
                { label: "Pies",
                    color: "green",
                    data: d1,
                    spider: {show: true, lineWidth: 12} },
                { label: "Apples",
                    color: "orange",
                    data: d2,
                    spider: {show: true} },
                { label: "Cherries",
                    color: "red",
                    data: d3,
                    spider: {show: true} }
            ];
            options.series = {
                spider: {
                    active: true,
                    highlight: {mode: "area"},
                    debug: true,
                    legs: {
                        data: [{label: "OEE"}, {label: "MOE"}, {label: "OER"}, {label: "OEC"}, {label: "Quality"}],
                        legScaleMax: 1,
                        legScaleMin: 0.8
                    },
                    spiderSize: 0.9
                }
            };
            options.grid = {
                tickColor: "rgba(0,0,0,0.2)", mode: "radar"
            };
            $.plot(placeholder, data, options);
            ctx = document.querySelector('.flot-base').getContext('2d');
            spyOn(ctx, 'moveTo').and.callThrough();
            spyOn(ctx, 'lineTo').and.callThrough();
            $.plot(placeholder, data, options);
            expect(ctx.moveTo).toHaveBeenCalled();
            expect(ctx.lineTo).toHaveBeenCalled();
        });
    });
});
