* <strong>video</strong>: video plugin to create videos based on charts.<br>If you want to create your own video, take a closer look to deferred object in jQuery.
	* <strong>data</strong>: There is no special data for videos by default. This depends on the type of video steps you would like to have.<br>Take a closer look to examples to see how to add special data to describe steps.
	* <strong>options</strong>: options for video
		* <strong>series</strong>: series options for videos
			* <strong>video</strong>: video only options
				* <strong>active</strong>: activate the plugin
					Default: false
				* <strong>show</strong>: take data from show specific serie for video, this needs to be overwritten in data 
					Default: false
				* <strong>stepAction</strong>: describes how the step should be shown. Default stephandling can be selected out of stepCollection:<br>default: appends information from data to a div or if no div given opens an alertbox<br>youtube: if a youtube id is given, the video is shown<br>a function name: the given function is called by handing over actual stepdata and seriesdata
					Default: simple
				* <strong>stepCollection</strong>: collection of predefined videosteps
					* <strong>simple</strong>: default step giving information in a very simple way, see first example.
						* <strong>runStep</strong>: Adds stepData to a div defined in walkPad
							Default:  addStepData(stepData,actionData)
						* <strong>walkPad</strong>: target for addStepData
							Default: #stepPad
						* <strong>walkTime</strong>: Time for each step before walking to the next one
							Default: 2000
					* <strong>youtube</strong>: opens and starts a video from youtube.<br>For this action a jQuery plugin from http://www.pittss.lv/jquery/gomap/index.php is used.
						* <strong>runStep</strong>: shows a video in target defined in videoPad
							Default:  youtubeStep(stepData,actionData)
						* <strong>videoPad</strong>: target for runStep
							Default: #videoPad
						* <strong>width</strong>: default width of video
							Default: 400
						* <strong>height</strong>: default height of video
							Default: 300
						* <strong>maxDuration</strong>: maximum duration of a video. Whatever happens first, end of video or end of maxDuration, stops actual step.
							Default: 20000
						* <strong>noVideoDuration</strong>: Duration of step if no video information is available
							Default: 2000
