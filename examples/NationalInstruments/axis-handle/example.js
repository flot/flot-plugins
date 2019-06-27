const plot = $.plot($("#placeholder"), [
		{
			data: [[0, 0], [1, 1], [2, 1], [3, 0]],
			yaxis: 1
		},
		{
			data: [[0,1],[1,2], [2, 3], [3, 4], [4, 5]],
			yaxis: 2
		}
		], {
		cursors: [
			{
				name: 'Red cursor',
				mode: 'y',
				color: 'red',
				dashes: [4, 4],
				symbol: 'none',
				position: {
					relativeY: 0.5
				},
				movable: false
			},
			{
				name: 'test',
				mode: 'x',
				color: 'red',
				showIntersections: false,
				showLabel: true,
				symbol: 'triangle',
				position: {
					relativeX: 0.75,
					relativeY: 0.5
				},
				showThumbs: 't'
			},
		],
		yaxes: [
			{ min: -3, max: 5, offset: {below: 0, above: 0}, autoScale: "none", show: true },
			{ min: -3, max: 5, offset: {below: 0, above: 0}, autoScale: "none", show: false },
			],
		axisHandles: [
			{ orientation: 'vertical', location: 'far', axisIndex: 0 },
			{ orientation: 'horizontal', location: 'far', axisIndex: 0 },
			],
		zoom: {
			interactive: true
		},
		pan: {
			interactive: true,
			enableTouch: true
		}
	});

const checkBox = document.getElementById('toggle-disabled');
const horizontalHandle = plot.getAxisHandles().filter((handle) => handle.orientation === 'horizontal')[0];
checkBox.addEventListener('input', () => {
	plot.setAxisHandle(horizontalHandle, {
		handleClassList: checkBox.checked ? [] : ['draggable']
	});
});

const zeroHandle = plot.getAxisHandles().filter((handle) => handle.handleLabel === '0')[0];
const horizontalRadio = document.getElementById('horizontal');
const verticalRadio = document.getElementById('vertical');
const handleRadioGroupInput = (event) => {
	plot.setAxisHandle(zeroHandle, {
		orientation: event.target.value
	});
};
horizontalRadio.addEventListener('input', handleRadioGroupInput);
verticalRadio.addEventListener('input', handleRadioGroupInput);
