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

function init (pluginName) {
  this.params.options[pluginName] = this.params.options[pluginName] || {}
  this.constructor.adapters[pluginName].init.call(this, this.params.options[pluginName])
}

module.exports = {
  register: register,
  init: init
}
