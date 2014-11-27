/*
* wio.js
* unified file manipulation api
*/

var wio = function(params) {
  'use strict';

  /* normalize metadata
   */
  var normalize = function(meta) {
    var normalizedMeta = JSON.parse(JSON.stringify(meta));

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

  // parallel run adapters
  var runAdapters = function(adapters, run, params, callback) {

    var newestRes = {};
    var newestAdapter;
    var errors = {};

    var updateAdapters = adapters.slice();

    var ranAdapters = [];
    var checkRanAdapters = function() {

      if(ranAdapters.length === adapters.length) {

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

        if(Object.keys(errors).length === 0) {
          errors = null;
        }

        if(callback) {

          // delete private properties
          // so they don't show up in the response
          if(newestRes && newestRes._adapter) {
            delete newestRes._adapter;
          }

          return callback(errors, newestRes);
        }

      }

    };

    var runner = function(err, res) {

      var adapter = res._adapter;

      // add the adapter to the list of ran adapters
      ranAdapters.push(adapter);

      if(err) {
        // if the adapter has responded with an error
        // warn and add it to the errors object
        console.warn(adapter, err);

        errors[adapter] = err;
        checkRanAdapters();

        return false;
      }

      if(run === 'read') {

        if(!newestRes.meta && res.meta) {
          newestRes = res;
        }

        /* TODO still relevant with new error structure?
        // if we don't return the meta property from the adapter
        // it means we don't want it compared
        // or messed with - eg. crypto
        */

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
            newestAdapter = adapter;

          }

        }

      } if(run === 'list') {

        // consider the order of the adapters
        // and if the the other adapters return any values
        if(newestRes.length) {

          // if we already have a response
          // check if the current adapter is higher in the list
          if(res.length && adapters.indexOf(adapter) < adapters.indexOf(newestAdapter)) {

            newestRes = res;
            newestAdapter = adapter;

          }

        } else if(res.length) {

          // set the first value, if we don't have anything else
          newestRes = res;
          newestAdapter = adapter;

        } else {

          // else just return an empty array
          newestRes = [];

        }

      } else {

        newestRes = res;

      }

      checkRanAdapters();

    };

    // run adapters
    adapters.forEach(function(adapter) {
      wio.adapters[adapter][run](params, function(err, res) {
        res = res || {};
        res._adapter = adapter;
        runner(err,res);
      });
    });

  };

  var authorize = function(params, callback) {

    // if the params are missing
    // but the callback is not
    if(typeof(params) === 'function') {
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

    if(typeof(params) === 'function') {
      callback = params;
      params = {};
    }

    params = defaultParams(params, {});

    // async run adapters
    runAdapters(adapters, 'read', params, callback);

  };

  var list = function(params, callback) {

    if(typeof(params) === 'function') {
      callback = params;
      params = {};
    }

    params = defaultParams(params, {});

    // async run adapters
    runAdapters(adapters, 'list', params, callback);

  };

  var update = function(params, callback) {

    if(typeof(params) === 'function') {
      callback = params;
      params = {};
    }

    params = defaultParams(params, {
      content: ''
    });

    // async run adapters
    runAdapters(adapters, 'update', params, callback);

  };

  var del = function(params, callback) {

    // TODO make sure we send a default callback
    // empty function, in all adapters
    // and remove if(callback) checks

    if(typeof(params) === 'function') {
      callback = params;
      params = {};
    }

    params = defaultParams(params, {});

    // async run adapters
    runAdapters(adapters, 'delete', params, callback);

  };

  // public methods
  var methods = {
    authorize: authorize,
    list: list,
    read: read,
    update: update,
    delete: del
  };

  // init adapters, and allow them to manipulate public methods
  var adapters = params.adapters;
  adapters.forEach(function(adapterName) {
    wio.adapters[adapterName].init(params.options[adapterName], methods);
  });

  return methods;

};

wio.adapters = {};

wio.adapter = function(id, obj) {
  'use strict';

  // TODO check if adapter has all required methods

  // methods required to implement a wio adapter
  var implementing = [
    'authorize'
  ];

  // mix in the adapter
  implementing.forEach(function(prop) {
    if(!obj.hasOwnProperty(prop)) {
      throw 'Invalid adapter *' + id + '*! Missing method: ' + prop;
    }
  });

  wio.adapters[id] = obj;

};
