'use strict';

const gulp = require('gulp'),
      sass = require('gulp-sass');

gulp.task('scss', () => {
    return gulp.src('./styles/scss/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./styles/css'));
});

gulp.task('default', () => {
    gulp.watch('./styles/scss/**/*.scss', ['scss']);
});

