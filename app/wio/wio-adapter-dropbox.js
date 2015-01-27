/*
 * dropbox adapter
 * for wio
 *
 */

wio.adapter('dropbox', (function() {
  'use strict';

  var appKey;
  var client;

  /* normalize file metadata
   */
  var normalize = function(meta) {

    var normalizedMeta = JSON.parse(JSON.stringify(meta));

    // createdDate
    normalizedMeta.createdDate = meta.createdDate;

    // modifiedDate
    normalizedMeta.modifiedDate = meta.modifiedDate;

    return normalizedMeta;
    
  };

  // normalize file lists
  var normalizeList = function(files) {

    var normalizedList = [];
    var fileName = '';
    var lastFolder;

    var i;
    for(i = 0; i < files.length; i++) {

      lastFolder = files[i].lastIndexOf('/') + 1;
      fileName = files[i].substring(lastFolder, files[i].length);

      normalizedList.push({
        path: files[i],
        name: fileName
      });
    }

    return normalizedList;

  };

  var authorize = function(params, callback) {

    var auth = function() {

      client.authenticate({
        interactive: params.interactive || true
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

    client.readdir(params.path, function(err, files) {

      if(err) {
        return callback(err);
      }

      files = normalizeList(files);

      callback(null, files);

    });

  };

  var read = function(params, callback) {

    client.readFile(params.path, function(err, file, meta) {
      if(err) {
        return callback(err);
      }

      callback(null, {
        meta: meta,
        content: file
      });
    });

  };

  var utf8_to_b64 = function(str) {
    return window.btoa(window.unescape(window.encodeURIComponent(str)));
  };

  var update = function(params, callback) {

    client.writeFile(params.path, params.content,
    function(err, meta) {
        if (err) {
          return callback(err);
        }

        callback(null, meta);

    });

  };

  var del = function(params, callback) {

    client.remove(params.path,
    function(err, meta) {
        if (err) {
          return callback(err);
        }

        callback(null, meta);

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
    delete: del,

    init: init
  };

})());
