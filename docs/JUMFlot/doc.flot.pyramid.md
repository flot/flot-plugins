# pyramid
Plugin to create pyramids charts
* <strong>data</strong>: Data Array specific for pyramids chart		
	* <strong>0</strong>: first data entry
		* <strong>value</strong>: Value(size) for data slice
		* <strong>label</strong>: Label of the data clice
* <strong>options</strong>: options for pyramids
	* <strong>series</strong>: series options for pyramids
		* <strong>pyramids</strong>: pyramids only options
			* <strong>active</strong>: activate the plugin
				Default: false
			* <strong>show</strong>: how specific serie. this needs to be overwritten in data
				Default: false
			* <strong>mode</strong>: Decribes how a slice is shown. Actually pyramid and slice are supported
				Default: pyramid
			* <strong>fill</strong>: Switches Fillmode for drawing of a slice
				Default: true
			* <strong>highlight</strong>: Used to highlight in case of HOVER
				* <strong>opacity</strong>: only Opacity is supported for Highlighting (yet)
					Default: 0.5
			* <strong>label</strong>: description whether and how a label should be drawn
				* <strong>show</strong>: Swichtes label drawing on or off
					Default: false
				* <strong>align</strong>: Position of label
					Default: center
				* <strong>font</strong>: Used font for Label
					Default: 20px Times New Roman
				* <strong>fillStyle</strong>: Default color for label
					Default: Black
		* <strong>editMode</strong>: comin form mouse plugin, is nonsense for this plugin, since edit is not supported
		* <strong>nearBy</strong>: Defines how nearby is used to find item under mouse
			* <strong>distance</strong>: distance in pixel to find nearest slyce
				Default: 6
			* <strong>findItem</strong>: Function call to find item under Cursor. Is overwritten during processRawData hook. This would be the place to add your own find function, which will not be overwritten.
			* <strong>findMode</strong>: Defines how find happens.
				Default: circle
			* <strong>drawHover</strong>: Function to draw overlay in case of hover a item. Is overwritten during processRawData hook. This would be the place to add your own hover drawing function.
			* <strong>drawEdit</strong>: not used
				Default:  drawEditDefault(octx,x,y,serie)
