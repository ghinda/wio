/*
 * dropbox adapter
 * for wio
 *
 */

wio.adapter('dropbox', (function() {
  'use strict';

  var appKey;
  var client;

  // normalize file meta objects
  var normalizeMeta = function(meta) {

    // copy original metadata
    var normalizedMeta = JSON.parse(JSON.stringify(meta));

    normalizedMeta.modifiedDate = meta.modifiedAt;
    
    normalizedMeta.type = 'file';
    
    if(normalizedMeta.isFolder) {
      normalizedMeta.type = 'folder';
    }

    return normalizedMeta;
    
  };

  var authorize = function(params, callback) {

    var auth = function() {

      var interactive = true;
      
      if(typeof params.silent !== 'undefined') {
        interactive = params.silent;
      }
      
      client.authenticate({
        interactive: interactive
      }, function(err, client) {

        if(err) {
          return callback(err);
        }

        if(client.isAuthenticated()) {
          callback(null, client);
        }

      });

    };

    // check if dropbox.js is really loaded
    if(typeof window.Dropbox === 'undefined') {

      // async load dropbox api
      var script = document.createElement('script');

      script.setAttribute('src', '//cdnjs.cloudflare.com/ajax/libs/dropbox.js/0.10.2/dropbox.min.js');

      script.onload = function() {

        if(appKey) {
          client = new Dropbox.Client({ key: appKey });
        }

        auth();

      };

      var head = document.getElementsByTagName('head')[0];
      head.appendChild(script);

    } else {

      auth();

    }

  };

  var list = function(params, callback) {
    
    client.readdir(params.path, params, function(err, files, originMeta, filesMeta) {

      if(err) {
        return callback(err);
      }
      
      filesMeta.forEach(function(meta, index) {
        filesMeta[index] = normalizeMeta(meta);
      });

      callback(null, filesMeta);

    });

  };

  var read = function(params, callback) {

    console.log(params);
    
    client.readFile(params.path, params, function(err, file, meta) {
      if(err) {
        return callback(err);
      }

      callback(null, {
        meta: normalizeMeta(meta),
        content: file
      });
    });

  };

  var update = function(params, callback) {

    client.writeFile(params.path, params.content, params,
    function(err, meta) {
        if (err) {
          return callback(err);
        }

        callback(null, normalizeMeta(meta));

    });

  };

  var remove = function(params, callback) {

    client.remove(params.path,
    function(err, meta) {
        if (err) {
          return callback(err);
        }

        callback(null, normalizeMeta(meta));

    });

  };

  var init = function(options) {

    appKey = options.appKey;

  };

  return {
    authorize: authorize,
    read: read,
    list: list,
    update: update,
    remove: remove,

    init: init
  };

})());
