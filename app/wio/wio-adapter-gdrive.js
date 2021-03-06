/*
 * google drive adapter
 * for wio
 *
 */

wio.adapter('gdrive', (function() {
  'use strict';

  var clientId;
  var apiKey;
  var scopes = 'https://www.googleapis.com/auth/drive';

  // normalize metadata
  var normalizeMeta = function(meta) {
    
    // copy existing metadata
    var nmeta = JSON.parse(JSON.stringify(meta));

    nmeta.modifiedDate = meta.modifiedDate;
    nmeta.name = meta.title;
    nmeta.type = 'file';
    
    if(meta.mimeType === 'application/vnd.google-apps.folder') {
      nmeta.type = 'folder';
    }
    
    // placeholder
    // the path is overwritten before the callback
    nmeta.path = meta.name;

    return nmeta;
    
  };

  var authorize = function(params, callback) {

    var auth = function() {

      gapi.client.load('drive', 'v2', function() {

        gapi.auth.authorize({
          client_id: clientId,
          scope: scopes,
          immediate: params.silent
        }, function(authResult) {

          if (authResult && !authResult.error) {

            // access token successfully retrieved
            callback(null, authResult);

          } else {

            // no access token could be retrieved
            callback(authResult);

          }

        });

      });

    };

    // check if google drive api is loaded
    if(typeof window.gapi === 'undefined') {
      
      // async load the google api
      var $script = document.createElement('script');
      $script.setAttribute('src', 'https://apis.google.com/js/client.js?onload=WioCheckGapiClient');

      window.WioCheckGapiClient = function() {
        
        if(apiKey) {
          gapi.client.setApiKey(apiKey);
        }

        auth();
        
      };
      
      var $head = document.getElementsByTagName('head')[0]; 
      $head.appendChild($script);
      
    } else {
      
      auth();
      
    }

  };

  var find = function(path, callback) {

    var parsedPath = path.split('/');

    var index = 0;
    var lastParent;
    var currentPath = '';

    // if first item is blank, because url starts with /
    // use 'root' parent, to start searching from the root
    if(parsedPath[0] === '') {
      lastParent = {};
      lastParent.id = 'root';
      parsedPath.splice(0, 1);

      currentPath += '/';
    }

    // remove empty array items
    var i;
    for(i = parsedPath.length - 1; i >= 0; i--) {
      if(parsedPath[i] === '') {
        parsedPath.splice(i, 1);
      }
    }

    // if we have a blank path
    // just return root
    if(!parsedPath.length) {
      if(callback) {
        callback(null, lastParent);
      }

      return false;
    }

    var finder = function() {

      var mimeType = false;

      //if(index === parsedPath.length - 1) {
      if(index !== parsedPath.length - 1) {
        mimeType = 'application/vnd.google-apps.folder';
      }

      var q = '';

      if(parsedPath[index]) {
        q += 'title="' + parsedPath[index] + '" AND ';
      }

      q += 'trashed=false ';

      if(lastParent) {
        q += 'AND "' + lastParent.id + '" in parents ';
      }

      if(mimeType) {
        q += 'AND mimeType="' + mimeType + '"';
      }

      var request = gapi.client.drive.files.list({
        q: q
      });

      request.execute(function(response) {

        currentPath += parsedPath[index];

        if(response.items && response.items.length) {

          index++;
          if(index < parsedPath.length) {

            lastParent = response.items[0];
            finder();

            // if not last item
            currentPath += '/';

          } else {

            callback(null, response.items[0]);

          }

        } else {

          callback({
            error: '404',
            path: currentPath,
            parent: lastParent
          });

        }

      });

    };

    finder();

  };

  var list = function(params, callback) {

    find(params.path, function(err, fileMeta) {

      if(err) {
        return callback(err);
      }

      var request = gapi.client.drive.files.list({
        q: '"' + fileMeta.id + '" in parents AND trashed=false'
      });

      request.execute(function(res) {

        if(res.items && res.items.length) {

          // make sure we have / as last char
          var pathStart = params.path;
          if(pathStart[pathStart.length - 1] !== '/') {
            pathStart = pathStart + '/';
          }
          
          // normalize metadata
          res.items.forEach(function(item, index) {
            res.items[index] = normalizeMeta(item);
            
            // add full path
            res.items[index].path = pathStart + res.items[index].name;
          });
          
          callback(null, res.items);

        } else {
          
          callback(res);

        }

      });

    });

  };

  var read = function(params, callback) {

    find(params.path, function(err, fileMeta) {

      if(err) {
        return callback(err);
      }

      var request = gapi.client.drive.files.get({
        fileId: fileMeta.id
      });

      request.execute(function(file) {
        
        var downloadUrl = file.downloadUrl;
        
        // in case of google doc file, export pdf
        // TODO all gdoc formats support pdf, so use that
        // but we should make this configurable
        // https://developers.google.com/drive/web/manage-downloads
        
        // TODO can't seem to download gspreadsheets as pdf
        // because of cors error
        
        if(!downloadUrl && file['exportLinks']['application/pdf']) {
          downloadUrl = file['exportLinks']['application/pdf'];
        }

        var accessToken = gapi.auth.getToken().access_token;
        var xhr = new XMLHttpRequest();
        xhr.open('GET', downloadUrl);
        
        xhr.responseType = wio.util.responseType(params);
        
        xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
        xhr.onload = function() {

          var nMeta = normalizeMeta(fileMeta);
          
          // add file path
          nMeta.path = params.path;
          
          var file = {
            content: xhr.response,
            meta: nMeta
          };

          callback(null, file);

        };

        xhr.onerror = function(err) {

          callback(err);

        };

        xhr.send();

      });

    });

  };

  var utf8_to_b64 = function(str) {
    return window.btoa(window.unescape(window.encodeURIComponent(str)));
  };

  var update = function(params, callback) {

    var fileMeta = {};

    var updateFile = function() {

      var boundary = '-------314159265358979323846';
      var delimiter = '\r\n--' + boundary + '\r\n';
      var close_delim = '\r\n--' + boundary + '--';

      var contentType = params.mimeType || 'application/octet-stream';
      var metadata = {
        title: fileMeta.title,
        parents: fileMeta.parents
      };

      var makeRequest = function() {

        var multipartRequestBody =
          delimiter +
          'Content-Type: application/json\r\n\r\n' +
          JSON.stringify(metadata) +
          delimiter +
          'Content-Type: ' + contentType + '\r\n' +
          'Content-Transfer-Encoding: base64\r\n' +
          '\r\n' +
          base64Data +
          close_delim;

        var request = gapi.client.request({
          path: '/upload/drive/v2/files/' + (fileMeta.id || ''),
          method: fileMeta.id ? 'PUT' : 'POST',
          params: {
            uploadType: 'multipart'
            //alt: 'json'
          },
          headers: {
            'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
          },
          body: multipartRequestBody
        });

        request.execute(function(response) {

          if(response.error) {
            return callback(response);
          }

          var nMeta = normalizeMeta(response);
          
          // add full path
          nMeta.path = params.path;
          
          callback(null, nMeta);

        });

      };

      var base64Data;

      // check if string or binary
      if(typeof params.content === 'string') {

        // convert strings to b64

        base64Data = utf8_to_b64(params.content);

        makeRequest();

      } else {

        // must be blob

        var reader = new FileReader();
        reader.readAsBinaryString(params.content);
        reader.onload = function(e) {

          base64Data = window.btoa(reader.result);

          makeRequest();

        };

      }

    };

    find(params.path, function(err, meta) {

      if(err) {
        // if path is not found, something wasn't found in the path

        var parsedPath = err.path.split('/');

        // check if file or folder wasn't found
        if(err.path.split('.').length > 1) {

          // create file
          fileMeta.title = parsedPath[parsedPath.length - 1];
          fileMeta.parents = (err.parent) ? [ err.parent ] : [];

          updateFile();

        } else {

          // create folder
          var request = gapi.client.drive.files.insert({
            resource: {
              title: parsedPath[parsedPath.length - 1],
              mimeType: 'application/vnd.google-apps.folder',
              parents: (err.parent) ? [ err.parent ] : []
            }
          });

          request.execute(function(response) {

            if(response.error) {
              callback(response);
            } else {

              // try again with the full path
              update(params, callback);

            }

          });

        }

      } else {
        fileMeta = meta;
        updateFile();
      }
    });

  };

  var remove = function(params, callback) {

    find(params.path, function(err, fileMeta) {

      if(err) {
        callback(err);
        return false;
      }

      var request = gapi.client.drive.files.delete({
        fileId: fileMeta.id
      });

      request.execute(function(file) {

        if(!file) {
          return callback({
            error: 'Something went wrong'
          });
        }

        callback(null, file);

      });

    });

  };

  var init = function(options) {

    clientId = options.clientId;
    apiKey = options.apiKey;
    scopes = options.scopes || scopes;

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
