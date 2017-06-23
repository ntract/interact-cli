'use strict';

var callbacks = [];
var unhandledCallbacks = [];
var wasHandled = false;

var priv = {

    runCallbacks() {

        var next = _.find(callbacks, function(callbackItem) {
            if (callbackItem.done) return false;

            //go through input commands
            for (var i = 0, l = cli.config.commands.length; i < l; i++) {
                var test = callbackItem.commands[i];
                var input = cli.config.commands[i];

                var isTestUndefined = (test === undefined);
                var isOverEnd = (callbackItem.commands.length-1 < i);

                var isTestSpecifiedUndefined = isTestUndefined && !isOverEnd;

                //cli.config.commands must be undefined, it isn't
                if (isTestSpecifiedUndefined) return false;
                
                //cli.config.commands can be undefined
                if (isTestUndefined) return true;

                var isPass = (new RegExp(test)).test(input);
                //console.log(isPass ? "passed" : "failed",  test, input);
                //does not match commands test
                if (!isPass) return false;
                
            }

            //got through test commands
            for (var i = 0, l = callbackItem.commands.length; i < l; i++) {
                var test = callbackItem.commands[i];
                var input = cli.config.commands[i];

                var isTestUndefined = (test === undefined);
                var isAtTestEnd = (callbackItem.commands.length-1 <= i);
                var isTestSpecifiedUndefined = isTestUndefined && isAtTestEnd;

                var isInputUndefined = (input === undefined);

                if (isTestUndefined && isInputUndefined) {
                    //test is defined but input isn't
                    //console.log(">d");
                    return true;
                }
                if (isInputUndefined) {
                    //input is undefined, test isn't
                    //console.log(">e");
                    return false;
                }

                var isPass = (new RegExp(test)).test(input);
                //console.log(isPass ? "passed" : "failed",  test, input);
                if (!isPass) {
                    //does not match commands test
                    return false;
                }
            }

            return true;

        });

        if (!next) {
            if (!wasHandled) priv.runUnhandledCallbacks();
            return;
        }
        
        next.done = true;
        wasHandled = true;
        next.callback( priv.commandDone );

    },

    commandDone(options) {

        options = options || {};

        if (options.stop) return;
        setTimeout(priv.runCallbacks, 0);

    },

    runUnhandledCallbacks: function() {

        for (var i = 0, l = unhandledCallbacks.length; i < l; i++) {
            unhandledCallbacks[i]();
        }

    }

};

global.commands = {

    initialize: function() {

        _.defer(priv.runCallbacks);
        return global.commands;

    },

    on: function(commands, callback) {

        callbacks.push({
            commands,
            callback
        });
        return global.commands;

    },

    unhandled: function(callback) {

        unhandledCallbacks.push(callback);
        return global.commands;

    }   

}; 


plugins.started(function() {

    commands.initialize();

});

module.exports = global.commands;