const net = require("net");
const sys = require("util");
const EventEmitter = require("events").EventEmitter;
const PubSub = require('pubsub-js');
const debug = require('debug');

/*******************************************************************************
 * ChatServer
 *
 * Manages connections, users, and chat messages.
 ******************************************************************************/

const PORT = 1212;
const HOST = "localhost";
let debug_sockets = {};

function DebugSocket(message, data){
	let _debug = debug(message);
	_debug(data);
}

function ChatServer() {
	this.server   = net.createServer(this.handleConnection.bind(this));
	this.server.listen(PORT, HOST);
	this.ids=0;
}

ChatServer.prototype.isNicknameLegal = function(nickname) {
	// A nickname may contain letters or numbers only,
	if(nickname.replace(/[A-Za-z0-9]*/, '') != "") {
		return false
	}
	return true;
};

ChatServer.prototype.handleConnection = function(connection) {
	console.log("Incoming connection from " + connection.remoteAddress);
	connection.setEncoding("utf8");

	var chatter = new Chatter(connection, this);
	this.ids++;
	chatter.subscribe("chat.system."+chatter.id);
	PubSub.publish("chat.system."+chatter.id, "Welcome! What is your nickname?");
	chatter.on("chat", this.handleChat.bind(this));
	chatter.on("join", this.handleJoin.bind(this));
	chatter.on("leave", this.handleLeave.bind(this));
};

ChatServer.prototype.handleChat = function(chatter, message) {
	PubSub.publish("chat.general", chatter.nickname + " says, \"" + message+"\"");
};

ChatServer.prototype.handleJoin = function(chatter) {
	chatter.subscribe("chat.general");
	PubSub.publish("chat.general", chatter.nickname + " has joined the chat.");
};

ChatServer.prototype.handleLeave = function(chatter) {
	PubSub.publish("chat.general", chatter.nickname + " has left the chat.");
	chatter.unsubscribe("chat.general");
};

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
};

Chatter.prototype.subscribe = function(channel) {
	this.channels[channel] = PubSub.subscribe(channel,this.send.bind(this));
	if(!debug_sockets[channel]){
		debug_sockets[channel] = PubSub.subscribe(channel,DebugSocket);
	}
}

Chatter.prototype.unsubscribe = function(channel) {
	PubSub.unsubscribe(this.channels[channel]);
	delete this.channels[channel];
	if(channel.split().length > 2 && deb_sockets[channel]){
		delete debug_sockets[channel]
	}
}

Chatter.prototype.handleNickname = function(nickname) {
	if(server.isNicknameLegal(nickname)) {
		this.nickname = nickname;
		this.lineBuffer.removeAllListeners("line");
		this.lineBuffer.on("line", this.handleChat.bind(this));
		this.emit("join", this);
	} else {
		PubSub.publish("chat.system."+this.id, "Sorry, but that nickname is not legal or is already in use!");
		PubSub.publish("chat.system."+this.id, "What is your nickname?");
	}
};

Chatter.prototype.handleChat = function(line) {
	this.emit("chat", this, line);
};

Chatter.prototype.handleDisconnect = function() {
	this.emit("leave", this);
};


/*******************************************************************************
 * SocketLineBuffer
 *
 * Listens for and buffers incoming data on a socket and emits a 'line' event
 * whenever a complete line is detected.
 ******************************************************************************/

function SocketLineBuffer(socket) {
	EventEmitter.call(this);

	this.socket = socket;
	this.buffer = "";

	this.socket.on("data", this.handleData.bind(this));
};

sys.inherits(SocketLineBuffer, EventEmitter);

SocketLineBuffer.prototype.handleData = function(data) {
	for(var i = 0; i < data.length; i++) {
		var char = data.charAt(i);
		this.buffer += char;
		if(char == "\n") {
			this.buffer = this.buffer.replace("\r\n", "");
			this.buffer = this.buffer.replace("\n", "");
			this.emit("line", this.buffer);
			this.buffer = "";
		}
	}
};

// Start the server!
server = new ChatServer();
console.log("Started on "+HOST+" "+PORT);
