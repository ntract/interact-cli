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

	try {
		fs.accessSync(path.join(compilePath,"package.json"), fs.W_OK);
	} catch(e) {
		console.log("Cannot write to",path.join(compilePath,"package.json"),"perhaps run as sudo?");
		return;
	}
	
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
		force: true
	})

};

