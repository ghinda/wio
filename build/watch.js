/* watch task
*/

var browserSync = require('browser-sync').create()
var gulp = require('gulp')
var debug = require('gulp-debug')
var standard = require('gulp-standard')
var config = require('../config')

var javascriptTask = require('./javascript')

gulp.task('watch', function () {
  // start the local server
  browserSync.init({
    server: {
      baseDir: [
        config.site,
        config.dist
      ]
    },
    port: 9000,
    open: false
  })

  gulp.watch(config.src + '/**/*.js', function (event) {
    javascriptTask()
    .pipe(debug())
    .pipe(browserSync.stream())
  })

  javascriptTask()

  var allJsPath = '{' +
  config.src + ',' +
  config.site + ',' +
  config.build +
  '}/**/*.js'

  // lint
  gulp.watch(allJsPath, function (event) {
    // lint changed file
    gulp.src(event.path)
    .pipe(standard())
    .pipe(standard.reporter('default'))
  })

  // lint everything
  gulp.src(allJsPath)
  .pipe(standard())
  .pipe(standard.reporter('default'))
})
