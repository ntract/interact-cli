global.cli = {
	packageJSON: null, // running packageJSON (cli or cwd)
	project: null, 

	plugins_dirname: "plugins",

	root: null,
	root_plugins_path: null,

	cwd: null,
	plugins_path: null
};

cli.root = path.join(__dirname, "../../../");
cli.project = require("./project");

cli.root_plugins_path = path.join(cli.root, cli.plugins_dirname);
cli.cwd = path.join(process.cwd());
cli.plugins_path = path.join(cli.cwd, cli.plugins_dirname);


cli.packageJSON = cli.project.getPackageJSON();

cli.run = function() {

	//install initial cli dependencies
	cli.packageJSON = npm.install(cli.root, cli.packageJSON, {
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
		var rootBowerJSONs = cli.project.getBowerJSONS(cli.root_plugins_path);
		var bowerJSONs = cli.project.getBowerJSONS(projectPaths.pluginFolder);
		var npmDependencies = cli.project.getNPMDependencies(bowerJSONs);

		cli.packageJSON = cli.project.getPackageJSON();

		//automatically install plugin npm dependencies
		cli.packageJSON = npm.install(projectPaths.npmFolder, cli.packageJSON, npmDependencies, function(error, stdout, stderr) {

			console.log(cli.packageJSON.commonName);

			var wasCommandHandled = false;
			events.once("command:handled", function() {
				wasCommandHandled = true;
			});
			
			require("./update");

			//load cli global plugins (for use in sub projects)
			cli.project.loadGlobalPlugins(rootBowerJSONs); //cli.root_plugins_path);

			//load cwd local plugins (sub project);
			cli.project.loadPlugins(bowerJSONs);

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
};

module.exports = cli;