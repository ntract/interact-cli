events.once("modules:loaded", function() {
	if (cli.config.commands[0] !== "help") return;
	if (cli.config.commands[1] !== undefined) return;

	console.log("");
	console.log("--------------");
	console.log("ALL HELP PAGES");
	console.log("--------------");
	console.log("");

	events.emit("command:handled");
});


events.once("command:unhandled", function() {

	console.log("Command '"+cli.config.commands[0]+"' not recognized");

});