const PORT = 1212;
const HOST = "localhost";
const COMMAND_PREFIX="@";

const debug=require('debug');
const db = require('./db');
const ChatServer = require('./ChatServer');

db.knex.migrate.latest().then(()=>{
	// Start the server!
	server = new ChatServer({
		"command_prefix": COMMAND_PREFIX,
		"port": PORT,
		"host": HOST
	});

	debug("muse:core")("Started on " + HOST + " " + PORT);
}).catch((e)=>{
	debug("muse:core.error")(e);
})
