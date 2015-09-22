/* wio plugin registration
*/

function plugin (id, obj) {
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

module.exports = plugin
