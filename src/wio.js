/*
* wio
* JavaScript file API for cloud storage
*
*/

var adapter = require('./adapter')
var util = require('./util')

/* helpers
*/
// defaults for the public methods
var defaults = function (params, defaults, callback) {
  // check if we got the callback instead of the params
  if (typeof params === 'function') {
    callback = params
    params = {}
  }

  // if callback not defined
  if (typeof callback === 'undefined') {
    callback = function () {}
  }

  // extend not-specified params with defaults
  params = params || {}
  for (var property in defaults) {
    if (typeof params[property] === 'undefined') {
      params[property] = defaults[property]
    }
  }

  return {
    params: params,
    callback: callback
  }
}

// parallel adapter run
var runAdapters = function (adapters, run, params, callback) {
  var instance = this
  var newestRes = {}
  var newestAdapter
  var errors = []

  var updateAdapters = adapters.slice()

  var ranAdapters = []
  var checkRanAdapters = function () {
    // all adapters are not done
    if (ranAdapters.length !== adapters.length) {
      return
    }

    if (run === 'read') {
      if (newestAdapter) {
        // run update method on all adapters
        // that have an older version
        updateAdapters.splice(updateAdapters.indexOf(newestAdapter), 1)

        runAdapters.call(instance, updateAdapters, 'update', {
          path: params.path,
          content: newestRes.content,
          meta: newestRes.meta
        })
      }
    }

    if (errors.length === 0) {
      errors = null
    }

    // delete private properties
    // so they don't show up in the response
    if (newestRes && newestRes._adapter) {
      delete newestRes._adapter
    }

    if (callback) {
      return callback(errors, newestRes)
    }
  }

  var runner = function (err, res) {
    var adapter = res._adapter

    // add the adapter to the list of ran adapters
    ranAdapters.push(adapter)

    if (err) {
      // if the adapter has responded with an error
      // warn and add it to the errors object
      util.log('Error on *' + run + '* in adapter *' + adapter + '*', err)

      errors.push({
        adapter: adapter,
        error: err
      })

      checkRanAdapters()

      return false
    }

    if (run === 'read') {
      // if newestRes does not have the meta property
      // it's probably still blank
      if (!newestRes.meta) {
        newestRes = res
      }

      if (res.meta && res.meta.modifiedDate) {
        // compare newest response with current response file
        if (new Date(res.meta.modifiedDate) > new Date(newestRes.meta.modifiedDate)) {
          // return the newest response
          newestRes = res
          newestAdapter = adapter
        }
      }
    }

    if (run === 'list') {
      // consider the order of the adapters
      // and if the the other adapters return any values
      if (newestRes.length) {
        // if we already have a response
        // check if the current adapter is higher in the list
        if (adapters.indexOf(adapter) < adapters.indexOf(newestAdapter)) {
          newestRes = res
          newestAdapter = adapter
        }
      } else {
        // set the first value, if we don't have anything else
        newestRes = res
        newestAdapter = adapter
      }
    } else {
      newestRes = res
    }

    checkRanAdapters()
  }

  // run adapters
  adapters.forEach(function (adapter) {
    // TODO remove reference to Wio var
    Wio.adapters[adapter][run].call(this, params, function (err, res) {
      res = res || {}
      res._adapter = adapter
      runner(err, res)
    })
  }, this)
}

/* Wio constructor
*/
var Wio = function (params) {
  // ensure Wio was called as a constructor
  if (!(this instanceof Wio)) {
    return new Wio(params)
  }

  // make the params public
  this.params = params

  // init selected adapters
  Object.keys(this.params.adapters).forEach(adapter.init, this)
}

/* public methods
*/
Wio.prototype.authorize = function (params, callback) {
  params = defaults(params, {
    silent: false
  }, callback)

  // async run adapters
  runAdapters.call(this,
    Object.keys(this.params.adapters),
    'authorize',
    params.params,
    params.callback)
}

Wio.prototype.read = function (params, callback) {
  // make sure we have proper defaults
  params = defaults(params, {}, callback)

  // async run adapters
  runAdapters.call(this,
    Object.keys(this.params.adapters),
    'read',
    params.params,
    params.callback)
}

Wio.prototype.list = function (params, callback) {
  params = defaults(params, {}, callback)

  // async run adapters
  runAdapters.call(this,
    Object.keys(this.params.adapters),
    'list',
    params.params,
    params.callback)
}

Wio.prototype.update = function (params, callback) {
  params = defaults(params, {
    content: ''
  }, callback)

  // async run adapters
  runAdapters.call(this,
    Object.keys(this.params.adapters),
    'update',
    params.params,
    params.callback)
}

Wio.prototype.remove = function (params, callback) {
  params = defaults(this.params, {}, callback)

  // async run adapters
  runAdapters.call(this,
    Object.keys(this.params.adapters),
    'remove',
    params.params,
    params.callback)
}

/* adapter
*/
Wio.adapter = function () {
  adapter.register.apply(this, arguments)
}

Wio.adapter('localstorage', require('./wio-adapter-localstorage.js'))
Wio.adapter('gdrive', require('./wio-adapter-gdrive.js'))
Wio.adapter('dropbox', require('./wio-adapter-dropbox.js'))
Wio.adapter('crypto', require('./wio-adapter-crypto.js'))

/* exports
*/
module.exports = Wio
global.Wio = Wio
