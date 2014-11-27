/*
* wio adapter for
* Crypto
*
*/

wio.adapter('crypto', (function() {
  'use strict';

  var blank = function(params, callback) {

    callback(null, {});

  };

  var init = function(options, w) {

    // TODO should I switch to this model
    // so that I have full control on adapter execution order?

    // this means the adapter should remove itself from the
    // adapters array, so it doesn't get executed twice
    // or just use empty `default` functions like it does now

    // or I could make a `priority` property for adapters??
    // and sort them based on it

    var prevRead = w.read;
    w.read = function(params, callback) {

      prevRead(params, function(err, res) {

        if(err) {
          callback(err);
          return false;
        }

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
