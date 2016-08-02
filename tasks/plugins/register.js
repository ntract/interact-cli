commands
.on(['plugins', '^register'], function(done) {
	done({stop:true});

	var vars = cli.config.commands.slice(2);
	
	var name = vars[0];
	var uri = vars[1];

	if (!name || !uri) {
		console.log("Invalid use: <name> <url>");
		return;
	}

	cli.plugins.register(name, uri);
});

cli.plugins.register = function(name, uri, options) {

	options = options || {};

	var bower = require("bower");
	var inquirer = require("inquirer");

	var bowerrc = JSON.parse(fs.readFileSync(path.join(cli.root, ".bowerrc")).toString());
	bowerrc.interactive = true;
	bowerrc.cwd = cli.root;
	bowerrc.timeout = 2000;

	console.log("Registering bower plugin", name, uri);
	

	bower.commands['register'](name, uri, bowerrc)
	.on('error', function(err) {
		console.log(err.toString());
		console.log("Finished.");
	})
	.on('log', function (log) {
		switch (log.level) {
		case "info":
			break;
		case "action":
			switch(log.id) {
			case "install":
				console.log(log.message);
				break;
			case "resolve":
				console.log("Resolving", log.data.endpoint.source+"#"+log.data.endpoint.target);
				break;
			}
		}
	})
	.on('prompt', function (prompts, callback) {
	    inquirer.prompt(prompts).then(callback);
	})
	.on("end", function(installed) {

			if (typeof options.success === "function") {
				options.success();
			} else {
				console.log("Finished.");
			}

	});


	
}
