* <strong>radar</strong>: <strong>Plugin to create spider chart</strong>
	* <strong>data</strong>: Data Array specific for Spider chart		
		* <strong>0</strong>: first data entry			
			* <strong>0</strong>: Angle of datapoint in degrees(1-360)
			* <strong>1</strong>: Size of datapoint
	* <strong>options</strong>: options for Radar
		* <strong>series</strong>: series options for Radar
			* <strong>radar</strong>: Radar only options
				* <strong>active</strong>: activate the plugin
					Default: false
				* <strong>show</strong>: show specific serie. this needs to be overwritten in data
					Default: false
				* <strong>radarSize</strong>: size of radar screen relative to size of placeholder
					Default: 0.8
				* <strong>delay</strong>: Delay in ms between redrawing on next position
					Default: 10
				* <strong>angleStep</strong>: stepsize to next position in degrees(0-360). Do not use big numbers here, for testing start below 100
					Default: 1
				* <strong>angleSize</strong>: Size of each sub radar beam. Use userdefined screen for testing.
					Default: 10
				* <strong>angleSteps</strong>: Number of sub radar beams. Values up to 9 are useful.
					Default: 6
				* <strong>color</strong>: Beam Color
					Default: darkgreen
				* <strong>backColor</strong>: Color of background
					Default: darkgreen
