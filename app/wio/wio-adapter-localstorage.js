/*
 * localstorage adapter
 * for wio
 *
 */

wio.adapter('localstorage', (function() {
  'use strict';

  var storage = window.localStorage;

  var authorize = function(params, callback) {

    // nothing to authorize
    callback(null, {});

  };

  var list = function(params,  callback) {

    // should return an empty array
    // TODO or an error, if we can't find the path
    var files = [];

    // get all files in localstorage
    var i = 0;
    var fileName;
    var storageContent;

    for (i = 0; i < localStorage.length; i++) {

      fileName = window.localStorage.key(i);

      if(fileName.indexOf(params.path) !== -1) {

        storageContent = window.localStorage.getItem(fileName);

        if(storageContent) {
          storageContent = JSON.parse(storageContent);

          files.push(storageContent.meta);
        }

      }

    }

    callback(null, files);

  };

  var read = function(params,  callback) {

    var err = null;
    var file = storage.getItem(params.path);

    if(file) {
      file = JSON.parse(file);
    } else {

      err = {
        status: '404',
        path: params.path
      };

    }

    // don't return an error, maybe the file is in another adapter

    callback(err, file);

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

    //console.log('local file', file);

    callback(null, file);

  };

  var del = function(params,  callback) {

    var file = storage.removeItem(params.path);

    callback(null);

  };

  var init = function(options) {



  };

  return {
    authorize: authorize,
    list: list,
    read: read,
    update: update,
    delete: del,

    init: init
  };

})());
