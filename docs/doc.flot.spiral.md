# spiral
Plugin to create rectangle charts
* <strong>data</strong>: Data Array specific for spiral chart	
	* <strong>0</strong>: first data entry
		* <strong>label</strong>: standard label
		* <strong>data</strong>: standard in flot
		* <strong>color</strong>: color for pie, can be a simple color or a gradient
			* <strong>colors</strong>: This array holds color data for gradients. supported are brightness, opacity and colors			
				* <strong>0</strong>: inner color
				* <strong>1</strong>: color(s) between, number is between 0 and .....
				* <strong>2</strong>: outer color
* <strong>options</strong>: options for spiral
	* <strong>series</strong>: series options for spiral
		* <strong>spiral</strong>: Specific options for spiral
			* <strong>active</strong>: activate the plugin
				Default: false
			* <strong>show</strong>: show specific serie. this needs to be overwritten in data
				Default: false
			* <strong>spiralSize</strong>: size of spiral screen relative to size of placeholder
				Default: 0.8
			* <strong>rotations</strong>: number of rotations in animation
				Default: 3
			* <strong>steps</strong>: number of steps in each rotation
				Default: 36
			* <strong>delay</strong>: delay in ms between steps
				Default: 50
			* <strong>highlight</strong>: Used to highlight in case of HOVER
				* <strong>opacity</strong>:  only Opacity is supported for Highlighting (yet)
					Default: 0.5
