# jquery.flot.tooltip
__tooltip plugin for wonderful Flot plotting library__

For information about Flot library [go here](http://www.flotcharts.org/).

Works also with Time series data and supports Date formatting in the same way as Flot itself.
You can fully define content of tip (with values precision) and you can use HTML tags too.
Flot Tooltip can be easily customized with CSS. Just do what you want with `.flotTip` in your stylesheet.

Check `examples` folder for details of how to use it.

__Important!__ You need to set flot option `hoverable` to `true` if you want flot.tooltip plugin to work.

    grid: {
      hoverable: true
    }

### Plugin Options

In comments there are default values  

    tooltip: {
        show:           boolean                 //false
        cssClass:       string                  //"flotTip"
        content:        string or function      //"%s | X: %x | Y: %y"
        xDateFormat:    string                  //null
        yDateFormat:    string                  //null
        monthNames:     string                  // null
        dayNames:       string                  // null
        shifts: {
            x:          int                     //10
            y:          int                     //20
        }
        defaultTheme:   boolean                 //true
        lines:          boolean                 //false
        onHover:        function(flotItem, $tooltipEl)
        $compat:        boolean                 //false
    }


-   `show` : set to `true` to turn on this plugin (if `grid.hoverable` is also set to `true`)
-   `cssClass` : the class to assign to the tooltip's HTML DIV element, defaulted to "flotTip"
-   `content` : content of your tooltip, HTML tags are also allowed; use `%s` for series label, `%x` for X value, `%y` for Y value and `%p` for percentage value (useful with pie charts using flot.pie plugin)  
  With `%x`, `%y` and `%p` values you can also use `.precision`, for example `%x.2` means that value of X will be rounded to 2 digits after the decimal point.  
  If no precision or dateFormat is set then plugin uses tickFormatter to format values displayed on tooltip.  
  If you require even more control over how the tooltip is generated you can pass a callback `function(label, xval, yval, flotItem)` that must return a string with the format described.  
  The content callback function pass may also return a boolean value of false (or empty string) if the tooltip is to be hidden for the given data point.
  Pull request [#64](https://github.com/krzysu/flot.tooltip/pull/64) introduced two more placeholders `%lx` and `%ly`, that work with flot-axislabels plugin.  
  Pull request [#75](https://github.com/krzysu/flot.tooltip/pull/75) introduced `%ct` placeholder for any custom text withing label (see example in `examples/custom-label-text.html`)  
  Pull request [#112](https://github.com/krzysu/flot.tooltip/pull/112) introduced `%n` placeholder for the total number (rather than percent) represented by a single slice of a pie chart.
-   `xDateFormat` : you can use the same specifiers as in Flot, for time mode data
-   `yDateFormat` : you can use the same specifiers as in Flot, for time mode data
-   `monthNames` : check [#28](https://github.com/krzysu/flot.tooltip/issues/28)
-   `dayNames` : check [#28](https://github.com/krzysu/flot.tooltip/issues/28)
-   `shifts` : shift tooltip position regarding mouse pointer for `x` and `y`, negative values are ok
-   `defaultTheme` : plugin have default theme build-in but here you can switch it off and adjust look of tip styling `.flotTip` (or whatever you set the `class` parameter to) in your CSS
-   `lines` : whether or not to have a tooltip on hover for lines between points
-   `onHover` : callback that allows you i.e. change color of the border of the tooltip according to the currently hovered series
-   `$compat` : whether or not to use compatibility mode - set this to true if you are using jQuery <1.2.6

## Supported plugins

-   [stack](http://www.flotcharts.org/flot/examples/stacking/index.html)
-   [pie](http://www.flotcharts.org/flot/examples/series-pie/index.html)
-   [threshold](http://www.flotcharts.org/flot/examples/threshold/index.html)
-   [axislabels](https://github.com/markrcote/flot-axislabels)
-   [tickRotor](https://github.com/markrcote/flot-tickrotor)
-   [stackpercent](https://github.com/skeleton9/flot.stackpercent)
-   [time](http://www.flotcharts.org/flot/examples/axes-time/index.html)
-   [curvedLines](http://curvedlines.michaelzinsmaier.de/)

* * *
Copyright (c) 2011-2016 Krzysztof Urbas (@krzysu).

__jquery.flot.tooltip__ is available under the MIT license.
