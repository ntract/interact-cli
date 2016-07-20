'use strict';

class Project {

	static getPaths() {
		var pluginFolder = path.join(__dirname, "../");
		var npmFolder = cli.root;
		var packageJSON;
		if (cli.root !== cli.cwd && cli.config.commands[0] === "run") {
			//if cli code is used from one plugin setup to run another
			cli.config.commands.shift(); //drop the run command
			//running cli.cwd plugins
			pluginFolder = cli.plugins_path
			npmFolder = cli.cwd;
			var sourcePackageJSONPath = path.join(cli.cwd, "package.json");
			var sourcePackageJSON = { dependencies: {} };
			try {
				var stat = fs.statSync(sourcePackageJSONPath);
				sourcePackageJSON = JSON.parse(fs.readFileSync(sourcePackageJSONPath));
				packageJSON = sourcePackageJSON;
				if (sourcePackageJSON.dependencies) {
					for (var k in sourcePackageJSON.dependencies) {
						cli.application.dependencies[k] = (!cli.application.dependencies[k] || cli.application.dependencies[k] === "*") ? sourcePackageJSON.dependencies[k] : cli.application.dependencies[k];
					}
				}
			} catch(e) {
				fs.writeFileSync(sourcePackageJSONPath, JSON.stringify(sourcePackageJSON));
			}
			console.log((sourcePackageJSON.commonName || "Unnamed Application"));
		} else {
			//running cli plugins
			console.log(cli.application.commonName);		
			packageJSON = cli.application;	
		}
		return {
			pluginFolder,
			npmFolder,
			packageJSON
		};
	}

	static getBowerJSONS(pluginFolder) {

		var treecontext = new TreeContext({
		    files: true,
		    dirs: true,
		    cache: true
		});

		var bowerJSONGlobs = new GlobCollection([
			"**/bower.json",
			"!**/res",
			"!**/root"
		]);

		//load plugins
		var tree = treecontext.Tree(".", pluginFolder);
		var bowerJSONS = tree.mapGlobs(bowerJSONGlobs).files;

		var output = {};
		for (var i = 0, l = bowerJSONS.length; i < l; i++) {
			var bowerJSON = null;
			try {
				bowerJSON = JSON.parse(fs.readFileSync(bowerJSONS[i].location));
			} catch(e) {
				console.log("Invalid bower.json",bowerJSONS[i].location)
				continue;
			}
			if (bowerJSON) {
				var name = bowerJSON['name'];
				output[name] = bowerJSON;
			}
		}

		return output;
	}

	static getNPMDependencies(pluginFolder) {
		
		var bowerJSONS = Project.getBowerJSONS(pluginFolder);
		var dependencies = {};

		for (var p in bowerJSONS) {
			var bowerJSON = bowerJSONS[p];
			if (bowerJSON.npm) {
				for (var k in bowerJSON.npm) {
					
					if (!dependencies[k] || dependencies[k] === "*")
						dependencies[k] = bowerJSON.npm[k];

				}
			}
		}

		return dependencies;
	}

	static loadGlobalPlugins(pluginFolder) {

		var treecontext = new TreeContext({
		    files: true,
		    dirs: true,
		    cache: true
		});

		var globs = new GlobCollection([
			"**/global.js",
			"global.js",
			"!**/res",
			"!**/root"
		]);

		var tree = treecontext.Tree(".", pluginFolder);
		
		//require all found plugins
		var modules = tree.mapGlobs(globs);
		for (var i = 0, l = modules.files.length; i < l; i++) {
			define.globalRequires[modules.files[i].relativeLocation] = define.globalRequires[modules.files[i].relativeLocation] || require(modules.files[i].location);
		}
	}

	static loadPlugins(pluginFolder) {

		var treecontext = new TreeContext({
		    files: true,
		    dirs: true,
		    cache: true
		});

		var globs = new GlobCollection([
			"**/index.js",
			"index.js",
			"!**/res",
			"!**/root"
		]);

		var tree = treecontext.Tree(".", pluginFolder);
		
		//require all found plugins
		var modules = tree.mapGlobs(globs);
		for (var i = 0, l = modules.files.length; i < l; i++) {
			define.globalRequires[modules.files[i].relativeLocation] = define.globalRequires[modules.files[i].relativeLocation] || require(modules.files[i].location);
		}
	}

};

module.exports = Project;