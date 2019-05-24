* <strong>rectangle</strong>: Plugin to create rectangle charts
	* <strong>data</strong>: Data Array specific for rectangle chart
		* <strong>0</strong>: first data entry
			* <strong>label</strong>: standard label
			* <strong>data</strong>: standard in flot
			* <strong>pos</strong>: plugin internal cache for later support of hover etc
				* <strong>x</strong>: x-position
				* <strong>y</strong>: y-position
				* <strong>w</strong>: width
				* <strong>h</strong>: height
				* <strong>color</strong>: guess yourself, what this could be :-)\
	* <strong>options</strong>: options for rectangle
		* <strong>series</strong>: series options for rectangle
			* <strong>rectangle</strong>: rectanle only options
				* <strong>active</strong>: activate the plugin
					Default: false
				* <strong>show</strong>: show specific serie. this needs to be overwritten in data
					Default: false
				* <strong>fill</strong>: rectangle to be filled (or not)
					Default: true
				* <strong>lineWidth</strong>: linewidth for border of rectangle
					Default: 2
				* <strong>directions</strong>: array of direction how the rectangles should be drawn on screen. Should not be empty. Optional values are:<br>t for top, l for left, b for bottom and r for right.<br>For example taking tl would draw first rectangle from top of empty drawing are down to bottom, next would start on left of empty area and going to the right.
					Default: tlbr
				* <strong>highlight</strong>: Used to highlight in case of HOVER
					* <strong>opacity</strong>: only Opacity is supported for Highlighting (yet)
						Default: 0.5
				* <strong>drawRectangle</strong>: default drawing callback for each rectangle. Can be overwritten by userdefined function
					Default:  drawRectangleDefault(ctx,serie,dataIndex)
				* <strong>label</strong>: defines whether / how labels are shown
					* <strong>show</strong>: show labels or not
						Default: false
					* <strong>fillStyle</strong>: color of labeltext
						Default: black
			* <strong>editMode</strong>: Default Editmode for Rectangle. See mouse plugin for more information.
			* <strong>nearBy</strong>:  data used to support findItem for hover, click etc.
				* <strong>distance</strong>: distance in pixel to find nearest rectangle
					Default: 6
				* <strong>findMode</strong>: Defines how find happens.
					Default: circle
				* <strong>findItem</strong>:  Function call to find item under Cursor. Is overwritten during processRawData hook. This would be the place to add your own find function, which will not be overwritten.
					Default:  findNearbyItemDefault(mouseX,mouseY,i,serie)
				* <strong>drawEdit</strong>: Not supported for rectangle
					Default:  drawEditDefault(octx,x,y,serie)
				* <strong>drawHover</strong>: Function to draw overlay in case of hover a item. Is overwritten during processRawData hook. This would be the place to add your own hover drawing function.
					Default:  drawHoverDefault(octx,serie,dataIndex)
