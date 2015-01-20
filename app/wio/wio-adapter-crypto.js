/*
* wio adapter for
* Crypto
*
*/

wio.adapter('crypto', (function() {
  'use strict';

  var blank = function(params, callback) {

    callback(null, []);

  };

  var init = function(options, w) {

    var prevRead = w.read;
    w.read = function(params, callback) {

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

  return {
    authorize: blank,
    list: blank,
    read: blank,
    update: blank,
    delete: blank,

    init: init
  };
  
})());
