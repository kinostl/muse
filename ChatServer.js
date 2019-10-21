const debug = require('debug');
const PubSub = require('pubsub-js');
const net = require("net");
const Chatter=require('./Chatter');
const CommandHandler = require('./CommandHandler');

/*******************************************************************************
 * ChatServer
 *
 * Manages connections, users, and chat messages.
 ******************************************************************************/

function ChatServer(config) {
	this.server   = net.createServer(this.handleConnection.bind(this));
	this.server.listen(config.port, config.host);
	this.debug_sockets={};
	this.ids=0;
	this.command_prefix=config.command_prefix;
}

ChatServer.prototype.handleConnection = function(connection) {
	debug("muse:core")("Incoming connection from " + connection.remoteAddress);
	connection.setEncoding("utf8");

	var chatter = new Chatter(connection, this);
	this.ids++;
	chatter.subscribe("system."+chatter.id);
	PubSub.publish("system."+chatter.id, "Welcome! What is your nickname?");
	chatter.on("line", this.handleLine.bind(this));
	chatter.on("join", this.handleJoin.bind(this));
	chatter.on("leave", this.handleLeave.bind(this));
};

ChatServer.prototype.handleLine = function(chatter, line) {
	if (
		process.env.NODE_ENV === "testing" ||
		process.env.NODE_ENV === "debug" ||
		process.env.CREEPER === true
		//Or user is flagged for logging
	) {
		debug("muse:core.input." + chatter.id + " (" + chatter.nickname + ")")(line);
	}
	if(line.startsWith(this.command_prefix)){
		CommandHandler(chatter, line)
	}else{
		PubSub.publish("system." + chatter.id, "`"+line+"` isn't an option. See available commands with `@help`");
	}
};

ChatServer.prototype.handleJoin = function(chatter) {
	//TODO replace with Joined Channels
	chatter.subscribe("chat.general");
};

ChatServer.prototype.handleLeave = function(chatter) {
	//TODO replace with Joined Channels
	chatter.unsubscribe("chat.general");
};

module.exports = ChatServer
