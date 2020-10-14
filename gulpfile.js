/* eslint-env node */

var gulp = require('gulp');
var filesExist = require('files-exist');
var concat = require('gulp-concat');
var babel = require('gulp-babel');
var maps = require('gulp-sourcemaps');
var uglifyes = require('uglify-es');
var composer = require('gulp-uglify/composer');
var uglify = composer(uglifyes, console);

gulp.task('build_flot_plugins', function () {
    'use strict';
    var src1 = ['source/**'];
    var src2 = ['examples/**'];
    var src3 = ['styles/**'];
    var src4 = ['docs/**'];
    gulp.src(filesExist(src1, { exceptionMessage: 'Missing file' }))
        .pipe(gulp.dest('dist/source'));
    gulp.src(filesExist(src2, { exceptionMessage: 'Missing file' }))
        .pipe(gulp.dest('dist/examples'));
    gulp.src(filesExist(src3, { exceptionMessage: 'Missing file' }))
        .pipe(gulp.dest('dist/styles'));
    return gulp.src(filesExist(src4, { exceptionMessage: 'Missing file' }))
        .pipe(gulp.dest('dist/docs'));
});
gulp.task('build_charting', function () {
    'use strict';
    var src = [
        'lib/cbuffer.js',
        'source/NationalInstruments/jquery.flot.historybuffer.js',
        'source/NationalInstruments/jquery.flot.historybuffer.numeric.js',
        'source/NationalInstruments/jquery.flot.historybuffer.analogWaveform.js',
        'source/NationalInstruments/jquery.flot.segment-tree.js',
        'source/NationalInstruments/jquery.flot.charting.js'
    ];
    return gulp.src(filesExist(src, { exceptionMessage: 'Missing file' }))
        .pipe(concat('jquery.flot.charting.js'))
        .pipe(gulp.dest('dist/source/NationalInstruments'));
});
gulp.task('build_charting2', function () {
    var src2 = [
        'source/NationalInstruments/jquery.flot.scattergraph.js',
        'source/NationalInstruments/jquery.thumb.js',
        'source/NationalInstruments/jquery.flot.cursors.js',
        'source/NationalInstruments/jquery.flot.axishandle.js',
        'source/NationalInstruments/jquery.flot.parkinglot.js',
        'source/NationalInstruments/jquery.flot.range.cursors.js',
        'source/NationalInstruments/jquery.flot.intensitygraph.js',
        'source/NationalInstruments/jquery.flot.digitalWaveform.js',
        'source/NationalInstruments/jquery.flot.digitalAxis.js',
        'source/NationalInstruments/jquery.flot.highlights.js',
        'source/NationalInstruments/jquery.flot.annotations.js',
        'source/NationalInstruments/jquery.flot.scrollbar.js',
        'dist/source/NationalInstruments/jquery.flot.charting.js'
    ];
    return gulp.src(filesExist(src2, { exceptionMessage: 'Missing file' }))
        .pipe(maps.init())
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(concat('jquery.flot.plugins.js'))
        .pipe(uglify())
        .pipe(maps.write('./'))
        .pipe(gulp.dest('dist/es5/NationalInstruments'));
});
gulp.task('build_charting_es6', function () {
    var src2 = [
        'source/NationalInstruments/jquery.flot.scattergraph.js',
        'source/NationalInstruments/jquery.thumb.js',
        'source/NationalInstruments/jquery.flot.cursors.js',
        'source/NationalInstruments/jquery.flot.axishandle.js',
        'source/NationalInstruments/jquery.flot.parkinglot.js',
        'source/NationalInstruments/jquery.flot.range.cursors.js',
        'source/NationalInstruments/jquery.flot.intensitygraph.js',
        'source/NationalInstruments/jquery.flot.digitalWaveform.js',
        'source/NationalInstruments/jquery.flot.digitalAxis.js',
        'source/NationalInstruments/jquery.flot.highlights.js',
        'source/NationalInstruments/jquery.flot.annotations.js',
        'source/NationalInstruments/jquery.flot.scrollbar.js',
        'dist/source/NationalInstruments/jquery.flot.charting.js'
    ];
    return gulp.src(filesExist(src2, { exceptionMessage: 'Missing file' }))
        .pipe(maps.init())
        .pipe(concat('jquery.flot.plugins.min.js'))
        .pipe(uglify({ecma: 6}))
        .pipe(maps.write('./'))
        .pipe(gulp.dest('dist/es6_minified/NationalInstruments'));
});
gulp.task('build', gulp.series('build_charting', 'build_charting2', 'build_charting_es6', 'build_flot_plugins'));
