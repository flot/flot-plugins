var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var babel = require('gulp-babel');
var maps = require('gulp-sourcemaps');
var gulpSequence = require('gulp-sequence');

gulp.task('build', gulpSequence('build_flot_plugins'));

gulp.task('build_flot_plugins', function() {
    return gulp.src('source/**')
        .pipe(gulp.dest('dist/source'));
});