const debug = require('debug');
const PubSub = require('pubsub-js');
const EventEmitter = require("events").EventEmitter;
const net = require("net");
const Chatter=require('./Chatter');

/*******************************************************************************
 * ChatServer
 *
 * Manages connections, users, and chat messages.
 ******************************************************************************/

let channel_names=[
	"general",
	"cooking"
]

function ChatServer(config) {
	this.server   = net.createServer(this.handleConnection.bind(this));
	this.server.listen(config.port, config.host);
	this.debug_sockets={};
	this.ids=0;
	this.command_prefix=config.command_prefix;
	this.channel_prefix=config.channel_prefix;
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
	if(message.startsWith(this.channel_prefix)){
		let [channel_id, say_string]= message.trim().split(" ",2);
		channel_id = channel_id.slice(1);
		let channel_name = channel_names.find((o)=>o.includes(channel_id));
		if(channel_name){
			if(chatter.subscribedTo("chat."+channel_name)){
				PubSub.publish("chat."+channel_name, chatter.nickname + " says, \"" +say_string+"\".");
			}else{
				PubSub.publish("system."+chatter.id, "Not connected to `"+channel_name+"`. Connect with `@chan/on`.");
			}
		}else{
			PubSub.publish("system."+chatter.id, "Could not find a channel that contains `"+channel_id+"`.");
		}
	}

	if(message.startsWith(this.command_prefix)){
		/**
		 * help
		 **/

		/**
		 * story/start
		 * story/end
		 * story/title
		 * story/summary
		 * story/invite
		 **/

		/**
		 * chan/on
		 * chan/off
		 * chan/list
		 * chan/as
		 * chan/title
		 * chan/recall
		 **/

		/**
		 * mail/send
		 * mail/read
		 * mail/delete
		 **/

		/**
		 * article/create
		 * article/delete
		 * article/name
		 * article/summary
		 * article/edit
		 * article/type
		 **/

		/***
		 * Player Account Functions
		 ****/

		/**
		 * player/block
		 * player/unblock
		 * player/ignore
		 * player/unignore
		 **/


		/**
		 * account/create
		 * account/delete
		 * account/rename
		 **/

		/***
		 * Administrative Functions
		 ***/

		/**
		 * account/add_role
		 * account/remove_role
		 **/

		/**
		 * admin/ban
		 * admin/unban
		 **/

		/**
		 * chan/add
		 * chan/delete
		 * chan/type
		 **/


		let [command,target] = message.trim().split(" ",2);
		command = command.slice(1);
		let channel_id = target;
		let channel_name = channel_names.find((o)=>o.includes(channel_id));
		if(command === "chan/list"){
			PubSub.publish("system."+chatter.id, "Channels: "+channel_names.join(","));
		}else if(channel_name){
			if(command === "chan/on"){
				if(chatter.subscribedTo("chat."+channel_name)){
					PubSub.publish("system."+chatter.id, "Already connected to `"+channel_name+"`.");
				}else{
					chatter.subscribe("chat."+channel_name);
				}
			}
			if(command === "chan/off"){
				if(chatter.subscribedTo("chat."+channel_name)){
					chatter.unsubscribe("chat."+channel_name);
				}else{
					PubSub.publish("system."+chatter.id, "Already disconnected from `"+channel_name+"`.");
				}
			}
		}else{
			PubSub.publish("system."+chatter.id, "Could not find a channel that contains `"+channel_id+"`.");
		}
	}
};

ChatServer.prototype.handleJoin = function(chatter) {
	chatter.subscribe("chat.general");
};

ChatServer.prototype.handleLeave = function(chatter) {
	chatter.unsubscribe("chat.general");
};

module.exports = ChatServer
