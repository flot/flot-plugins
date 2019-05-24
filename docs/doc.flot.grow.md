# grow
Plugin to support animation of charts
* <strong>data</strong>: Data Array specific for Bandwidth chart		
	* <strong>0</strong>: first data entry			
		* <strong>0</strong>: Y-value
		* <strong>1</strong>: X-value
* <strong>options</strong>:  options for grow
	* <strong>series</strong>: series options for grow
		* <strong>grow</strong>: grow only options
			* <strong>active</strong>: activate the plugin
				Default: true
			* <strong>valueIndex</strong>: which part of data should be used for growing. Usually it is the X-Value which has index and therefor is 2nd value 
				Default: 1
			* <strong>stepDelay</strong>: delay between 2 steps in millisecs. Depending on the power of your brower/computer the time to draw a chart has to be added.
				Default: 20
			* <strong>steps</strong>: Defines how many seperate steps will be shown from beginning to end
				Default: 100
			* <strong>stepMode</strong>: defines how each step is performed. Options are linear (step by step, everything is growing to the end), maximum (grow until value is reached, growing stops earlier for smaller values) and delayed (nothing and start later)
				Default: linear
			* <strong>stepDirection</strong>: direction of steps up(from 0 to value) or down(from axis.max to value)
				Default: up
		* <strong>editMode</strong>: not supported
		* <strong>nearBy</strong>: not supported