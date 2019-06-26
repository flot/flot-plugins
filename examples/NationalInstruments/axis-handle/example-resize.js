const plot = $.plot($("#placeholder"), [
	{
		data: [[0, 0], [1, 1], [2, 1], [3, 0]],
		yaxis: 1
	},
	{
		data: [[0,1],[1,2], [2, 3], [3, 4], [4, 5]],
		yaxis: 2
	}
],{
	yaxes: [
		{ min: -3, max: 5, offset: {below: 0, above: 0}, autoScale: "none", show: true },
		{ min: -3, max: 5, offset: {below: 0, above: 0}, autoScale: "none", show: false },
		],
	axisHandles: [
		{ orientation: 'vertical', location: 'far', axisIndex: 0 },
		{ orientation: 'horizontal', location: 'near', axisIndex: 0 },
		],
	zoom: {
		interactive: true
	},
	pan: {
		interactive: true,
		enableTouch: true
	}
});

window.addEventListener('resize', () => {
	plot.resize();
	plot.setupGrid(true);
	plot.draw();
});
