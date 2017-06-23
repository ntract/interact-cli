commands
.on(['plugins', '^(uninstall|remove)'], function(done) {

	done({stop:true});

	var plugins = cli.config.commands.slice(2);

	var sourcePath = path.join(cli.cwd);

	perform(sourcePath, "uninstall", plugins);

});

cli.plugins.uninstall = function(sourcePath, plugins, options) {

	options = options || {};
	options.force = true;
	if (plugins.length === 0) {
		console.log("No plugins specified.")
		return;
	}

	console.log("Uninstalling...")

	try {
		fs.accessSync(path.join(sourcePath,"package.json"), fs.W_OK);
	} catch(e) {
		console.log("Cannot write to",path.join(sourcePath,"package.json"),"perhaps run as sudo?");
		return;
	}

	options = options || {};

	var installPath = path.join(sourcePath, cli.plugins_dirname);

	var pluginsTool = new Plugins(sourcePath);

	var installedData = pluginsTool.getInstalledPluginData();
	var dependants = pluginsTool.getDependantsList(installedData);

	var uninstall = {};
	var tocheck = plugins.slice(0);
	var i = 0;
	while (tocheck.length > 0 && i < 100) {
		var plugin = tocheck.shift();
		uninstall[plugin] = true;
		var deps = dependants[plugin];
		tocheck = tocheck.concat(deps);
		i++;
	}
	
	for (var k in uninstall) {
		console.log(k+"#"+installedData[k].version);
	}
	
	if (!options.force) {
		yesno.ask("Continue? y/n:", null, function(ok) {
			if (!ok) {
				console.log("Finished.")
				return;
			}
			accept();
		});
	} else accept();

	function accept() {

		var name = "unknown";
		var packageJSON;
		try {
			packageJSON = JSON.parse(fs.readFileSync(path.join(cli.cwd, "package.json")).toString());
			name = packageJSON.name;
		} catch (e) {
			packageJSON = {name:name};
		}

		var bowerJSON;
		try {
			bowerJSON = JSON.parse(fs.readFileSync(path.join(cli.cwd, "bower.json")).toString());
		} catch (e) {
			bowerJSON = { dependencies: {} };
		}
		bowerJSON.dependencies = bowerJSON.dependencies || {};

		var treecontext = new TreeContext({
			files: true,
			dirs: true,
			cache: true
		});

		var tree = treecontext.Tree(installPath, cli.plugins_path);
		var result = tree.mapGlobs([
			"**/root/*",
			"**/root/**"
		]);
		var files = result.files.concat(result.dirs);

		var truncated = [];
		for (var i = 0, l = files.length; i < l; i++) {
			var file = files[i];
			var posOfRoot = file.relativeLocation.lastIndexOf("/root/");
			if (posOfRoot === -1) continue;
			file.truncated = file.relativeLocation.slice(posOfRoot+6);
			truncated.push(file);
		}

		console.log("Removing root files...");

		var deleteFiles = _.pluck(truncated, "truncated");
		for (var i = 0, l = deleteFiles.length; i < l; i++) {
			var delFile = path.join(cli.cwd, deleteFiles[i]);
			try {
				FileSystem.rm(delFile);
			} catch (e) {

			}
		}

		console.log("Uninstalling...");

		for (var k in uninstall) {
			var p = path.join(cli.cwd, "plugins", k);
			FileSystem.rm(p);
		}

		pluginsTool.removeOrphanedPlugins();

		cli.compile(sourcePath);

		var installedData = pluginsTool.getInstalledPluginData();

		for (var k in bowerJSON.dependencies) {
			if (!installedData[k]) {
				delete bowerJSON.dependencies[k];
			}
		}

		//reload package json
		name = "unknown";
		try {
			packageJSON = JSON.parse(fs.readFileSync(path.join(cli.cwd, "package.json")).toString());
			name = packageJSON.name;
		} catch (e) {
			packageJSON = {name:name};
		}
		bowerJSON.name = name;

		fs.writeFileSync( path.join(cli.cwd, "package.json"), JSON.stringify( packageJSON, null, "    " ) );

		fs.writeFileSync(path.join(cli.cwd, "bower.json"), JSON.stringify(bowerJSON, null, "    "));

		if (typeof options.success === "function") {
			options.success();
		} else {
			console.log("Finished.");
		}
		
	}
	
};