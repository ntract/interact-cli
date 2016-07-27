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
			//return true;
		}

		var sourcePackageJSONPath = path.join(cli.cwd, "package.json");
		try {
			fs.statSync(sourcePackageJSONPath);
		} catch (e) {
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
		var bowerJSONs = tree.mapGlobs(bowerJSONGlobs).files;

		var output = {};
		for (var i = 0, l = bowerJSONs.length; i < l; i++) {
			var bowerJSON = null;
			try {
				bowerJSON = JSON.parse(fs.readFileSync(bowerJSONs[i].location));
			} catch(e) {
				console.log("Invalid bower.json",bowerJSONs[i].location)
				continue;
			}
			if (bowerJSON) {
				var name = bowerJSON['name'];
				bowerJSON._location = bowerJSONs[i];
				output[name] = bowerJSON;
			}
		}

		return output;
	}

	static getNPMDependencies(bowerJSONs) {
		
		var dependencies = {};

		for (var p in bowerJSONs) {
			var bowerJSON = bowerJSONs[p];
			if (bowerJSON.npm) {
				for (var k in bowerJSON.npm) {
					
					if (!dependencies[k] || dependencies[k] === "*")
						dependencies[k] = bowerJSON.npm[k];

				}
			}
		}

		return dependencies;
	}

	static loadGlobalPlugins(bowerJSONs) {

		for (var k in bowerJSONs) {
			var bowerJSON = bowerJSONs[k];
			if (!bowerJSON.global) continue;

			var main = bowerJSON.main;

			var mainType = typeof main;
			if (mainType === "undefined") continue;
			if (mainType === "string") main = [main];

			var relativePath = path.join(bowerJSON._location.relativeLocation, "../");
			var absolutePath = bowerJSON._location.dirname;

			for (var i = 0, l = main.length; i < l; i++) {
				var relPath = path.join(relativePath, main[i]);
				var absPath = path.join(absolutePath, main[i]);

				define.globalRequires[relPath] = define.globalRequires[relPath] || require(absPath);
			}

		}

	}

	static loadPlugins(bowerJSONs) {

		for (var k in bowerJSONs) {
			var bowerJSON = bowerJSONs[k];
			if (bowerJSON.global) continue;

			var main = bowerJSON.main;

			var mainType = typeof main;
			if (mainType === "undefined") continue;
			if (mainType === "string") main = [main];

			var relativePath = path.join(bowerJSON._location.relativeLocation, "../");
			var absolutePath = bowerJSON._location.dirname;

			for (var i = 0, l = main.length; i < l; i++) {
				var relPath = path.join(relativePath, main[i]);
				var absPath = path.join(absolutePath, main[i]);

				define.globalRequires[relPath] = define.globalRequires[relPath] || require(absPath);
			}

		}

	}

};

module.exports = Project;