var gulp         = require('gulp'),
    uglify       = require('gulp-uglify'),
    sourceMaps   = require('gulp-sourcemaps'),
    karma        = require('gulp-karma'),
    jshint       = require('gulp-jshint'),
    jshintConfig = require('./package').jshintConfig,
    distFiles    = [
      'bower_components/knockout/dist/knockout.js',
      'dist/knockout-datatable.js'
    ],
    testFiles    = [
      'test/*.js'
    ];

gulp.task('lint', function() {
  return gulp
    .src('./src/**/*.js')
    .pipe(jshint(jshintConfig))
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('build', ['lint'], function() {
  return gulp
  .src('./src/knockout-datatable.js')
  .pipe(sourceMaps.init())
  .pipe(uglify())
  .pipe(sourceMaps.write('.'))
  .pipe(gulp.dest('./dist'))
});

gulp.task('test', ['build'], function() {
  return gulp
    .src(distFiles.concat(testFiles))
    .pipe(karma({
      configFile: 'karma.conf.js',
      action: 'run'
    }));
});

gulp.task('watch', function() {
  gulp.watch(['./src/**/*.js', './test/**/*.js'], ['test']);
});

gulp.task('dev', ['watch', 'lint', 'build', 'test']);

gulp.task('default', ['lint', 'build']);
