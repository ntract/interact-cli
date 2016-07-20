'use strict';

class Argumental {

	static parse(argv) {
		
	    var args = argv.slice(0);

	    if (/node/g.test(args[0])) {
	    	//drop node
	    	//drop index.js
	    	args = argv.slice(2);
	    }

	    return {
	    	options: Argumental.parseOptions(args),
	    	commands: args,
	    	switches: {}
	    };

	}

	static parseOptions(args) {
		var options = {};;
		var i = 0;
		while (args.length > 0 && i < args.length) {
			var slashIndex = args[i].indexOf("-");

			if (slashIndex !== 0) {
				i++;
				continue;
			}

			var key = args[i].substr(1);
			var values = args.slice(i+1);

			var equalsIndex = key.indexOf("=");
			if (equalsIndex > -1) {
				//-x=y can be removed from the commands stack altogether
				var value = key.substr(equalsIndex+1);
				values.unshift(value);
				key = key.substr(0, equalsIndex);
			}

			//keep all standalone items in commands section as there is no way of telling
			//-b testing   - is that a -b= or -b and testing?

			args.splice(i,1);

			values = Argumental.constrainOptionValues(values);

			options[key] = values;

		}

		return options;

	}

	static constrainOptionValues(values) {
		//if option values contain other options they should be dropped
		for (var i = 0, l = values.length; i < l; i++) {
			var slashIndex = values[i].indexOf("-");
			if (slashIndex !== 0) continue;

			values = values.slice(0, i);

			break;
		}

		return values;

	}

}

module.exports = Argumental;
