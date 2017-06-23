commands
.on(['plugins', '^(install|update|upgrade)'], function(done) {

	done({stop:true});

	var plugins = cli.config.commands.slice(2);
	var command = cli.config.commands[1] === "install" ? "install" : "update";

	var sourcePath = path.join(cli.cwd);

	if (command === "install") {
		cli.plugins.install(sourcePath, plugins);
	} else {
		cli.plugins.update(sourcePath, plugins);
	}

});


cli.plugins.install = function(sourcePath, plugins, options) {

	options = options || {};
	options.interactive = false;
	if (plugins.length === 0) {
		console.log("No plugins specified.")
		return;
	}
	perform(sourcePath, "install", plugins, options);

};

cli.plugins.update = function(sourcePath, plugins, options) {

	options = options || {};
	options.interactive = false;

	perform(sourcePath, "update", plugins, options);

};

function perform(sourcePath, command, plugins, options) {

	options = options || {};

	var exists = false;
	try {
		fs.statSync(path.join(sourcePath,"package.json"));
		exists = true;
	} catch(e) {}

	if (exists) {
		try {
			fs.accessSync(path.join(sourcePath,"package.json"), fs.W_OK);
		} catch(e) {
			console.log("Cannot write to",path.join(sourcePath,"package.json"),"perhaps run as sudo?");
			return;
		}
	}

	var bower = require("bower");
	var inquirer = require("inquirer");

	var bowerrc = JSON.parse(fs.readFileSync(path.join(cli.root, ".bowerrc")).toString());
	bowerrc.force = options.force !== undefined ? options.force : false;
	bowerrc.interactive = options.interactive !== undefined ? options.interactive : true;
	bowerrc.cwd = sourcePath;
	bowerrc.registry = { search:[], register: "" };

	var registries = new Registries();
	var regs = registries.get();
	_.each(regs, function(item) {
		bowerrc.registry.search.push(item.url);
		if (item.registerTo) bowerrc.registry.register = item.url;
	});

	var name = "unknown";
	var packageJSON;
	try {
		packageJSON = JSON.parse(fs.readFileSync(path.join(sourcePath, "package.json")).toString());
		name = packageJSON.name;
	} catch (e) {
		packageJSON = {name:name};
	}

	var bowerJSON;
	try {
		bowerJSON = JSON.parse(fs.readFileSync(path.join(sourcePath, "bower.json")).toString());
	} catch (e) {
		bowerJSON = { dependencies: {} };
	}
	bowerJSON.dependencies = bowerJSON.dependencies || {};
	bowerrc.timeout = 2000;

	switch (command) {
	case "update":
		console.log("Updating bower plugins...");
		break;
	case "install":
		console.log("Installing bower plugins...");
		break;
	}
	

	bower.commands[command](plugins, { }, bowerrc)
	.on('error', function(err) {
		console.log(err.toString());
		console.log("Finished.");
	})
	.on('log', function (log) {
		switch (log.level) {
		case "warn":
			console.log(log.message);
			break;
		case "info":
			break;
		case "action":
			switch(log.id) {
			case "install":
				console.log(log.message);
				break;
			case "resolve":
				//console.log("Resolving", log.data.endpoint.source+"#"+log.data.endpoint.target);
				break;
			}
		}
	})
	.on('prompt', function (prompts, callback) {
	    inquirer.prompt(prompts).then(callback);
	})
	.on("end", function(installed) {
		//TODO run only when compile:true existing in plugins bowerjsons
		cli.plugins.compile(sourcePath, { success: function() {

			var name = "unknown";
			
			try {
				packageJSON = JSON.parse(fs.readFileSync(path.join(sourcePath, "package.json")).toString());
				name = packageJSON.name;
				fs.writeFileSync( path.join(sourcePath, "package.json"), JSON.stringify( packageJSON, null, "    " ) );
			} catch (e) {}

			bowerJSON.name = name;

			for (var k in installed) {
				bowerJSON.dependencies[k] = installed[k].endpoint.target;
			}

			fs.writeFileSync(path.join(sourcePath, "bower.json"), JSON.stringify(bowerJSON, null, "    "));

			if (typeof options.success === "function") {
				options.success();
			} else {
				console.log("Finished.");
			}

		}});
	});
	
}