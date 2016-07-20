require("./run");
require("./update");

events.once("modules:loaded", function() {
	if (cli.config.commands[0] !== "help") return;

	console.log("");
	console.log("--------------");
	console.log("ALL HELP PAGES");
	console.log("--------------");
	console.log("");

	events.emit("help");

	events.emit("command:handled");
});
