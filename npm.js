'use strict';

var os = require("os");
var platform = os.platform();
var sys = "";
if (platform.match(/^win/g) !== null) {
	sys = "win";
} else if (platform.match(/^darwin/g) !== null) {
	sys = "mac"
} else if (platform.match(/^linux/g) !== null) {
	sys = "linux"
} else {
	throw "Platform not currently supported: " + platform;
}

var npm = module.exports = {
	npm_api: null,
	os: sys,

	install: function(cwd, packageJSON, dependencies, callback, noAPI) {
		if (packageJSON && packageJSON.dependencies) {
			var found = true;
			var installed = packageJSON.dependencies;
			for (var k in dependencies) {
				if (!installed[k]) {
					found = false;
					break;
				}
				try {
					var stat = fs.statSync(path.join(cwd, "node_modules", k));
				} catch(e) {
					found = false;
					break;
				}
			}
			if (found) {
				setTimeout(function() {
					callback(null, "", "");
				});
				return packageJSON;
			}
		} else if (packageJSON) {
			packageJSON.dependencies = {};
		} else {
			packageJSON = { dependencies:{}};
		}

		var install = [];
		for (var k in dependencies) {
			var dep = k+"@"+dependencies[k];
			console.log("Installing",dep+"...");
			install.push(dep);
			packageJSON.dependencies[k] = (!packageJSON.dependencies[k] || packageJSON.dependencies[k] === "*") ? dependencies[k] : packageJSON.dependencies[k];
		}

		//replace startup npm with npm api
		if (!npm.npm_api) {
			try {
				npm.npm_api = require("npm");
				npm.npmconf = require('../lib/config/core.js')
			} catch (e) {}
		}

		if (!npm.npm_api || noAPI) {
			var ret = function (error, stdout, stderr) {
				if (typeof callback !== "function") return;
				fs.writeFileSync(path.join(cwd, "package.json"), JSON.stringify(packageJSON, null, "    "));
				callback(error, stdout, stderr);
			};
			var exec = require('child_process').exec;
			switch (npm.os) {
			case "win":
				var child = exec('npm.cmd --production install '+install.join(" "), {cwd:cwd}, ret);
				break;
			default:
				var child = exec('npm --production install '+install.join(" "), {cwd: cwd}, ret);
			}
		} else {
			npm.npm_api.load({
				save:true,
				'legacy-bundling': true,
				prefix: cwd,
				global: false,
				'production': true,
				'bin-links': false,
				progress: false,
				loglevel: "silent",
				logstream: null
			}, function(err) {
			  // handle errors

			  // install module ffi
			  npm.npm_api.commands.install(install, function(er, data) {
			  	
			    // log errors or data
			    FileSystem.rm(path.join(cwd, "etc")); //fix for erroneous etc folder creation
			    //https://github.com/eirslett/frontend-maven-plugin/issues/254

			    //force save of dependencies
			    fs.writeFileSync(path.join(cwd, "package.json"), JSON.stringify(packageJSON, null, "    "));


			    callback(er, data, null);
			  });

			  npm.npm_api.on('log', function(message) {
			    // log installation progress
			    //console.log(message);
			  });
			});

		}

		return packageJSON;
	}

};