const PubSub = require('pubsub-js');
const EventEmitter = require("events").EventEmitter;
const sys = require("util");
const debug = require('debug');
const db = require('./db');

const CommandHandler = require('./CommandHandler');
const SocketLineBuffer = require('./SocketLineBuffer');
/*******************************************************************************
 * Chatter
 *
 * Represents a single user/connection in the chat server.
 * Managed user/connection chat messages and commands.
 ******************************************************************************/

function Chatter(socket, id) {
	EventEmitter.call(this);

	this.id   = "guest"+id;
	this.socket     = socket;
	this.lineBuffer = new SocketLineBuffer(socket);
	this.account    = null;
	this.channels   = {};

	this.lineBuffer.on("line", this.handleLine.bind(this));
	this.socket.on("close", this.handleDisconnect.bind(this));
	this.subscribe("system."+this.id);
};

sys.inherits(Chatter, EventEmitter);

Chatter.prototype.send = function(message, data) {
	message = message.split(".");
	let output=null;
	if(message[0] === "chat"){
		let header = message[1];
		output = "<"+header+"> "+data;
	}
	if(message[0] === "system"){
		let header = message[0];
		output = "[" + header + "] " + data;
	}
	if(output){
		this.socket.write(output+"\r\n");
		if (
			process.env.NODE_ENV === "testing" ||
			process.env.NODE_ENV === "debug" ||
			process.env.CREEPER === true
			//Or user is flagged for logging
		) {
			debug("muse:core.output." + this.id)(output);
		}
	}else{
		debug("muse:core.error")("Attempted to send non-chat, non-system info to Chatter.\r\n"+"Message: "+message+"\r\nData: "+data);
	}

};

Chatter.prototype.login = async function(name, password) {
	let account = await db.login(name, password);
	let channels = await db.getSubscriptions(account);
	let guestId = this.id;

	this.account = account;
	this.id = account.name;

	this.unsubscribe("system."+guestId);
	this.subscribe("system."+this.id);
	channels.forEach((channel)=>{this.subscribe("chat."+channel.name)});

	this.emit("login",guestId, this);
}

Chatter.prototype.subscribedTo = function(channel){
	return this.channels.hasOwnProperty(channel);
}

Chatter.prototype.subscribe = function(channel) {
	this.channels[channel] = PubSub.subscribe(channel,this.send.bind(this));
	if(channel.startsWith("chat")){
		PubSub.publish(channel, this.id + " has joined the chat.");
	}
}

Chatter.prototype.unsubscribe = function(channel) {
	if(channel.startsWith("chat")){
		PubSub.publish(channel, this.id + " has left the chat.");
	}
	PubSub.unsubscribe(this.channels[channel]);
	delete this.channels[channel];
}

Chatter.prototype.handleLine = function(line) {
	if (
		process.env.NODE_ENV === "testing" ||
		process.env.NODE_ENV === "debug" ||
		process.env.CREEPER === true
		//Or user is flagged for logging
	) {
		debug("muse:core.input." + this.id)(line);
	}
	if(line.startsWith(process.env.COMMAND_PREFIX)){
		CommandHandler(this, line)
	}else{
		PubSub.publish("system." + this.id, "`"+line+"` isn't an option. See available commands with `@help`");
	}
};

Chatter.prototype.handleDisconnect = function() {
	/*
	this.unsubscribe(channel);
	PubSub.publish(channel, this.id + " has left the chat.");
	*/
	this.emit("disconnect",this);
};

module.exports = Chatter;
