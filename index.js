global.path = require("path"); //always useful
global.fs = require("fs"); //always useful
global.url = require("url"); //always useful
global.events = new (require('events').EventEmitter)(); //handle global events
global.events.setMaxListeners(2000); // stop memory leak warning

global.npm = require("./lib/npm.js"); //custom npm installer
global.yesno = require("./lib/yesno"); //question asker
global.define = require("./lib/requirejs"); //mimic basic requirejs interaface
global.plugins = require("./lib/plugins"); //plugins loading interface
global.switches = require("./lib/switches"); //switches interface
global.commands = require("./lib/commands"); //commands interface

require("./help/index");
require("./help/update");
global.cli = require("./lib/cli");
global.cli.run();