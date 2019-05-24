* <strong>rose</strong>: Plugin to show a rose chart
	* <strong>data</strong>: Data Array specific for Rose chart 		
		* <strong>0</strong>: Values are only the size of the rose
	* <strong>options</strong>:  options (general object from FLOT)
		* <strong>series</strong>: series (general object from FLOT)
			* <strong>rose</strong>: specific options for rose plugin
				* <strong>active</strong>: switches binding of plugin into hooks
					Default: false
				* <strong>show</strong>: switches show of candlestick on for actual series
					Default: false
				* <strong>roseSize</strong>: Size of the rose-circle, maximumsize is 1.0, take care to have some space for lables.
					Default: 0.7
				* <strong>leafSize</strong>: Value from 0 to 1 giving the space of the pie to be used for the rose
					Default: 0.7
				* <strong>dataMin</strong>: Minimum value for the rose. This is not calculated form data (yet), so you have to give data.
					Default: 0
				* <strong>dataMax</strong>: Maximum value for the rose. This is not calculated form data (yet), so you have to give data.
					Default: 100
				* <strong>drawGrid</strong>: 
					* <strong>drawValue</strong>: 
						Default: true
					* <strong>drawLabel</strong>: 
						Default: true
					* <strong>labelPos</strong>: 
						Default: 0.5
					* <strong>gridMode</strong>: 
						Default: data
				* <strong>highlight</strong>: Describes how highlighting (in case of HOVER) is displayed
					* <strong>opacity</strong>: Default for highlighting is to change opacity only
						Default: 0.5
