# animate
Plugin to handle simple animations charts</strong>
* <strong>options</strong>: Options object from Flot
	* <strong>animate</strong>: Animate specific options
		* <strong>active</strong>: activate the plugin
			Default: false
		* <strong>mode</strong>: Mode of animation. Right now tile and pixastic are supported.
				- Tile splits the drawing in tiles and draws them based on tile options
			Default: tile
		* <strong>tile</strong>: Tile specif options for animate
			* <strong>x</strong>: Number of tiles in x direction
				Default: 3
			* <strong>y</strong>: Number of tiles in y direction
				Default: 3
			* <strong>mode</strong>: Describes, how tiles are drawn
					- lt: starting on left, top, columns first, then rows
					- tl: starting on left, top, rows first then coumns
					- rb: starting bottom right, columns first then rows
					- br: starting bottom right, rows first then columns
					- random: draws tile by randomized function
				Default: lt
		* <strong>pixastic</strong>: Specific option for using pixastic library, see www.pixastic.com for more information about this library. Only a few options of this powerful library are taken for animate.
			* <strong>maxValue</strong>: Value between -1 and +1
					- defines how strong the deformation should start.
				Default: 1
			* <strong>mode</strong>: Name of pixastic functions:
					- blurfast
					- lighten
					- emboss
					- mosaic
					- noise
				Default: blurfast
		* <strong>stepDelay</strong>: Delay in mille secs between steps in pixastic or before drawing next tile
			Default: 500
		* <strong>steps</strong>: Number of steps, used for pixastic only
			Default: 20