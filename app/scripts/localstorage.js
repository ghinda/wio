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

    var file = storage.getItem(params.path) || '{ "meta": {} }';

    // don't return an error, maybe the file is in another adapter

    callback(null, JSON.parse(file));

  };

  var update = function(params, callback) {

    var modifiedDate = new Date().toISOString();

    if(params.meta && params.meta.modifiedDate) {
      modifiedDate = params.meta.modifiedDate;
    }

    var file = {
      meta: {
        modifiedDate: modifiedDate
      },
      content: params.content
    };
    
    storage.setItem(params.path, JSON.stringify(file));

    console.log('local file', file);

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
