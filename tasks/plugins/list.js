commands
.on(['plugins', 'list'], function(done) {
	done({stop:true});

	var sourcePath = path.join(cli.cwd);

	cli.plugins.list(sourcePath);
});

cli.plugins.list = function(sourcePath, options) {
	options = options || {};
	options.force = true;

	options = options || {};

	var installPath = path.join(sourcePath, cli.plugins_dirname);

	var pluginsTool = new Plugins(sourcePath);

	var installedData = pluginsTool.getInstalledPluginData();

	console.log(installedData);
	
	if (typeof options.success === "function") {
		options.success();
	} else {
		console.log("Finished.");
	}

}