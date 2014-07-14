var gulp = require('gulp'),
    minifycss = require('gulp-minify-css'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    templateCache = require('gulp-angular-templatecache');

var del = require('del');

var projectName = 'usedbookscraper';

var paths = {
  scripts: 'app/**/*.js',
  styles: 'app/css/app.css',
  templates:  ['app/**/*.html', '!app/index.html'],
  prod: '../heroku_threadtest/public/'
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

gulp.task('templates', function() {
    gulp.src(paths.templates)
        .pipe(templateCache(projectName + '-templates.js', {
          module: 'ubsApp'
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('default', ['clean', 'scripts', 'styles', 'templates']);

// copy to production repo for pushing to heroku
gulp.task('copy', function() {
  gulp.src('dist/*').pipe(gulp.dest(paths.prod));
  gulp.src('prod/*').pipe(gulp.dest(paths.prod));
  gulp.src('static/**').pipe(gulp.dest(paths.prod + 'static/'));
});
