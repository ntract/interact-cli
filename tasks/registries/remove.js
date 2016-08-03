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

cli.registries.remove = function(name) {

	console.log("Removing...");

	try {
		fs.accessSync(path.join(cli.root,".bowerrc"), fs.W_OK);
	} catch(e) {
		console.log("Cannot write to",path.join(cli.root,".bowerrc"),"perhaps run as sudo?");
		return;
	}

	console.log("Sorry, remove behaviour has not yet been written.");

}