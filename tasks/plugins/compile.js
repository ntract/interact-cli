commands
.on(['plugins', 'compile'], function(done) {

	done({stop:true});

	var compilePath = path.join(cli.cwd, cli.config.commands[2] || ".");

	cli.plugins.compile(compilePath);

});

cli.plugins = cli.plugins || {};
cli.plugins.compile = function(compilePath, options) {
	options = options || {};

	console.log("Compiling application...");
	
	//perform root collate to compilePath
	var pluginsPath = path.join(compilePath, cli.plugins_dirname);

	FileSystem.collate( pluginsPath, compilePath, "root", [
		"**/root/*",
		"**/root/**"
	], [
		"!**",
		"!*"
	], () => {

		//npm install?
		if (options.success) {
			options.success();
		} else if (!options.silent) {
			console.log("Compiled.");
		}

	}, {
		force: false
	})

};

