function output() {
	console.log("The 'update' command updates this cli.");
	console.log("");
	console.log("  update                                  update the cli plugins");
	console.log("  update help                             show this help data");
	console.log("");

	events.emit("command:handled");
}

events.once("modules:loaded", function() {

	if (cli.config.commands[0] !== "update") return;

	var isHelp = (_.indexOf(cli.config.commands, "help") > -1);
	if (!isHelp) return;

	console.log("");
	console.log("-------------");
	console.log("Help - update");
	console.log("-------------");
	console.log("");

	output();
});

events.once("help", output);
