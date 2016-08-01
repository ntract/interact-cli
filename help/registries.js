commands
.on(["help", undefined], output)
.on(["help", "registries", undefined], function(done) {
	console.log("");
	console.log("-----------------");
	console.log("Help - registries");
	console.log("-----------------");
	console.log("");

	output();

	done();
});


function output(done) {
	console.log("The 'registries' commands help manage plugin sources.");
	console.log("");
	console.log("  registries list                      list configured registries");
	console.log("  registries add <name> <url>          add a plugin search source registry");
	console.log("  registries set <name>                register and unregister here");
	console.log("  registries remove <name>             remove a plugin source registry");
	console.log("  help registries                      show this help data");
	console.log("");

	if (done) done();
}