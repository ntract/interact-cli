commands
.on(['help', undefined], output)
.on(['help', '^(update|upgrade)'], function(done) {

	console.log("");
	console.log("-------------");
	console.log("Help - update");
	console.log("-------------");
	console.log("");

	output();

	done({ stop: true })

});

function output(done) {

	console.log("The 'update' command updates the global cli.");
	console.log("");
	console.log("  update                               update the cli plugins");
	console.log("  help update                          show this help data");
	console.log("");

	if (done) done();
	
}