'use strict';

global.switches = function(switches) {
       
    for (var k in cli.config.options) {
        if (_.contains(switches,k)) return true;
    }
    
    return false;

}; 

module.exports = global.switches;