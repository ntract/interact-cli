commands
.on(['registries', 'list'], function(done) {
	done({stop:true});

	cli.registries.list();
});

cli.registries.list = function() {

	console.log("Sorry, list behaviour has not yet been written.");

}