/*
 * encryption plugin
 * for wio
 *
 */

var blank = function (params, callback) {
  callback(null, [])
}

var init = function (options) {
  // the current wio instance
  var instance = this

  // overwrite the read method
  var prevRead = instance.read
  instance.read = function (params, callback) {
    prevRead.call(instance, params, function (err, res) {
      // TODO on read, decode after
      // TODO on write, encode before
      // if(res.content) {
      //   res.content += 'CRYPTO';
      // }

      console.log('crypto')

      callback(err, res)
    })
  }
}

module.exports = {
  authorize: blank,
  list: blank,
  read: blank,
  update: blank,
  remove: blank,

  init: init
}
