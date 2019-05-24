# contour
Plugin to create bandwidth charts
* <strong>data</strong>: Data Array specific for contour chart
	* <strong>0</strong>:first data entry
		* <strong>0</strong>: X-position
		* <strong>1</strong>: Y-position
		* <strong>2</strong>: Width of contour
		* <strong>3</strong>: height of contour
		* <strong>4</strong>: angle of whole contour
* <strong>options</strong>: options for contour
	* <strong>series</strong>: series options for contour
		* <strong>contour</strong>: contour only options
			* <strong>active</strong>: activate the plugin
				Default: false
			* <strong>show</strong>: show specific serie. this needs to be overwritten in data
				Default: false
			* <strong>ellipseStep</strong>: drawing of contour ellipse is based on code found in the internet. There was no author, so if you are the one, please give me a hint.
					- ellipseStep is used to define how perfect the ellipse should be, take a higher value to see what this means
				Default: 0.1
		* <strong>nearBy</strong>: data used to support findItem for hover, click etc.
				- this part is not tested very well yet and needs to be rebuilt
			* <strong>distance</strong>: distance in pixel to find nearest contour
			* <strong>findItem</strong>: Function call to find item under Cursor. Is overwritten during processRawData hook. This would be the place to add your own find function, which will not be overwritten.
			* <strong>findMode</strong>: Defines how find happens.
			* <strong>drawHover</strong>: Function to draw overlay in case of hover a item. Is overwritten during processRawData hook. This would be the place to add your own hover drawing function.
