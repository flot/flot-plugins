// Karma configuration
// Generated on Wed Jun 15 2016 09:05:44 GMT-0500 (CDT)

var module;

module.exports = function (config) {
    'use strict';

    var browsersMatrix = {
            'win': ['Firefox', 'Chrome', 'Edge'],
            'linux': ['Firefox', 'Chrome'],
            // 'mac': ['Firefox', 'Chrome', 'Safari']
            'mac': ['Chrome',]
        },
        isWin = /^win/.test(process.platform),
        isLinux = /^linux/.test(process.platform),
        isMac = /^darwin/.test(process.platform),
        currentOSType = isWin ? 'win' : (isLinux ? 'linux' : 'mac'),
        currentOSBrowsers = browsersMatrix[currentOSType];

    var files = [
        {
            pattern: 'styles/images/*.*',
            watched: false,
            served: true,
            included: true
        },
        'lib/cbuffer.js',
        'node_modules/ni-data-types/dist/es5-minified/ni-data-types.min.js',
        'node_modules/jquery/dist/jquery.min.js',
        'node_modules/flot/lib/jquery.event.drag.js',
        'node_modules/flot/lib/jquery.mousewheel.js',
        'node_modules/flot/dist/es5/jquery.flot.js',
        'node_modules/jquery-simulate/jquery.simulate.js',
        'node_modules/webcharts-development-settings/testsUtils/*.js',
        'source/JUMFlot/jquery.flot.JUMlib.js',
        'source/JUMFlot/jquery.flot.animate.js',
        'source/JUMFlot/jquery.flot.background.js',
        'source/JUMFlot/jquery.flot.bandwidth.js',
        'source/JUMFlot/jquery.flot.bubbles.js',
        'source/JUMFlot/jquery.flot.candlestick.js',
        'source/JUMFlot/jquery.flot.contour.js',
        'source/JUMFlot/jquery.flot.gantt.js',
        'source/JUMFlot/jquery.flot.grow.js',
        'source/JUMFlot/jquery.flot.heatmap.js',
        'source/JUMFlot/jquery.flot.mouse.js',
        'source/JUMFlot/jquery.flot.pyramid.js',
        'source/JUMFlot/jquery.flot.radar.js',
        'source/JUMFlot/jquery.flot.rectangle.js',
        'source/JUMFlot/jquery.flot.rose.js',
        'source/JUMFlot/jquery.flot.spider.js',
        'source/JUMFlot/jquery.flot.spiral.js',
        'source/JUMFlot/jquery.flot.video.js',
        'source/NationalInstruments/jquery.flot.cursors.js',
        'source/NationalInstruments/jquery.flot.range.cursors.js',
        'source/NationalInstruments/jquery.flot.scattergraph.js',
        'source/NationalInstruments/jquery.thumb.js',
        'source/NationalInstruments/jquery.flot.axishandle.js',
        'source/NationalInstruments/jquery.flot.parkinglot.js',
        'source/NationalInstruments/jquery.flot.intensitygraph.js',
        'source/NationalInstruments/jquery.flot.digitalWaveform.js',
        'source/NationalInstruments/jquery.flot.digitalAxis.js',
        'source/NationalInstruments/jquery.flot.charting.js',
        'source/NationalInstruments/jquery.flot.highlights.js',
        'source/NationalInstruments/jquery.flot.annotations.js',
        'source/NationalInstruments/jquery.flot.historybuffer.js',
        'source/NationalInstruments/jquery.flot.historybuffer.numeric.js',
        'source/NationalInstruments/jquery.flot.historybuffer.analogWaveform.js',
        'source/NationalInstruments/jquery.flot.segment-tree.js',
        'source/NationalInstruments/jquery.flot.scrollbar.js',
        'node_modules/webcharts-development-settings/testsUtils/colors.js',
        'tests/cursors_dragUtilities.js',
        'tests/lib/jsverify.standalone.js',
        'tests/lib/jasmineHelpers2.js',
        'tests/utils/colorMatchers.js',
        'tests/testHelpers.js',
        'tests/*Test.js',
        'tests/*Tests.js'
    ];

    var settings = {

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: './',

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine-jquery', 'jasmine'],

        // list of files / patterns to load in the browser
        files: files,

        // list of files to exclude
        exclude: [
        ],

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            'source/NationalInstruments/**/*.js': ['eslint']
        },

        eslint: {
            stopOnError: config.stopOnEsLintError ? true : false,
            showWarnings: true,
            engine: {
                configFile: '.eslintrc.json',
                emitError: true,
                emitWarning: true
            }
        },

        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['kjhtml', 'spec'],

        coverageReporter: {
            type: 'lcov', // lcov or lcovonly are required for generating lcov.info files
            dir: 'coverage/'
        },

        // web server port
        port: 9876,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,

        proxies: {
            '/styles/images/': '/base/styles/images/',
            '/styles/css/': '/base/styles/css/',
            '/tests/': '/base/tests/'
        },

        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: currentOSBrowsers,

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false,

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity
    };

    config.set(settings);
};
