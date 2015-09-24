/* javascript task
*/

var gulp = require('gulp')
var browserify = require('browserify')
var source = require('vinyl-source-stream')
var buffer = require('vinyl-buffer')
var sourcemaps = require('gulp-sourcemaps')
var config = require('../config')
var gutil = require('gulp-util')
var uglify = require('gulp-uglify')
var gulpif = require('gulp-if')
// var strictify = require('strictify')

var javascriptTask = function (opts) {

  opts = opts || {}

  var browserifyOptions = {
    entries: config.src + '/wio.js',
    debug: true
  }

  if (opts.minify === true) {
    browserifyOptions.debug = false
  }
  // set up the browserify instance
  var b = browserify(browserifyOptions)

  // using external source maps breaks the stream
  return b.bundle()
    .on('error', gutil.log)
    .pipe(source('wio.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(gulpif(opts.minify, uglify()))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(config.dist))
}

module.exports = javascriptTask
