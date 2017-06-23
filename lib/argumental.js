'use strict';

class Argumental {

	static parse(argv) {
		
	    var args = argv.slice(0);

	    //drop node
	    //drop index.js
	    if (/node/g.test(args[0])) args = argv.slice(2);

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

			var arg = args[i];

			var slashCharIndex = arg.indexOf("-");
			if (slashCharIndex !== 0) {
				i++;
				continue;
			}

			var truncateBy = arg.lastIndexOf("-")+1;

			var optionName = arg.substr(truncateBy);
			var values = args.slice(i+truncateBy);

			var equalsCharIndex = optionName.indexOf("=");
			var hasEquals = (equalsCharIndex !== -1);
			if (hasEquals) {
				//-x=y can be removed from the commands stack altogether
				var value = optionName.substr(equalsCharIndex+1);
				values.unshift(value);
				optionName = optionName.substr(0, equalsCharIndex);
			}

			//keep all standalone items in commands section as there is no way of telling
			//-b testing   - is that a -b= or -b and testing?

			args.splice(i,1);

			values = Argumental.constrainOptionValues(values);

			options[optionName] = values;

		}

		return options;

	}

	static constrainOptionValues(values) {

		//if option values contain other options they should be dropped
		for (var i = 0, l = values.length; i < l; i++) {

			var slashCharIndex = values[i].indexOf("-");
			if (slashCharIndex !== 0) continue;

			values = values.slice(0, i);

			break;

		}

		return values;

	}

}

module.exports = Argumental;
