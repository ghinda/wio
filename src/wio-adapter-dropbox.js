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
  
  var parseQueryParams = function(qstr) {
    var query = {};
    var a = qstr.split('&');
    for (var i in a)
    {
      var b = a[i].split('=');
      query[decodeURIComponent(b[0])] = decodeURIComponent(b[1]);
    }

    return query;
  };
  
  /* check if the popup-auth window has redirected
   * to the original url, and get the auth token from the hash.
   */
  var checkPopupHash = function(window) {
    
    var token = null;
    
    /* we have to use a try catch because it throws
     * an error while in the oauth flow,
     * and the popup has a different origin.
     * the try-catch is ugly but avoids having to use
     * an extra url just for the oauth callback.
     */
    try {
      
      var hash = window.location.hash.substr(1);
      
      // if we can (popup is on the same origin)
      // get the token from the url
      if(hash) {
        token = parseQueryParams(hash);
        
        // close the popup
        window.close();
      }
      
    } catch(e) {}
    
    return token;
    
  };
  
  var popupAuthDriver = {
    authType: function() {
      return 'token';
    },
    url: function() {
      return window.location.href;
    },
    doAuthorize: function(authUrl, stateParm, client, callback) {
      
      var popupWidth = 600;
      var popupHeight = 500;
      var popupLeft = (window.outerWidth - popupWidth) / 2;
      var popupTop = (window.outerHeight - popupHeight) / 2;
      
      // make it look like a popup
      // and center it onscreen
      var authWindow = window.open(authUrl, 'wio-dropbox-auth-popup', 'location=no, width=' + popupWidth+ ', height=' + popupHeight + ', top=' + popupTop +', left=' + popupLeft);
      
      var authCheckInterval = setInterval(function() {
        
        var token = checkPopupHash(authWindow);
        
        if(token) {
          clearInterval(authCheckInterval);
          clearTimeout(authTimeout);
          
          callback(token);
        }
        
      }, 1000);
      
      // if the auth flow is not done in 10s
      // we'll consider the popup closed,
      // and stop trying to get the hash.
      var authTimeout = setTimeout(function() {
          
        clearInterval(authCheckInterval);
        
        callback({
          error: 'access_denied',
          error_description: 'OAuth authorization timeout. The authorization popup was probably closed.'
        });
        
        client.reset();
      
      // TODO make the timeout configurable?
      }, 10000);
      
    }
  };

  var authorize = function(params, callback) {

    var auth = function() {

      var interactive = !params.silent;
      
      if(client.isAuthenticated()) {
        
        callback(null, client);
        
      } else {
        
        client.authDriver(popupAuthDriver);
        
        // TODO close the popup and continue the flow after accepting
        
        client.authenticate({
          interactive: interactive
        }, function(err, client) {

          if(err) {
            return callback(err);
          }

          callback(null, client);

        });
        
      }

    };

    // check if dropbox.js is really loaded
    if(typeof window.Dropbox === 'undefined') {

      // async load dropbox api
      var script = document.createElement('script');

      script.setAttribute('src', '//cdnjs.cloudflare.com/ajax/libs/dropbox.js/0.10.2/dropbox.min.js');

      script.onload = function() {

        if(appKey) {
          client = new Dropbox.Client({ key: appKey });
          
          auth();
          
        } else {
          
          wio.log('No appKey specified for the Dropbox adapter!');
          
        }


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
    
    var responseType = wio.util.responseType(params);
    
    if(responseType === 'blob') {
      params.blob = true;
    }
    
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
