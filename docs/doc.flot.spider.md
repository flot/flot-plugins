* <strong>spider</strong>: <strong>Plugin to create spider chart</strong>
	* <strong>data</strong>: Data Array specific for Spider chart		
		* <strong>0</strong>: first data entry			
			* <strong>0</strong>: number of spider leg, see options.spider.legs for some more info
			* <strong>1</strong>: Value in spider leg
	* <strong>options</strong>: options for Spider
		* <strong>series</strong>: series options for Spider
			* <strong>spider</strong>: Spider only options
				* <strong>active</strong>: activate the plugin
					Default: false
				* <strong>show</strong>: show specific serie. this needs to be overwritten in data
					Default: false
				* <strong>spiderSize</strong>: Size of the full spider based on size of placeholder
					Default: 0.8
				* <strong>lineWidth</strong>: Linewidth for grid lines
					Default: 3
				* <strong>lineStyle</strong>: Drawing style for the Gridlines
					Default: rgba(0,0,0,0.5)
				* <strong>pointSize</strong>: Size of the marker on spiderleg. Its later used for highlighting a set of data
					Default: 6
				* <strong>scaleMode</strong>: describes how min and max should be calculated. Options are leg to calculate each leg seperately or others to calculate one general value for all legs
					Default: leg
				* <strong>legMin</strong>: Overwrites calculated min scale for all legs. Smaller datapoints will be set to this value in display.
				* <strong>legMax</strong>: Overwrites calculated max scale for all legs. Greater datapoints will be set to this value in display
				* <strong>connection</strong>: Option to describe the way to show connections between legs
					* <strong>width</strong>: Linewidth to connect markers of a dataserie (BTW, can be 0 please test to see what happens)
						Default: 4
				* <strong>highlight</strong>: Used for highlighting a serie
					* <strong>opacity</strong>: Opacity (what else)
						Default: 0.5
					* <strong>mode</strong>: Options are point (highlights markers on spider legs only, line (highlights lines from marker to marker, area (highlights the serie as a polygon, I love this one)
						Default: point
				* <strong>legs</strong>: Describes how the name for each leg is drawn
					* <strong>font</strong>: 
						Default: 20px Times New Roman
					* <strong>fillStyle</strong>: 
						Default: Black
					* <strong>legScaleMin</strong>: 
						Default: 0.95
					* <strong>legScaleMax</strong>: 
						Default: 1.05
					* <strong>legStartAngle</strong>: 
						Default: 0
					* <strong>data</strong>: 
						Default:						
						* <strong>0</strong>: 
							* <strong>label</strong>: 
						* <strong>1</strong>: 
							* <strong>label</strong>: 
						* <strong>2</strong>: 
							* <strong>label</strong>: 
						* <strong>3</strong>: 
							* <strong>label</strong>: 
						* <strong>4</strong>: 
							* <strong>label</strong>: 
			* <strong>editMode</strong>: 
			* <strong>nearBy</strong>: 
				* <strong>distance</strong>: 
					Default: 6
				* <strong>findItem</strong>: 
				* <strong>findMode</strong>: 
					Default: circle
				* <strong>drawEdit</strong>: 
				* <strong>drawHover</strong>: 
	Default: none
