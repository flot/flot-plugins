var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var babel = require('gulp-babel');
var maps = require('gulp-sourcemaps');
var gulpSequence = require('gulp-sequence');

gulp.task('build', gulpSequence('build_flot_plugins'));
gulp.task('build_flot_plugins', function() {
    gulp.src('source/JUMFlot/**')
        .pipe(gulp.dest('dist/source/JUMFlot'));
    gulp.src('examples/JUMFlot/**')
        .pipe(gulp.dest('dist/examples'));
    gulp.src('images/JUMFLot/**')
        .pipe(gulp.dest('dist/images'));
    gulp.src('docs/JUMFLot/**')
        .pipe(gulp.dest('dist/docs'));
});