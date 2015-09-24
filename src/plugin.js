/* wio plugin registration
*/

function register (id, obj) {
  // methods required for a wio plugin
  var methods = [
    'init',
    'authorize',
    'read',
    'update',
    'remove',
    'list'
  ];

  // check plugin methods
  methods.forEach(function (prop) {
    if(!obj.hasOwnProperty(prop)) {
      throw 'Invalid plugin *' + id + '*! Missing method: ' + prop;
    }
  })

  this.plugins = this.plugins || {}
  this.plugins[id] = obj
}

function init(pluginName) {
  this.params.options[pluginName] = this.params.options[pluginName] || {}
  this.constructor.plugins[pluginName].init.call(this, this.params.options[pluginName])
}

module.exports = {
  register: register,
  init: init
}
