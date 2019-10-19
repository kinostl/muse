const EventEmitter = require("events").EventEmitter;
const sys = require("util");

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

module.exports = SocketLineBuffer;
