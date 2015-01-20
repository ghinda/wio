/*
* wio adapter for
* Google Drive
*
*/

wio.adapter('gdrive', (function() {
  'use strict';

  var clientId;
  var apiKey;
  var scopes = 'https://www.googleapis.com/auth/drive';

  var authorize = function(params, callback) {

    var auth = function() {

      gapi.client.load('drive', 'v2', function() {

        gapi.auth.authorize({
          client_id: clientId,
          scope: scopes,
          immediate: params.silent
        }, function(authResult) {

          if (authResult && !authResult.error) {

            // access token has been successfully retrieved
            if(callback) {
              callback(null, authResult);
            }

          } else {

            // no access token could be retrieved
            // show the button to start the authorization flow.
            if(callback) {
              callback(authResult);
            }

          }

        });

      });

    };

    // check if api is really loaded
    if(typeof window.gapi === 'undefined') {
      // async load google api
      var script = document.createElement('script');
      script.setAttribute('src', 'https://apis.google.com/js/client.js?onload=WioCheckGapiClient');
      var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(script, s);

      window.WioCheckGapiClient = function() {
        if(apiKey) {
          gapi.client.setApiKey(apiKey);
        }

        auth();
      };
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

    var finder = function() {

      var mimeType = false;

      //if(index === parsedPath.length - 1) {
      if(index !== parsedPath.length - 1) {
        mimeType = 'application/vnd.google-apps.folder';
      }

      var q = 'title="' + parsedPath[index] + '" AND trashed=false';

      if(lastParent) {
        q += ' AND "' + lastParent.id + '" in parents';
      }

      if(mimeType) {
        q += ' AND mimeType="' + mimeType + '"';
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

            if(callback) {
              callback(null, response.items[0]);
            }

          }

        } else {

          if(callback) {

            callback({
              error: '404',
              path: currentPath,
              parent: lastParent
            });

          }

        }

      });

    };

    finder();

  };

  var list = function(params, callback) {

    find(params.path, function(err, fileMeta) {

      if(err) {
        callback(err);
        return false;
      }

      var request = gapi.client.drive.files.list({
        q: '"' + fileMeta.id + '" in parents  AND trashed=false'
      });

      request.execute(function(list) {

        if(list.items && list.items.length) {

          if(callback) {
            callback(null, list.items);
          }

        } else {

          if(callback) {
            callback({
              error: '404'
            });
          }

        }

      });

    });

  };

  var read = function(params, callback) {

    find(params.path, function(err, fileMeta) {

      if(err) {
        callback(err);
        return false;
      }

      var request = gapi.client.drive.files.get({
        fileId: fileMeta.id
      });

      request.execute(function(file) {

        if (file.downloadUrl) {
          var accessToken = gapi.auth.getToken().access_token;
          var xhr = new XMLHttpRequest();
          xhr.open('GET', file.downloadUrl);
          xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
          xhr.onload = function() {

            var file = {
              content: xhr.responseText,
              meta: fileMeta
            };

            if(callback) {
              callback(null, file);
            }

          };

          xhr.onerror = function(response) {

            if(callback) {
              callback(response);
            }

          };

          xhr.send();
        }

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
            if(callback) {
              callback(response);
            }
            return false;
          }

          if(callback) {
            callback(null, response);
          }

        });

      };

      var base64Data;

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

              console.log(response);

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

  var del = function(params, callback) {

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
          callback({
            error: 'Something went wrong'
          });

          return false;
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
    delete: del,

    init: init
  };

})());
