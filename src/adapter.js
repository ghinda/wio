/* wio adapter registration
*/

function register (id, obj) {
  // methods required for a wio adapter
  var methods = [
    'init',
    'authorize',
    'read',
    'update',
    'remove',
    'list'
  ]

  // check adapter methods
  methods.forEach(function (prop) {
    if (!obj.hasOwnProperty(prop)) {
      throw new Error('Invalid adapter *' + id + '*! Missing method: ' + prop)
    }
  })

  this.adapters = this.adapters || {}
  this.adapters[id] = obj
}

function init (adapterName) {
  this.constructor.adapters[adapterName].init.call(this, this.params.adapters[adapterName])
}

module.exports = {
  register: register,
  init: init
}
