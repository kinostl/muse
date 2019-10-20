const debug = require('debug');
const PubSub = require('pubsub-js');
const net = require("net");
const Chatter=require('./Chatter');
const CommandHandler = require('./CommandHandler');
const ChannelHandler = require('./ChannelHandler');

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

ChatServer.prototype.isNicknameLegal = function(nickname) {
	// A nickname may contain letters or numbers only,
	if(nickname.replace(/[A-Za-z0-9]*/, '') != "") {
		return false
	}
	return true;
};

ChatServer.prototype.handleConnection = function(connection) {
	debug("core")("Incoming connection from " + connection.remoteAddress);
	connection.setEncoding("utf8");

	var chatter = new Chatter(connection, this);
	this.ids++;
	chatter.subscribe("system."+chatter.id);
	PubSub.publish("system."+chatter.id, "Welcome! What is your nickname?");
	chatter.on("chat", this.handleChat.bind(this));
	chatter.on("join", this.handleJoin.bind(this));
	chatter.on("leave", this.handleLeave.bind(this));
	chatter.on("subscribe", this.handleSubscribe.bind(this));
	chatter.on("unsubscribe", this.handleUnsubscribe.bind(this));
};

ChatServer.prototype.handleSubscribe = function(chatter, channel){
	if(!this.debug_sockets[channel]){
		this.debug_sockets[channel] = PubSub.subscribe(channel,function(message, data){
			debug(message)(data);
		});
	}
}

ChatServer.prototype.handleUnsubscribe = function(chatter, channel){
	if(channel.split().length > 2){
		PubSub.unsubscribe(this.debug_sockets[channel]);
		delete this.debug_sockets[channel]
	}
}

ChatServer.prototype.handleChat = function(chatter, message) {
	if(message.startsWith(this.command_prefix)){
		CommandHandler(chatter, message)
	}else{
		PubSub.publish("system." + chatter.id, "`"+message+"` isn't an option.");
	}
};

ChatServer.prototype.handleJoin = function(chatter) {
	chatter.subscribe("chat.general");
};

ChatServer.prototype.handleLeave = function(chatter) {
	chatter.unsubscribe("chat.general");
};

module.exports = ChatServer
