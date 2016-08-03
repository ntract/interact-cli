'use strict';

events.once("modules:loaded", function() {
	FileSystem.mkdir(path.join(cli.root, "data"),{norel:true});
});



class Registries {

	constructor(configPath) {
		this.registriesPath = path.join(configPath || cli.config_path);
		this.registriesFilePath = path.join(this.registriesPath, "registries.json");		
	}

	checkAccess() {
		try {
			fs.statSync(this.registriesFilePath);
		} catch(e) {
			try {
				fs.writeFileSync(this.registriesFilePath, "[]");
			} catch(e) {
				return false;
			}
		}
		try {
			fs.accessSync(this.registriesFilePath, fs.W_OK);
			return true;
		} catch(e) {
			console.log("Cannot write to",this.registriesFilePath,"perhaps run as sudo?");
			return false;
		}
	}

	get() {
		var registries;
		try {
			registries = JSON.parse(fs.readFileSync(this.registriesFilePath).toString());
		} catch(e) {}
		var bowerrc = JSON.parse(fs.readFileSync(path.join(cli.root, ".bowerrc")).toString());
		if (!registries) registries = [];
		if (bowerrc.registry && bowerrc.registry.search) {
			if (!(bowerrc.registry.search instanceof Array)) bowerrc.registry.search = [bowerrc.registry.search];
			var predefined = [];
			_.each(bowerrc.registry.search, function(item) {
				predefined.push({
					name: "[predefined]",
					predefined: true,
					url: item,
					registerTo: (bowerrc.registry.register === item)
				});
			});
			registries = predefined.concat(registries);
		}
		return registries;
	}

	set(registries) {
		if (!this.checkAccess()) return false;
		fs.writeFileSync(this.registriesFilePath, JSON.stringify(registries, null, "    "));
		return true;
	}

	add(name, url) {
		name = name.toLowerCase();
		var registries = this.get();
		var reg = _.findWhere(registries, {name:name});
		if (reg !== undefined) {
			console.log("Duplicate registry \""+name+"\"");
			return;
		}
		registries.push({
			name: name,
			url: url
		});
		console.log("Registry added \""+name+"\" \""+url+"\"");
		return this.set(registries);
	}

	setRegisterTo(name) {
		name = name.toLowerCase();
		var registries = this.get();
		var reg = _.findWhere(registries, {name:name});
		if (reg === undefined || reg.predefined) {
			console.log("Registry not defined");
			return;
		}
		_.each(registries, function(item) {
			if (item.name == name) item.registerTo = true;
			else item.registerTo = false;
		});
		console.log("Registry \""+name+"\" set as 'register to' location");
		this.set(registries);
	}

	getRegisterTo() {
		var registries = this.get();
		var reg = _.findWhere(registries, {registerTo:true});
		if (reg === undefined) {
			console.log("No 'register to' registry found");
			return false;
		}
		return reg;
	}

	remove(name) {
		name = name.toLowerCase();
		var registries = this.get();
		var reg = _.findWhere(registries, {name:name});
		if (reg === undefined) {
			console.log("Registry not defined");
			return;
		}
		registries = _.reject(registries, function(item) {
			if (item.name === name) return true;
		});
		console.log("Registry removed \""+name+"\"");
		return this.set(registries);
	}
	
}

global.Registries = Registries;

require("./registries/list");
require("./registries/add");
require("./registries/set");
require("./registries/remove");