/*global jQuery, $*/

$(function () {
	'use strict';
	let plot;
	let offset = 0.0;
	let sin = [],
		cos = [];

	function updateData() {
		sin = [];
		cos = [];
		offset += 0.02;
		for (var i = 0; i < 8; i += 0.4) {
			sin.push([i, 1 + Math.sin(i + offset)]);
			cos.push([i, 1 + Math.cos(i + offset)]);
		}
	}

	updateData();
	createPlot();

	function createPlot() {
		plot = $.plot("#placeholder", [
			{
				data: sin,
				label: "sin(x)",
				yaxis: 1
			},
			{
				data: cos,
				label: "cos(x)",
				yaxis: 2
			}
		], {
			series: {
				lines: {
					show: true
				},
				points: {
					show: true
				}
			},
			cursors: [
				{
					name: 'trigger',
					mode: 'x',
					color: 'red',
					dashes: [4, 4],
					symbol: 'none',
					position: {
						relativeX: 0.5,
						relativeY: 0.5
					},
					movable: false,
					showValues: false
				}
			],
			grid: {
				hoverable: true,
				clickable: true,
				autoHighlight: false
			},
			yaxes: [
				{
					min: 0,
					max: 2,
					autoScale: 'none',
					showTickLabels: 'all',
					show: true,
					color: 'rgba(255, 201, 14, 1)',
					font: {
						color: 'rgba(255, 201, 14, 1)',
						size: 13
					}
				},
				{
					min: 0,
					max: 2,
					autoScale: 'none',
					showTickLabels: 'all',
					show: false,
					color: 'rgba(0, 162, 232, 1)',
					font: {
						color: 'rgba(0, 162, 232, 1)',
						size: 13
					}
				}
			],
			axisHandles: [
				{ orientation: 'vertical', location: 'far', axisIndex: 1, fill: 'yellow'},
				{ orientation: 'vertical', location: 'far', axisIndex: 0, position: 0.5, absolutePosition: 0.5 },
				{ orientation: 'horizontal', location: 'far', axisIndex: 0, position: 0.5, handleLabel: 'T' },
			],
			zoom: {
				interactive: true
			},
			pan: {
				interactive: true,
				enableTouch: true
			}
		});
	}

	const axisValue = document.getElementById('axis');
	const deltaValue = document.getElementById('delta');
	$('#placeholder').on('axisHandlePanStart', (event, handle) => {
		if (handle.orientation === 'horizontal') {
			return;
		}

		axisValue.textContent = handle.axisIndex;
	});

	$('#placeholder').on('axisHandlePan', (event, delta) => {
		deltaValue.textContent = JSON.stringify(delta);
	})
});
