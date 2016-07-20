//mimic requirejs api incase client side plugins style is used

var globalRequires = {};
var globalDefines = {};

var define = function(name, reqs, callback) {

	if (name instanceof Array) {
		callback = reqs;
		reqs = name;
		name = null;
	} else if (typeof name === "function") {
		console.log("only function defined");
		callback = name;
		reqs = null;
		name = null;
	};

	if (name) {
		globalDefines[name] = callback;
	}

	if (reqs) {
		for (var i = 0, l = reqs.length; i < l; i++) {
			reqs[i] = globalRequires[reqs[i]] = globalRequires[reqs[i]] || globalDefines[reqs[i]]() || require(reqs[i]);
		}
		callback.apply(global, reqs);
	} else {
		callback.apply(global);
	}

};

define.globalRequires = {};
define.globalDefines = {};

module.exports = define;