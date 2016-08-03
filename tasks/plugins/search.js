commands
.on(['plugins', 'search'], function(done) {
	done({stop:true});

	var vars = cli.config.commands.slice(2);
	
	var name = vars[0];

	if (!name) {
		console.log("Invalid use: <searchterm>");
		return;
	}

	cli.plugins.search(name);
});

cli.plugins.search = function(name, options) {
	options = options || {};

	var bower = require("bower");
	var inquirer = require("inquirer");

	var bowerrc = JSON.parse(fs.readFileSync(path.join(cli.root, ".bowerrc")).toString());
	bowerrc.interactive = options.force !== undefined ? !options.force : true;
	bowerrc.cwd = cli.cwd;
	bowerrc.force = true;
	bowerrc.registry = { search:[], register: "" };

	var registries = new Registries();
	var regs = registries.get();
	_.each(regs, function(item) {
		bowerrc.registry.search.push(item.url);
		if (item.registerTo) bowerrc.registry.register = item.url;
	});

	bowerrc.timeout = 2000;

	console.log("Searching for plugins...")

	bower.commands['search'](name, bowerrc)
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
				//console.log("Resolving", log.data.endpoint.source+"#"+log.data.endpoint.target);
				break;
			}
		}
	})
	.on('prompt', function (prompts, callback) {
	    inquirer.prompt(prompts).then(callback);
	})
	.on("end", function(found) {
		if (found.length === 0) {
			console.log("No plugins found");
			if (options.success) {
				options.success();
			} else {
				console.log("Finished.");
			}
		}
		found.sort(function(a,b) {
			return (a.name > b.name ? 1 : (a.name < b.name ? -1 : 0));
		})
		_.each(found, function(item, index) {
			console.log((index+1)+": "+item.name);
		});
		if (options.success) {
			options.success();
		} else {
			console.log("Finished.");
		}
	});

}