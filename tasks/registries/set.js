commands
.on(['registries', 'set'], function(done) {

	done({stop:true});

	var vars = cli.config.commands.slice(2);
	
	var name = vars[0];

	if (!name) {
		console.log("Invalid use: <name>");
		return;
	}

	cli.registries.set(name);

});

cli.registries.set = function(name, options) {

	options = options || {};
	
	console.log("Setting 'register to' registry...");

	var registries = new Registries();

	registries.setRegisterTo(name);

	if (options.success) {
		options.success();
	} else {
		console.log("Finished.");
	}

};