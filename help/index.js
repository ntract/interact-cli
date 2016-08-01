commands
.on(['help', undefined], function(done) {
	console.log("");
	console.log("--------------");
	console.log("ALL HELP PAGES");
	console.log("--------------");
	console.log("");

	done();
})
.unhandled(function() {

	if (cli.config.commands.length === 0) {
		console.log("No command specified.");
		return;
	}

	console.log("Command '"+cli.config.commands[0]+"' not recognized");

});
