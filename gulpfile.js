var gulp = require('gulp'),
    minifycss = require('gulp-minify-css'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    templateCache = require('gulp-angular-templatecache');

var del = require('del');

var projectName = 'usedbookscraper';

var paths = {
  scripts: 'app/js/**/*.js',
  styles: 'app/css/app.css',
  templates:  'app/partials/**/*.html'
};

gulp.task('clean', function(cb) {
  del(['dist'], cb);
});

gulp.task('styles', function() {
  return gulp.src(paths.styles)
    .pipe(rename(projectName + '.css'))
    .pipe(minifycss())
    .pipe(gulp.dest('dist'));
});

gulp.task('scripts', function() {
  return gulp.src(paths.scripts)
    .pipe(uglify())
    .pipe(concat(projectName + '.js'))
    .pipe(gulp.dest('dist'));
});

gulp.task('templates', function () {
    gulp.src(paths.templates)
        .pipe(templateCache())
        .pipe(rename(projectName + '-templates.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task('default', ['clean', 'scripts', 'styles', 'templates']);
