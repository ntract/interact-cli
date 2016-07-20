function run() {

	if (cli.config.commands[0] !== "update") return;

	var isHelp = (_.indexOf(cli.config.commands, "help") > -1);
	if (isHelp) return;

	events.emit("command:handled");

	cli.plugins.update(cli.root, null, {force:true});

}

events.once("modules:loaded", run);