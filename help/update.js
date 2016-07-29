function output() {
	console.log("The 'update' command updates the global cli.");
	console.log("");
	console.log("  update                               update the cli plugins");
	console.log("  help update                          show this help data");
	console.log("");
}

events.once("modules:loaded", function() {

	if (cli.config.commands[0] !== "help") return;
	
	if (cli.config.commands[1] === undefined) {
		output();
		return;
	} 

	if (cli.config.commands[1] !== "update" && cli.config.commands[1] !== "upgrade") return;

	console.log("");
	console.log("-------------");
	console.log("Help - update");
	console.log("-------------");
	console.log("");

	output();

	events.emit("command:handled");
});
