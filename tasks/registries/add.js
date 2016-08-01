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

	cli.registries.add(name);
});

cli.registries.add = function(name) {

	console.log("Sorry, add behaviour has not yet been written.");

}