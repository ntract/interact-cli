commands
.on(['^(update|upgrade)'], function(done) {

	done({stop:true});

	cli.plugins.update(cli.root, null, {force:true});

});