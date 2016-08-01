var configCallbacks = {count:0, ready:0};
var startedCallbacks = [];
var configuredCallbacks = [];
var isConfigured = false;
var hasInitialized = false;


var priv = {

	configTaskDoneCallback: function() {
	    configCallbacks.ready = configCallbacks.ready !== undefined ? ++configCallbacks.ready : 1;
	    checkFinishedConfig();
	},

	checkFinishedConfig: function() {
		if (!hasInitialized) return;
		if (configCallbacks.ready !== configCallbacks.count) return;
	    for (var i = 0, l = configuredCallbacks.length; i < l; i++) {
	        try {
	            configuredCallbacks[i]();
	        } catch(e) {}
	    }
	    isConfigured = true;
	},

	hasFinishedConfig: function() {
	    setTimeout(function() {
	        for (var i = 0, l = startedCallbacks.length; i < l; i++) {
	            try {
	                startedCallbacks[i]();
	            } catch(e) {}
	        }
	    }, 250);
	}

};

global.plugins = {

    flags: {},

    initialize: function() {

        plugins.configured(priv.hasFinishedConfig);
        setTimeout(priv.checkFinishedConfig, 0);
        hasInitialized = true;
        return global.plugins;
    },
    
    config: function(callback) {
    	if (isConfigured) {
    		return;
    	}
        configCallbacks.count++;

        setTimeout(function() {
            callback(priv.configTaskDoneCallback);
        }, 0);
        return global.plugins;
    },

    configured: function(callback) {
        configuredCallbacks.push(callback);
        return global.plugins;
    },

    started: function(callback) {
    	startedCallbacks.push(callback);
    	return global.plugins;
    },

    waitFor: function(test, callback) {
    	var repeaterLoop = function() {
        	setTimeout(function() {
				if (!test()) return repeaterLoop();
				callback();
			}, 10);
		};
		repeaterLoop();
		return global.plugins;
    }

}; 

module.exports = global.plugins;