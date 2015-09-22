/*
 * encryption adapter
 * for wio
 *
 */

var blank = function(params, callback) {

  callback(null, []);

};

var init = function(options, methods) {

  var prevRead = methods.read;
  methods.read = function(params, callback) {

    prevRead(params, function(err, res) {

      // TODO on read, decode after
      // TODO on write, encode before
      if(res.content) {
        res.content += 'CRYPTO';
      }

      callback(err, res);

    });

  };

};

module.exports = {
  authorize: blank,
  list: blank,
  read: blank,
  update: blank,
  remove: blank,

  init: init
}
