/*
 * wio
 * JavaScript file API for cloud storage
 *
 */

var wio = function(params) {
  'use strict';

  // defaults for the public methods
  var defaults = function(params, defaults, callback) {

    // check if we got the callback instead of the params
    if(typeof params === 'function') {
      callback = params;
      params = {};
    }

    // if callback not defined
    if(typeof callback === 'undefined') {
      callback = function(){};
    }

    // extend not-specified params with defaults
    params = params || {};
    for (var property in defaults) {
      if(typeof params[property] === 'undefined') {
        params[property] = defaults[property];
      }
    }

    return {
      params: params,
      callback: callback
    }

  };

  // parallel adapter run
  var runAdapters = function(adapters, run, params, callback) {

    var newestRes = {};
    var newestAdapter;
    var errors = [];

    var updateAdapters = adapters.slice();

    var ranAdapters = [];
    var checkRanAdapters = function() {

      // ran all adapters
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

        if(errors.length === 0) {
          errors = null;
        }

        // delete private properties
        // so they don't show up in the response
        if(newestRes && newestRes._adapter) {
          delete newestRes._adapter;
        }

        if(callback) {
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
        console.warn('Error from adapter: ' + adapter, err);

        errors.push({
          adapter: adapter,
          error: err
        });

        checkRanAdapters();

        return false;
      }

      if(run === 'read') {

        // if newestRes does not have the meta property
        // it's probably still blank
        if(!newestRes.meta) {
          newestRes = res;
        }

        if(res.meta && res.meta.modifiedDate) {

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
          if(adapters.indexOf(adapter) < adapters.indexOf(newestAdapter)) {

            newestRes = res;
            newestAdapter = adapter;

          }

        } else {

          // set the first value, if we don't have anything else
          newestRes = res;
          newestAdapter = adapter;

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

    params = defaults(params, {
      silent: false
    }, callback);

    // async run adapters
    runAdapters(adapters, 'authorize', params.params, params.callback);

  };

  var read = function(params, callback) {

    // make sure we have proper defaults
    params = defaults(params, {}, callback);

    // async run adapters
    runAdapters(adapters, 'read', params.params, params.callback);

  };

  var list = function(params, callback) {

    params = defaults(params, {}, callback);

    // async run adapters
    runAdapters(adapters, 'list', params.params, params.callback);

  };

  var update = function(params, callback) {

    params = defaults(params, {
      content: ''
    }, callback);

    // async run adapters
    runAdapters(adapters, 'update', params.params, params.callback);

  };

  var del = function(params, callback) {

    params = defaults(params, {}, callback);

    // async run adapters
    runAdapters(adapters, 'delete', params.params, params.callback);

  };

  // public methods
  var methods = {
    authorize: authorize,
    list: list,
    read: read,
    update: update,
    delete: del
  };

  // init adapters, and allow them to manipulate
  // the public methods
  var adapters = params.adapters;
  adapters.forEach(function(adapterName) {

    params.options[adapterName] = params.options[adapterName] || {};

    wio.adapters[adapterName].init(params.options[adapterName], methods);
  });

  return methods;

};

wio.adapters = {};

wio.adapter = function(id, obj) {
  'use strict';

  // methods required for a wio adapter
  var methods = [
    'init',
    'authorize',
    'read',
    'update',
    'delete',
    'list'
  ];

  // check adapter methods
  methods.forEach(function(prop) {
    if(!obj.hasOwnProperty(prop)) {
      throw 'Invalid adapter *' + id + '*! Missing method: ' + prop;
    }
  });

  wio.adapters[id] = obj;

};
