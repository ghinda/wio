/*
* wio.js
* unified file manipulation api
*/

var wio = function(params) {
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

  /* check and extend params
   */
  var defaultParams = function(destination, source, callback) {

    destination = destination || {};
    for (var property in source) {
      if(typeof destination[property] === 'undefined') {
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
        return wio.adapters[adapters[i]][run](params, runner);
      } else {

        if(run === 'read') {

          if(newestAdapter) {

            // run update method on all adapters
            // that have an older version

            updateAdapters.splice(updateAdapters.indexOf(newestAdapter), 1);

            runAdapters(updateAdapters, 'update', {
              path: params.path,
              content: newestRes.content,
              meta: newestRes.meta
            });

          }

        }

        return callback(err, newestRes);
      }

    };

    // run the first adapter
    wio.adapters[adapters[i]][run](params, runner);


  };

  var authorize = function(params, callback) {

    // if the params are missing
    // but the callback is not
    if(typeof(params) == 'function') {
      callback = params;
      params = {};
    }

    params = defaultParams(params, {
      silent: false
    });

    // async run adapters
    runAdapters(adapters, 'authorize', params, callback);

  };

  var read = function(params, callback) {

    if(typeof(params) == 'function') {
      callback = params;
      params = {};
    }

    params = defaultParams(params, {});

    // async run adapters
    runAdapters(adapters, 'read', params, callback);

  };

  var list = function(params, callback) {

    if(typeof(params) == 'function') {
      callback = params;
      params = {};
    }

    params = defaultParams(params, {});

    // async run adapters
    runAdapters(adapters, 'list', params, callback);

  };

  var update = function(params, callback) {

    if(typeof(params) == 'function') {
      callback = params;
      params = {};
    }

    params = defaultParams(params, {});

    // async run adapters
    runAdapters(adapters, 'update', params, callback);

  };

  // TODO list

  // TODO remove

  //console.log(params.adapters);

  // public methods
  var methods = {
    authorize: authorize,
    list: list,
    read: read,
    update: update

//  remove: remove
  }

  // init adapters, and allow them to manipulate public methods
  var adapters = params.adapters;
  adapters.forEach(function(adapterName) {
    wio.adapters[adapterName].init(params.options[adapterName], methods);
  });

  return methods;

};

wio.adapters = {};

wio.adapter = function(id, obj) {

  // TODO check if adapter has all required methods

  // methods required to implement a wio adapter
    var implementing = 'authorize'.split(' ');

    // mix in the adapter
    implementing.forEach(function(prop) {
        if(!obj.hasOwnProperty(prop)) {
      throw 'Invalid adapter! Missing method: ' + prop
    }
    });

    wio.adapters[id] = obj;

};
