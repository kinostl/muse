const PubSub = require('pubsub-js');
const EventEmitter = require("events").EventEmitter;
const sys = require("util");

const SocketLineBuffer = require('./SocketLineBuffer');
/*******************************************************************************
 * Chatter
 *
 * Represents a single user/connection in the chat server.
 ******************************************************************************/

function Chatter(socket, server) {
	EventEmitter.call(this);

	this.socket     = socket;
	this.server     = server;
	this.nickname   = "";
	this.lineBuffer = new SocketLineBuffer(socket);
	this.id         = server.ids;
	this.channels   = {};

	this.lineBuffer.on("line", this.handleNickname.bind(this));
	this.socket.on("close", this.handleDisconnect.bind(this));
};

sys.inherits(Chatter, EventEmitter);

Chatter.prototype.send = function(message, data) {
	message = message.split(".");
	if(message[0] === "chat"){
		let header = message[1];
		this.socket.write("<"+header+"> "+data + "\r\n");
	}
	if(message[0] === "system"){
		let header = message[0];
		this.socket.write("["+header+"] "+data + "\r\n");
	}
};

Chatter.prototype.subscribedTo = function(channel){
	return this.channels.hasOwnProperty(channel);
}

Chatter.prototype.subscribe = function(channel) {
	this.channels[channel] = PubSub.subscribe(channel,this.send.bind(this));
	if(channel.startsWith("chat")){
		PubSub.publish(channel, this.nickname + " has joined the chat.");
	}
	this.emit("subscribe", this, channel);
}

Chatter.prototype.unsubscribe = function(channel) {
	if(channel.startsWith("chat")){
		PubSub.publish(channel, this.nickname + " has left the chat.");
	}
	PubSub.unsubscribe(this.channels[channel]);
	delete this.channels[channel];
	this.emit("unsubscribe", this, channel);
}

Chatter.prototype.handleNickname = function(nickname) {
	if(this.server.isNicknameLegal(nickname)) {
		this.nickname = nickname;
		this.lineBuffer.removeAllListeners("line");
		this.lineBuffer.on("line", this.handleChat.bind(this));
		this.emit("join", this);
	} else {
		PubSub.publish("system."+this.id, "Sorry, but that nickname is not legal or is already in use!");
		PubSub.publish("system."+this.id, "What is your nickname?");
	}
};

Chatter.prototype.handleChat = function(line) {
	this.emit("chat", this, line);
};

Chatter.prototype.handleDisconnect = function() {
	this.emit("leave", this);
};

module.exports = Chatter;
