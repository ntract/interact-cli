global.path = require("path"); //always useful
global.fs = require("fs"); //always useful
global.url = require("url"); //always useful
global.events = new (require('events').EventEmitter)(); //handle global events

global.npm = require("./npm.js"); //custom npm installer
global.yesno = require("./yesno"); //question asker
global.define = require("./requirejs"); //mimic basic requirejs interaface

global.cli = {
	application: null,
	project: null,
	plugins_dirname: "plugins",
	root: null,
	root_plugins_path: null,
	cwd: null,
	plugins_path: null
};

cli.application = JSON.parse(fs.readFileSync(path.join(__dirname, "../../package.json")));
cli.project = require("./project");
cli.root = path.join(__dirname, "../../");
cli.root_plugins_path = path.join(cli.root, cli.plugins_dirname);
cli.cwd = path.join(process.cwd());
cli.plugins_path = path.join(cli.cwd, cli.plugins_dirname);

events.setMaxListeners(2000); // stop memory leak warning

//install initial cli dependencies
cli.application = npm.install(cli.root, cli.application, {
	"buildkit-globber": "*",
	"chalk": "*",
	"underscore": "*",
	"npm": "*"
}, function(error, stdout, stderr) {

	//load environment globals
	global._ = require("underscore"); //always useful

	//file system glob handlers (very useful)
	global.GlobCollection = require("buildkit-globber").GlobCollection;
	global.TreeContext = require("buildkit-globber").TreeContext;
	global.Tree = require("buildkit-globber").Tree;
	global.WatchCollection = require("buildkit-globber").WatchCollection;
	global.FileSystem = require("buildkit-globber").FileSystem;
	global.Location = require("buildkit-globber").Location;
	global.MATCH_TYPE = require("buildkit-globber").MATCH_TYPE;

	//handle forced exit message
	process.on('SIGINT', function ShutdownHandler() {
	    console.log("Shutting down...");
	    events.emit("modules:destroy");
	    process.stdin.unref()
	    process.exit();
	});

	cli.config = require("./argumental").parse(process.argv);

	events.emit("config:ready", cli.config);

	var projectPaths = cli.project.getPaths();
	var npmDependencies = cli.project.getNPMDependencies(projectPaths.pluginFolder);
	
	//automatically install plugin npm dependencies
	cli.application = npm.install(projectPaths.npmFolder, projectPaths.packageJSON, npmDependencies, function(error, stdout, stderr) {

		var wasCommandHandled = false;
		events.once("command:handled", function() {
			wasCommandHandled = true;
		});

		require("./update");

		//load cli global plugins (for use in sub projects)
		cli.project.loadGlobalPlugins(cli.root_plugins_path);
		//load cwd local plugins (sub project);
		cli.project.loadPlugins(projectPaths.pluginFolder);

		events.emit("modules:preloaded");

		_.defer(function(){
			
			events.emit("modules:loaded");

			if (!wasCommandHandled) {
				events.emit("command:unhandled");
			}
		});

	});


	events.emit("plugins:initialized");

}, true);