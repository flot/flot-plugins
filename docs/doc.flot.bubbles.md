* <strong>bubbles</strong>: <strong>Plugin to create bubble charts</strong>
	* <strong>data</strong>: Data Array specific for Bubbles chart
		* <strong>0</strong>: first data entry	
			* <strong>0</strong>: Y-value, location of bubble
			* <strong>1</strong>: X-value, location of value
			* <strong>2</strong>: Size of bubble
	* <strong>options</strong>: options for bubbles
		* <strong>series</strong>: series options for bubbles
			* <strong>bubbles</strong>: bubbles only options
				* <strong>active</strong>: activate the plugin
					Default: false
				* <strong>show</strong>: show specific serie. this needs to be overwritten in data
					Default: false
				* <strong>fill</strong>: Fill bubbles
					Default: true
				* <strong>lineWidth</strong>: Line width of circle if fill is false
					Default: 2
				* <strong>highlight</strong>: Used to highlight in case of HOVER
					* <strong>opacity</strong>: only Opacity is supported for Highlighting (yet)
						Default: 0.5
				* <strong>drawbubble</strong>: Function call which is used for drawing of one bar for Bubble. This can be replaced by user defined function. Take a closer look to source of examples to see more.
					Default:  drawbubbleDefault(ctx,serie,x,y,v,r,c,overlay)
				* <strong>bubblelabel</strong>: Specific options how to show label in bubbles
					* <strong>show</strong>: Switches labels on (or off)
						Default: false
					* <strong>fillStyle</strong>: Color of text
						Default: black
			* <strong>editMode</strong>: Default Editmode for bandwidth. See mouse plugin for more information.
			* <strong>nearBy</strong>: data used to support findItem for hover, click etc.
				* <strong>distance</strong>: distance in pixel to find nearest bubble
					Default: 6
				* <strong>findMode</strong>: Defines how find happens.
					Default: circle
				* <strong>findItem</strong>: Function call to find item under Cursor. Is overwritten during processRawData hook. This would be the place to add your own find function, which will not be overwritten.
					Default:  findNearbyItemDefault(mouseX,mouseY,i,serie)
				* <strong>drawEdit</strong>: function to draw edit marker. It is defined in jquery.flot.mouse plugin, and is overwritten in plugin to support specific editmarkers
					Default:  drawEditDefault(octx,x,y,serie)
				* <strong>drawHover</strong>: Function to draw overlay in case of hover a item. Is overwritten during processRawData hook. This would be the place to add your own hover drawing function.
					Default:  drawHoverDefault(octx,serie,dataIndex)
