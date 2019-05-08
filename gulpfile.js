var gulp = require('gulp');
var gulpSequence = require('gulp-sequence');
var filesExist = require('files-exist');

gulp.task('build_flot_plugins', function () {
    'use strict';
    var src1 = ['source/JUMFlot/**'];
    var src2 = ['examples/JUMFlot/**'];
    var src3 = ['images/JUMFlot/**'];
    var src4 = ['docs/JUMFlot/**'];
    gulp.src(filesExist(src1, { exceptionMessage: 'Missing file'}))
        .pipe(gulp.dest('dist/source/JUMFlot'));
    gulp.src(filesExist(src2, { exceptionMessage: 'Missing file'}))
        .pipe(gulp.dest('dist/examples/JUMFlot'));
    gulp.src(filesExist(src3, { exceptionMessage: 'Missing file'}))
        .pipe(gulp.dest('dist/images/JUMFlot'));
    return gulp.src(filesExist(src4, { exceptionMessage: 'Missing file'}))
        .pipe(gulp.dest('dist/docs/JUMFlot'));
});
gulp.task('build', gulp.series('build_flot_plugins'));
