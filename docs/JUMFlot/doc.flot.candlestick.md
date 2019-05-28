# candlestick
Plugin to show a candlestick chart
* <strong>data</strong>: Data Array specific for Bandwidth chart
	* <strong>0</strong>: 1st entry in data
		* <strong>0</strong>: x-Position, usually a date
		* <strong>1</strong>: Start-value, used for the body
		* <strong>2</strong>: End-value, used for the body
		* <strong>3</strong>: minimum value, used for the line
		* <strong>4</strong>: maximum value, used for the line part
* <strong>options</strong>: options (general object from FLOT)
	* <strong>series</strong>: series (general object from FLOT)
		* <strong>candlestick</strong>: specific options for candlestick plugin
			* <strong>active</strong>: switches binding of plugin into hooks
				Default: false
			* <strong>show</strong>: switches show of candlestick on for actual series
				Default: false
			* <strong>rangeWidth</strong>: range is displayed as line, this value is the width of this line
				Default: 4
			* <strong>rangeColor</strong>: Color of line from min to max
				Default: rgb(0,128,128)
			* <strong>upColor</strong>: color of body from startvalue to endvalue if endvalue is greater than startvalue
				Default: rgb(255,0,0)
			* <strong>downColor</strong>: color of body from startvalue to endvalue if endvalue is less than startvalue
				Default: rgb(0,255,0)
			* <strong>neutralColor</strong>: color of body if startvalue is equal to endvalue
				Default: rgb(0,0,0)
			* <strong>lineWidth</strong>: Body is shown as a line, this is the size of the line
				Default: 8px
			* <strong>highlight</strong>: Describes how highlighting (in case of HOVER) is displayed
				* <strong>opacity</strong>: Default for highlighting is to change opacity only
					Default: 0.5
			* <strong>drawCandlestick</strong>: Default function to display each candlestick. This can be overwritten. Please see function mydraw in source of examples page
				Default:  drawCandlestickDefault(ctx,serie,data,hover)
		* <strong>editMode</strong>: defines in which direction editing could happen. optional values are: x,y,xy,v
		* <strong>nearBy</strong>: data used to support findItem for hover, click etc.
			* <strong>distance</strong>: maximum distance from data point to recognize a hit 
			* <strong>findItem</strong>: function to find nearby item. It is defined in jquery.flot.mouse plugin, and is overwritten in plugin to support specific find functions.
				Default:  findNearbyItemDefault(mouseX,mouseY,i,serie)
			* <strong>findMode</strong>: mode to find nearby item. Values are circle, vertical and horizontal
			* <strong>drawEdit</strong>: function to draw edit marker. It is defined in jquery.flot.mouse plugin, and is overwritten in plugin to support specific editmarkers
				Default:  drawEditDefault(octx,x,y,serie)
			* <strong>drawHover</strong>: function to draw hover shadow. It is defined in jquery.flot.mouse plugin.
				Default:  drawHoverDefault(octx,serie,dataIndex)
