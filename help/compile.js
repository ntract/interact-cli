commands
.on(['help', undefined], output)
.on(['help', "plugins", undefined], output)
.on(['help', "plugins", 'compile'], function(done) {
	console.log("");
	console.log("--------------");
	console.log("Help - compile");
	console.log("--------------");
	console.log("");

	output();

	done({stop:true});
});

function output(done) {
	console.log("The 'compile' command compiles a node / server-side application.");
	console.log("");
	console.log("  plugins compile [./]                 compiles the current node application");
	console.log("  help plugins compile                 show this help data");
	console.log("");

	if (done) done();
}
