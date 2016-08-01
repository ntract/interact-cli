'use strict';

events.once("modules:loaded", function() {
	FileSystem.mkdir(path.join(cli.root, "data"),{norel:true});
});



class Registries {

	constructor(installPath) {
		this.registriesPath = path.join(installPath || cli.cwd, cli.plugins_dirname);
	}


	
}

global.Registries = Registries;

require("./registries/list");
require("./registries/add");
require("./registries/remove");