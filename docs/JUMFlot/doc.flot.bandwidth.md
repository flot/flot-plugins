# bandwidth
Plugin to create bandwidth charts
* <strong>data</strong>: Data Array specific for Bandwidth chart
	* <strong>0</strong>: first data entry
		* <strong>0</strong>: Y-value
			Default: none
		* <strong>1</strong>: X High-value
			Default: none
		* <strong>2</strong>: X Low-value
			Default: none
	* <strong>1</strong>: more entries
		Default: none
* <strong>options</strong>: options for bandwidth
	Default: none
	* <strong>series</strong>: series options for bandwidth
		Default: none
		* <strong>bandwidth</strong>: bandwidth only options
			Default: none
			* <strong>active</strong>: activate the plugin
				Default: false
			* <strong>show</strong>: show specific serie. this needs to be overwritten in data
				Default: false
			* <strong>fill</strong>: Fill bandwidth bar, (false not checked yet)
				Default: true
			* <strong>lineWidth</strong>: The linewidth of a bandwidth bar, given as number and px(see default) others formats will follow later
				Default: 4px
			* <strong>highlight</strong>: Used to highlight in case of HOVER
				Default: none
				* <strong>opacity</strong>: only Opacity is supported for Highlighting (yet)
					Default: 0.5
			* <strong>drawBandwidth</strong>: Function call which is used for drawing of one bar for Bandwidth. This can be replaced by user defined function. Take a closer look to source of examples to see more.
				Default: none
		* <strong>editMode</strong>: Default Editmode for bandwidth. See mouse plugin for more information. This value may be overdriven during editing, to support changing of X(can be changed in X-direction only), High and Low(both can be changed in Y-direction only).
			Default: y
		* <strong>editable</strong>: copied by FLOT, source is mouse plugin
			Default: false
		* <strong>nearBy</strong>: data used to support findItem for hover, click etc.
			Default: none
			* <strong>distance</strong>: distance in pixel to find nearest bandwidth bar
				Default: 6
			* <strong>findItem</strong>: Function call to find item under Cursor. Is overwritten during processRawData hook. This would be the place to add your own find function, which will not be overwritten.
				Default: null
			* <strong>findMode</strong>: Defines how find happens.
				circle
			* <strong>drawHover</strong>: Function to draw overlay in case of hover a item. Is overwritten during processRawData hook. This would be the place to add your own hover drawing function.
				Default: null
	* <strong>grid</strong>: Grid specific data, which is supported in bandwidth plugin.
		Default: none
		* <strong>clickable</strong>: switch support for click event on or off
			Default: none
		* <strong>hoverable</strong>: switch support for hover event on or off
			Default: none
		* <strong>editable</strong>: switch editing of bandwith data on or off
			Default: false
