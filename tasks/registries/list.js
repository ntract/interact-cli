commands
.on(['registries', 'list'], function(done) {
	done({stop:true});

	cli.registries.list();
});

cli.registries.list = function(options) {
	options = options || {};

	var registries = new Registries();

	var list = registries.get();
	console.log("Listing registries...")

	if (list.length === 0) {
		console.log("No registries defined");
	} else {
		for (var i = 0, l = list.length; i < l; i++) {
			console.log((i+1) + ": " + list[i].name + "\t\t" + list[i].url);
		}
		var registerTo = registries.getRegisterTo();
		if (registerTo)	console.log("Register to \""+registerTo.url+"\"");
	}

	if (options.success) {
		options.success();
	} else {
		console.log("Finished.");
	}


}