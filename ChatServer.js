const debug = require('debug');
const net = require("net");
const Chatter=require('./Chatter');

/*******************************************************************************
 * ChatServer
 *
 * Manages connections.
 ******************************************************************************/

function ChatServer(config) {
	this.server   = net.createServer(this.handleConnection.bind(this));
	this.server.listen(config.port, config.host);
	this.guests={};
	this.connections={};
}

ChatServer.prototype.handleConnection = function(connection) {
	debug("muse:core")("Incoming connection from " + connection.remoteAddress);
	connection.setEncoding("utf8");
	connection.setKeepAlive(true);

	let guestId=Object.keys(this.guests).length;
	let chatter = new Chatter(connection, guestId);
	chatter.on("disconnect",this.handleDisconnect.bind(this));
	this.guests[chatter.id]=chatter;
};

ChatServer.prototype.handleLogin = function(guestId, chatter){
	this.connections[chatter.id]=chatter;
	delete this.guests[guestId];
}

ChatServer.prototype.handleDisconnect = function (chatter) {
	if(chatter.isAuthorized()){
		delete this.connections[chatter.id];
	}else{
		delete this.guests[chatter.id];
	}
}

module.exports = ChatServer
