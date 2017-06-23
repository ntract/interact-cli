commands
.on(["help", undefined], output)
.on(["help", "plugins", undefined], function(done) {

	console.log("");
	console.log("--------------");
	console.log("Help - plugins");
	console.log("--------------");
	console.log("");

	output();

	done();

});

function output(done) {

	console.log("The 'plugins' commands help manage plugin development and installation.");
	console.log("");
	console.log("  plugins list                         list installed plugins");
	console.log("  plugins search                       search plugin registries");
	console.log("  plugins install <name> [names...]    install listed plugins");
	console.log("  plugins uninstall <name> [names...]  uninstall listed plugins");
	console.log("  plugins update [names...]            updates plugins");
	console.log("  plugins register <name> <https://uri.git>");
	console.log("                                       register plugin");
	console.log("  plugins unregister <name>            unregister plugin name");
	console.log("  help plugins                         show this help data");
	console.log("");

	if (done) done();
	
}