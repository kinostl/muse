const debug=require('debug');

const PORT = 1212;
const HOST = "localhost";
const COMMAND_PREFIX="@";
const CHANNEL_PREFIX="+";

const ChatServer = require('./ChatServer');

// Start the server!
server = new ChatServer({
	"command_prefix":COMMAND_PREFIX,
	"channel_prefix":CHANNEL_PREFIX,
	"port":PORT,
	"host":HOST
});

debug("core")("Started on "+HOST+" "+PORT);
