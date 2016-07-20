function output() {
	console.log("The 'run' command executes the current node / server-side source.");
	console.log("");
	console.log("  run                                  run the source in cli.cwd");
	console.log("");

	events.emit("command:handled");
}

events.once("help", output);
