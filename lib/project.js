'use strict';

class Project {

	static isRootCommand() {
		var isRunningFromRoot = (cli.root === cli.cwd);

		if (!cli.config || isRunningFromRoot) return true;
		//config has loaded, running in cwd project space

		switch (cli.config.commands[0]) {
		case "plugins":
		case "update":
		case "upgrade":
			//using one of the cli native commands
			return true;
		}

		return false;
	}

	static getPackageJSON() {

		var rootPackageJSON = JSON.parse(fs.readFileSync(path.join(cli.root, "package.json")));;

		if (Project.isRootCommand()) {
			return rootPackageJSON;
		}

		//using a command in the cwd plugin set
		var packageJSON;
		//running cli.cwd plugins

		console.log("loading from cwd", cli.cwd);

		var sourcePackageJSONPath = path.join(cli.cwd, "package.json");
		packageJSON = { dependencies: {} };
		try {
			var stat = fs.statSync(sourcePackageJSONPath);
			packageJSON = JSON.parse(fs.readFileSync(sourcePackageJSONPath));
			if (packageJSON.dependencies) {
				for (var k in packageJSON.dependencies) {
					cli.packageJSON.dependencies[k] = (!cli.packageJSON.dependencies[k] || cli.packageJSON.dependencies[k] === "*") ? sourcePackageJSON.dependencies[k] : cli.packageJSON.dependencies[k];
				}
			}
		} catch(e) {
			fs.writeFileSync(sourcePackageJSONPath, JSON.stringify(packageJSON));
		}	

		packageJSON.commonName = (packageJSON.commonName || "Unnamed Application");

		return packageJSON;
	}

	static getPaths() {
		var pluginFolder = path.join(__dirname, "../../");
		var npmFolder = cli.root;
		
		if (Project.isRootCommand()) {
			return {
				pluginFolder,
				npmFolder
			};
		}
		
		//running cli.cwd plugins
		pluginFolder = cli.plugins_path
		npmFolder = cli.cwd;

		return {
			pluginFolder,
			npmFolder
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