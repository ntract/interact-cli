commands
.on(['registries', 'add'], function(done) {

	done({stop:true});

	var vars = cli.config.commands.slice(2);
	
	var name = vars[0];
	var uri = vars[1];

	if (!name || !uri) {
		console.log("Invalid use: <name> <uri>");
		return;
	}

	cli.registries.add(name, uri);

});

cli.registries.add = function(name, uri, options) {

	options = options || {};

	console.log("Adding registry...");

	var registries = new Registries();

	registries.add(name, uri);

	if (options.success) {
		options.success();
	} else {
		console.log("Finished.");
	}

};