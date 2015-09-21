var requireDir = require('require-dir')
var config = require('./config')
requireDir(config.build, { recurse: true })
