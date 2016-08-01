'use strict';

class Plugins {

	constructor(installPath) {
		this.pluginsPath = path.join(installPath || cli.cwd, cli.plugins_dirname);
	}

	getInstalledPlugins() {
		
		var installed = {};

		var treecontext = new TreeContext({
			files: true,
			dirs: true,
			cache: false
		});
		var tree = treecontext.Tree(".", this.pluginsPath);
		var pjFiles = tree.mapGlobs([ "**/bower.json", "!**/res", "!**/cfg", "!**/root" ]).files;

		for (var i = 0, l = pjFiles.length; i < l; i++) {
			var bowerJSON = JSON.parse(fs.readFileSync(pjFiles[i].location).toString());
			installed[bowerJSON.name] = bowerJSON.version;
		}

		return installed;
	}

	getInstalledPluginData() {
		
		var installed = {};

		var treecontext = new TreeContext({
			files: true,
			dirs: true,
			cache: false
		});
		var tree = treecontext.Tree(".", this.pluginsPath);
		var pjFiles = tree.mapGlobs([ "**/bower.json", "!**/res", "!**/cfg", "!**/root" ]).files;

		for (var i = 0, l = pjFiles.length; i < l; i++) {
			var bowerJSON = JSON.parse(fs.readFileSync(pjFiles[i].location).toString());
			installed[bowerJSON.name] = bowerJSON;
		}

		return installed;
	}

	getDependantsList(installedPluginData) {
		installedPluginData = installedPluginData || this.getInstalledPluginData();

		var dependants = {};

		for (var k in installedPluginData) {
			dependants[k] = dependants[k] || [];
			if (!installedPluginData[k].dependencies) {
				continue;
			}
			var dependencies = installedPluginData[k].dependencies;
			for (var d in dependencies) {
				dependants[d] = dependants[d] || [];
				dependants[d].push(k);
			}
		}

		for (var k in dependants) {
			dependants[k] = _.uniq(dependants[k]);
		}

		return dependants;
	}

	removeOrphanedPlugins() {
		var installedPluginData = this.getInstalledPluginData();
		var dependantsList = this.getDependantsList(installedPluginData);

		for (var k in dependantsList) {
			if (dependantsList[k].length !== 0) continue;
			if (installedPluginData[k].library) {
				FileSystem.rm(path.join(this.pluginsPath, k));
			}
		}

	}

};

global.Plugins = Plugins;


class Plugin {

	constructor(name) {
		this.name = name;
		this.pluginJSON = null;
		this.pluginsPath = path.join(cli.cwd, cli.plugins_dirname);
		this.pluginPath = path.join(this.pluginsPath, this.name);
		this.load();
	}

	load() {
		
		try {
			this.pluginJSON = JSON.parse(fs.readFileSync(path.join(this.pluginPath, "bower.json")).toString());
		} catch(e) {
			console.log("Plugin not found", this.name);
		}
	}

	static splitVariable(pluginVariable) {
		var name, version;
		var atIndex = pluginVariable.indexOf("@");
		if (atIndex > -1) {
			name = pluginVariable.substr(0,atIndex);
			version = pluginVariable.substr(atIndex+1);
		} else {
			name = pluginVariable;
			version = "*";
		}

		return { name, version };
	}

}

global.Plugin = Plugin;

require("./plugins/build");
require("./plugins/compile");
require("./plugins/list");
require("./plugins/search");
require("./plugins/install");
require("./plugins/uninstall");
require("./plugins/register");
require("./plugins/unregister");