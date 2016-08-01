cli.plugins.build = function(options) {
	var success = options.success;
	options.success = function() {
		options.success = null;
		if (options.dev) watch(options);
		if (typeof success === "function") success();
	};
	perform(options);
	
}

function watch(options) {
	var treecontext = new TreeContext();
	var tree = treecontext.Tree(path.join(options.cwd, options.src), ".");
	var watchObject = tree.watchGlobs(new GlobCollection([
		"*",
		"**/*"
	]), []);
    watchObject.on("change", function(tree, files, dirs) {
    	for (var i = 0, l = files.length; i < l; i++) {
    		switch (files[i].change) {
    		case "created":
    			console.log("Created", files[i].location.basename);
    			break;
    		case "deleted":
    			console.log("Deleted", files[i].location.basename);
    			break;
    		case "updated":
    			console.log("Updated", files[i].location.basename);
    			break;
    		}
    	}
    	console.log("Client-Side Rebuilding...");
    	watchObject.stop()
    	options.success = function() {
    		watchObject.start();
    	}
        perform(options);
    });
    watchObject.start();
}

function perform (options) {
	options = options || {};

	var tasks = prepareTasks(options);


	tasksReady = 0;
	tasksCount = tasks.length;
	tasksStarted = {};
	tasksDone = {};

	function tasksCompleted() {
		tasksReady++;
		tasksDone[this.name] = true;
		console.log(this.description || this.name, "done.");
		runTasks();
		if (tasksReady !== tasksCount) return;

		_.defer(function() {
			FileSystem.remove(path.join(opts.build, cli.plugins_dirname), [
				"!**/res"
			]);
		});

		_.defer(function() {
			FileSystem.mkdir(path.join(opts.build, cli.plugins_dirname));

			if (typeof opts.success === "function") {
				opts.success();
			}
		});
	}

	var opts = _.extend({}, options);

	opts.src = path.join(options.cwd, options.src);
	opts.build = path.join(options.cwd, options.build);

	console.log("Client-Side Building", (options.dev ? "(dev)" : "(production)") + "...");

	if (opts.remove) {
		FileSystem.remove(opts.build, opts.remove);
	}

	function runTasks() {
		for (var i = 0, l = tasks.length; i < l; i++) {
			var task = tasks[i];
			task.success = _.bind(tasksCompleted, task);
			var taskName = task.task;
			var name = task.name;
			if (tasksStarted[ name ]) continue;
			if (tasksDone[ name ]) continue;
			if (!task.afterTasks || !(task.afterTasks instanceof Array) || task.afterTasks.length === 0) {
				tasksStarted[ name ] = true;
				events.emit("task:"+taskName, task, opts);
				continue;
			}

			var shouldContinue = true;
			for (var d = 0, dl = task.afterTasks.length; d < dl; d++) {
				if (!tasksDone[ task.afterTasks[d] ]) {
					shouldContinue = false;
					break;
				}
			}

			if (shouldContinue) {
				tasksStarted[name] = true;
				events.emit("task:"+taskName, task, opts);
			}
		}
	}

	runTasks();
}

function prepareTasks(options) {
	var tasks = [];
	for (var i = 0, l = options.tasks.length; i < l; i++) {
		var task = _.deepExtend({}, options.tasks[i]);
		if (!task.name) task.name = task.task;
		tasks.push(task);
	}
	return tasks;
}
