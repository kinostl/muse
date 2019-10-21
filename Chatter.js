const PubSub = require('pubsub-js');
const EventEmitter = require("events").EventEmitter;
const sys = require("util");
const debug = require('debug');

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
	this.nickname   = "whatever";
	this.lineBuffer = new SocketLineBuffer(socket);
	this.id         = server.ids;
	this.channels   = {};

	this.lineBuffer.on("line", this.handleLine.bind(this));
	this.socket.on("close", this.handleDisconnect.bind(this));
};

sys.inherits(Chatter, EventEmitter);

Chatter.prototype.send = function(message, data) {
	message = message.split(".");
	let output=null;
	if(message[0] === "chat"){
		let header = message[1];
		output = "<"+header+"> "+data + "\r\n";
	}
	else if(message[0] === "system"){
		let header = message[0];
		output = "[" + header + "] " + data + "\r\n";
	}else{
		debug("muse:core.error")("Attempted to send non-chat, non-system info to Chatter.\r\n"+"Message: "+message+"\r\nData: "+data);
	}
	if(output){
		this.socket.write(output);
		if (
			process.env.NODE_ENV === "testing" ||
			process.env.NODE_ENV === "debug" ||
			process.env.CREEPER === true
			//Or user is flagged for logging
		) {
			debug("muse:core.output." + this.id + " (" + this.nickname + ")")(output);
		}
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
	this.emit("subscribe", channel);
}

Chatter.prototype.unsubscribe = function(channel) {
	if(channel.startsWith("chat")){
		PubSub.publish(channel, this.nickname + " has left the chat.");
	}
	PubSub.unsubscribe(this.channels[channel]);
	delete this.channels[channel];
	this.emit("unsubscribe", channel);
}

Chatter.prototype.handleLine = function(line) {
	this.emit("line", this, line);
};

Chatter.prototype.handleDisconnect = function() {
	this.emit("leave", this);
};

module.exports = Chatter;
