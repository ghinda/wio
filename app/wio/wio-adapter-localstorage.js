/*
* wio adapter for
* LocalStorage
*
*/

wio.adapter('localstorage', (function() {

  var storage = window.localStorage;

  var authorize = function(params, callback) {

    // nothing to authorize
    callback(null, {});

  };

  var list = function(params,  callback) {

    var files = [];

    // get all files in localstorage
    var i = 0;
    var fileName;
    var storageContent;

    for (i = 0; fileName = window.localStorage.key(i); i++) {

      if(fileName.indexOf(params.path) !== -1) {
        storageContent = window.localStorage.getItem(fileName);
        files.push(JSON.parse(storageContent.meta));
      }

    }

    callback(null, files);

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
    list: list,
    read: read,
    update: update,

    init: init
  }
})());
