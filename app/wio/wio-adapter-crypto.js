/*
 * encryption adapter
 * for wio
 *
 */

wio.adapter('crypto', (function() {
  'use strict';

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

  return {
    authorize: blank,
    list: blank,
    read: blank,
    update: blank,
    delete: blank,

    init: init
  };
  
})());
