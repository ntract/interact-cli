commands
.on(['plugins', 'unregister'], function(done) {
	done({stop:true});

	var vars = cli.config.commands.slice(2);
	
	var name = vars[0];

	if (!name) {
		console.log("Invalid use: <name>");
		return;
	}

	cli.plugins.unregister(name);
});

cli.plugins.unregister = function(name, options) {

	options = options || {};

	var bower = require("bower");
	var inquirer = require("inquirer");

	var bowerrc = JSON.parse(fs.readFileSync(path.join(cli.root, ".bowerrc")).toString());
	bowerrc.interactive = true;
	bowerrc.cwd = cli.root;
	bowerrc.timeout = 2000;

	console.log("Unregistering bower plugin", name);
	
	var errored = false;

	bower.commands.login({}, bowerrc)
	.on('prompt', function (prompts, callback) {
	    inquirer.prompt(prompts).then(callback);
	})
	.on('error', function(err) {

		console.log(err.toString());
		errored = true;
		
	})
	.on("end", loggedIn);

	function loggedIn() {

		if (errored) {
			if (typeof options.success === "function") {
				options.success();
			} else {
				console.log("Finished.");
			}
			return;
		}

		bower.commands[command](name, bowerrc)
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


	
};