const handlers = require('./Handlers.js');
const prefix = process.env.COMMAND_PREFIX;

let readme="# MUSE - Multi-User Story Engine.\n\n"+
	"This is a telnet server meant for users to connect to using MUSH clients such as Potato Mush Client, MUSHClient, and Tintin++. Its purpose is to facilitate creating stories between a community of people who share interest in a genre and setting. These are some of the commands it provides to fulfill that purpose.";

for(handler in handlers){
	readme+="\n\n## "+prefix+handler+"\n";
	for(command in handlers[handler].help){
		readme+="\n- **"+prefix+handler+"/"+command+"** ";
		readme+=handlers[handler].help[command];
	}
}

console.log(readme);
