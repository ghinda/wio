/*
* WIO adapter for
* LocalStorage
*
*/

WIO.adapter('localstorage', (function() {

  var storage = window.localStorage;

  var authorize = function(params, callback) {

    // nothing to authorize
    callback(null, {});

  };

  var read = function(params,  callback) {

    var file = storage.getItem(params.path) || {};

    // don't return an error, maybe the file is in another adapter

    callback(null, file);

  };

  var update = function(params, callback) {

    var file = {
      meta: {
        modifiedDate: new Date().toISOString()
      },
      content: params.content
    };
    
    storage.setItem(params.path, JSON.stringify(file));

    callback(null, file);

  };

  var init = function(options) {



  };

  return {
    authorize: authorize,
    read: read,
    update: update,

    init: init
  }
})());
