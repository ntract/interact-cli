commands
.on(['registries', 'remove'], function(done) {

	done({stop:true});

	var vars = cli.config.commands.slice(2);
	
	var name = vars[0];

	if (!name) {
		console.log("Invalid use: <name>");
		return;
	}

	cli.registries.remove(name);

});

cli.registries.remove = function(name, options) {

	options = options || {};

	console.log("Removing registry...");

	var registries = new Registries();

	registries.remove(name);

	if (options.success) {
		options.success();
	} else {
		console.log("Finished.");
	}

};