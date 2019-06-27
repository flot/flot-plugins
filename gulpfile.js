var gulp = require('gulp');
var gulpDebug = require('gulp-debug');
var filesExist = require('files-exist');
var concat = require('gulp-concat');
var babel = require('gulp-babel');
var maps = require('gulp-sourcemaps');
var gulpSequence = require('gulp-sequence');
var uglifyes = require('uglify-es');
var composer = require('gulp-uglify/composer');
var uglify = composer(uglifyes, console);

gulp.task('build_flot_plugins', function () {
    'use strict';
    var src1 = ['source/**'];
    var src2 = ['examples/**'];
    var src3 = ['styles/**'];
    var src4 = ['docs/**'];
    gulp.src(filesExist(src1, { exceptionMessage: 'Missing file'}))
        .pipe(gulp.dest('dist/source'));
    gulp.src(filesExist(src2, { exceptionMessage: 'Missing file'}))
        .pipe(gulp.dest('dist/examples'));
    gulp.src(filesExist(src3, { exceptionMessage: 'Missing file'}))
        .pipe(gulp.dest('dist/styles'));
    return gulp.src(filesExist(src4, { exceptionMessage: 'Missing file'}))
        .pipe(gulp.dest('dist/docs'));
});
gulp.task('build_flot_ni', function () {
    'use strict';
    var src = [
        'source/NationalInstruments/jquery.flot.scattergraph.js',
        'source/NationalInstruments/jquery.flot.cursors.js',
        'source/NationalInstruments/jquery.thumb.js',
        'source/NationalInstruments/jquery.flot.parkinglot.js',
        'source/NationalInstruments/jquery.flot.range.cursors.js',
        'source/NationalInstruments/jquery.flot.axishandle.js',
        'source/NationalInstruments/jquery.flot.charting.js',
        'source/NationalInstruments/jquery.flot.historybuffer.analogWaveform.js',
        'source/NationalInstruments/jquery.flot.historybuffer.js',
        'source/NationalInstruments/jquery.flot.historybuffer.numeric.js',
        'source/NationalInstruments/jquery.flot.segment-tree.js',
    ];
    return gulp.src(filesExist(src, { exceptionMessage: 'Missing file'}))
        .pipe(maps.init())
        .pipe(babel({
            presets: ['es2015'],
            plugins: ["external-helpers-2"]
        }))
        // .pipe(concat('jquery.flot.scattergraph.js'))
        .pipe(uglify({ecma: 5}))
        .pipe(maps.write('./'))
        .pipe(gulp.dest('dist/es5/NationalInstruments'));
});
gulp.task('build', gulp.series('build_flot_plugins', 'build_flot_ni'));
