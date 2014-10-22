/*
* wio.js
* unified file manipulation api
*/

var WIO = function(params) {
  'use strict';

  /* normalize metadata
  */
  var normalize = function(meta) {
    normalizedMeta = JSON.parse(JSON.stringify(meta));

    // createdDate
    normalizedMeta.createdDate = meta.createdDate;

    // modifiedDate
    normalizedMeta.modifiedDate = meta.modifiedDate;

    return normalizedMeta;
  };

  /* simple extend for default params
  */
  var defaults = function(destination, source) {
    destination = destination || {};
    for (var property in source) {
      if(typeof destination[property] === "undefined") {
        destination[property] = source[property];
      }
    }

    return destination;
  };

  // async run all adapters
  var runAdapters = function(adapters, run, params, callback) {

    var i = 0;
    var newestRes = {};
    var newestAdapter;

    var updateAdapters = adapters.slice();

    var runner = function(err, res) {

      if(err) {
        return callback(err);
      }

      if(run === 'read') {

        if(!newestRes.meta && res.meta) {
          newestRes = res;
        }

        // if we don't return the meta property from the adapter
        // it means we don't want it compared
        // or messed with - eg. crypto
        if(newestRes.meta && res.meta) {

          // force oldest date
          // in case the file had no date / is nonexistent
          // so its adapter gets updated
          // on read from different adapter
          res.meta.modifiedDate = res.meta.modifiedDate || new Date('1970-01-01').toISOString();

          console.log(new Date(res.meta.modifiedDate));
          console.log(new Date(newestRes.meta.modifiedDate));

          // compare newest response with current response file
          if(new Date(res.meta.modifiedDate) > new Date(newestRes.meta.modifiedDate)) {

            // return the newest response
            newestRes = res;
            newestAdapter = adapters[i];

          }

        }

      }

      if(i < adapters.length - 1) {
        // start with the second adapter
        i++;
        return WIO.adapters[adapters[i]][run](params, runner);
      } else {

        if(run === 'read') {

          if(newestAdapter) {

            // TODO run update method in all adapters that have an older version

            updateAdapters.splice(updateAdapters.indexOf(newestAdapter), 1);

            runAdapters(updateAdapters, 'update', {
              path: params.path,
              content: newestRes.content,
              meta: newestRes.meta
            }, function() {
              console.log('done updating old adapters');
            });

            console.log(updateAdapters);

          }

        }

        return callback(err, newestRes);
      }

    };

    // run the first adapter
    WIO.adapters[adapters[i]][run](params, runner);


  };

  var authorize = function(params, callback) {

    params = defaults(params, {
      silent: false
    });

    // async run adapters
    runAdapters(adapters, 'authorize', params, callback);

  };

  var read = function(params, callback) {

    params = defaults(params, {});

    // async run adapters
    runAdapters(adapters, 'read', params, callback);

  };

  var update = function(params, callback) {

    params = defaults(params, {});

    // async run adapters
    runAdapters(adapters, 'update', params, callback);

  };

//   var read = function(params, callback) {
//
//     params = defaults(params, {
//       path: ''
//     });
//
//     adapter.read(params, function(err, file) {
//
//       file = file || {};
//       file.path = params.path;
//
//       // do offline stuff
//       offlineAdapter.read(file, function(err, response) {
//         if(err) return false;
//
//         // if the offline cached version is newer, update the remote one
//         if(response.updateRemote) {
//           adapter.update({
//             path: file.path,
//             content: response.file.content
//           }, function(err, response) {
//             console.log('cache update error', err);
//             console.log('cache update response', response);
//           });
//         }
//       });
//
//       callback(err, file);
//
//     });
//
//   };

//
// 	var update = function(params, callback) {
//
// 		params = defaults(params, {
// 			path: '',
// 			content: ''
// 		});
//
// 		adapter.update(params, function(err, meta) {
//
// 			params.meta = meta;
//
// 			// do offline stuff
// 			offlineAdapter.update(params, function(err, response) {
// 				if(err) return false;
// 			});
//
// 			callback(err, params);
//
// 		});
//
// 	};
//
// 	var remove = function(params, callback) {
//
// 		params = defaults(params, {
// 			path: ''
// 		});
//
// 		adapter.remove(params, function(err, file) {
//
// 			// offline stuff
//
// 			callback(err, file);
//
// 		});
//
// 	};

  // TODO list

  //console.log(params.adapters);

  // public methods
  wio = {
    authorize: authorize,
    read: read,
    update: update

// 		remove: remove
  }

  // init adapters, and allow them to manipulate public methods
  var adapters = params.adapters;
  adapters.forEach(function(adapterName) {
    WIO.adapters[adapterName].init(params.options[adapterName], wio);
  });

  return wio;

};

WIO.adapters = {};

WIO.adapter = function(id, obj) {

  // TODO check if adapter has all required methods

  // methods required to implement a wio adapter
    var implementing = 'authorize'.split(' ');

    // mix in the adapter
    implementing.forEach(function(prop) {
        if(!obj.hasOwnProperty(prop)) {
      throw 'Invalid adapter! Missing method: ' + prop
    }
    });

    WIO.adapters[id] = obj;

};
