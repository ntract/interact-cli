commands
.on(['plugins', 'search'], function(done) {
	done({stop:true});

	var vars = cli.config.commands.slice(2);
	
	var name = vars[0];

	if (!name) {
		console.log("Invalid use: <name>");
		return;
	}

	cli.plugins.search(name);
});

cli.plugins.search = function(name) {

	console.log("Sorry, search behaviour has not yet been written.");

}