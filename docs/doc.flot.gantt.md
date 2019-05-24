* <strong>gantt</strong>: <strong>Plugin to create gantt charts</strong>
	* <strong>data</strong>: 	Data Array specific for gantt chart	
		* <strong>0</strong>: 	first dataset for chart		
			* <strong>0</strong>: Start of Step
			* <strong>1</strong>: number of resource
			* <strong>2</strong>: End of step
			* <strong>3</strong>: Name for step (used for tooltip)
	* <strong>options</strong>: options (general object from FLOT)
		* <strong>series</strong>: options.series (general object from FLOT)
			* <strong>gantt</strong>: specific options for gantt plugin
				* <strong>active</strong>: Activates the gantt Plugin
					Default: false
				* <strong>show</strong>: Switches on/off the gantt for actual serie of data. Works only, if plugin is activated.
					Default: false
				* <strong>connectSteps</strong>: Describes connection lines from steps in one resource to a step in another.Its done by searching for steps in same serie which start at the same time another step ends.
					* <strong>show</strong>: switches connection lines on
						Default: false
					* <strong>lineWidth</strong>: describes the width of connection line
						Default: 2
					* <strong>color</strong>: color of connection line
						Default: rgb(0,0,0)
				* <strong>barHeight</strong>: Height of the bar compared to available space (1.0 would be full size)
					Default: 0.6
				* <strong>highlight</strong>: Describes how highlighting (in case of HOVER) is displayed
					* <strong>opacity</strong>: Default for highlighting is to change opacity only
						Default: 0.5
				* <strong>drawstep</strong>: 
					Default:  drawStepDefault(ctx,series,data,x,y,x2,color, isHighlight)
			* <strong>editMode</strong>: defines in which direction editing could happen. optional values are: x,y,xy,v. This value is changed by the plugin, depending on the way you select a timebar (left, right or body)
			* <strong>nearBy</strong>: ata used to support findItem for hover, click etc.
				* <strong>distance</strong>: maximum distance from data point to recognize a hit 
				* <strong>findItem</strong>: function to find nearby item. It is defined in jquery.flot.mouse plugin, and is overwritten in plugin to support specific find functions.
					Default:  findNearbyItemDefault(mouseX,mouseY,i,serie)
				* <strong>findMode</strong>: mode to find nearby item. Values are circle, vertical and horizontal
				* <strong>drawEdit</strong>: function to draw edit marker. It is defined in jquery.flot.mouse plugin, and is overwritten in plugin to support specific editmarkers
					Default:  drawEditDefault(octx,x,y,serie)
				* <strong>drawHover</strong>: function to draw hover shadow. It is defined in jquery.flot.mouse plugin.
					Default:  drawHoverDefault(octx,serie,dataIndex)
