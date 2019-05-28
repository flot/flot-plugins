# background
Plugin to fraw background and/or overlay.<br>Background is drawn on an additional canvas context. Critical point is the use of zIndex, since some plugins change zIndex to negativ values.<br>See option zIndex how to handle this.
* <strong>options</strong>: 
	* <strong>grid</strong>: Standard grid object from Flot
		* <strong>background</strong>: special options for background only
			* <strong>active</strong>: activate the plugin
				Default: false
			* <strong>mode</strong>: optional values are image, color and userdefined
				Default: color
			* <strong>color</strong>: specific options for color mode
				* <strong>colors</strong>: 						* <strong>0</strong>: 
						Default: white
					* <strong>1</strong>: 1st Color
						Default: yellow
					* <strong>2</strong>: 2nd Color
						Default: orange
					* <strong>3</strong>: believe it or not, this is 3rd color ;-)
						Default: blue
array of colors for color gradient
			* <strong>image</strong>: specific options for image mode. This is set to an image object, see example for more details
			* <strong>fncDraw</strong>: for calling userdefined backgrounds this is used for a function call. See examples with a clock running in the background
			* <strong>setZIndex</strong>: option for setting all canvas to a specific value. Very helpful for using jQuery UI.<br>True sets background to 0, drawing area to 1 and highlight to 2<br>A number sets drawing area to the given number, background to number-- and highlight to number++ 
				Default: false
		* <strong>overlay</strong>: Specific options for drawing overlays. Overlay image is drawn on drawing area with given opacity.<br>This does not work for those plugins, that use hook draw
			* <strong>active</strong>: Activates drawing an overlay
				Default: false
			* <strong>image</strong>: This is set to an image object, works similiar to image in background part
			* <strong>opacity</strong>: Opacity for drawing overlay image
				Default: 0.2
