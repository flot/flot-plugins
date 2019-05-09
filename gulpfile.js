var gulp = require('gulp');
var gulpSequence = require('gulp-sequence');
var filesExist = require('files-exist');

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
gulp.task('build', gulp.series('build_flot_plugins'));
