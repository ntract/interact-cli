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

	console.log("Listing installed plugins...");

	var installedData = pluginsTool.getInstalledPluginData();
	installedData = _.values(installedData);
	installedData.sort(function(a,b) {
		return (a.name > b.name ? 1 : (a.name < b.name ? -1 : 0));
	});
	_.each(installedData, function(item, index) {
		console.log((index+1)+": "+item.name);
	});
	
	if (typeof options.success === "function") {
		options.success();
	} else {
		console.log("Finished.");
	}

}