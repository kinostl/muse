const PORT = 1212;
const HOST = "localhost";

const debug = require('debug');
const db = require('./db');
const ChatServer = require('./ChatServer');
const PubSub = require('pubsub-js');

async function startServer() {
	try {
		await db.knex.migrate.latest();
		let channels = await db.getChannelList();
		channels = channels.map(
			(channel) => PubSub.subscribe("chat." + channel.name,
				(message, data) => {
					debug("muse:" + message)(data);
				})
		);

		// Start the server!
		server = new ChatServer({
			"port": PORT,
			"host": HOST
		});

		debug("muse:core")("Started on " + HOST + " " + PORT);
		debug("muse:core")("Subscribed to " + channels.length + " channels.");
	} catch (e) {
		debug("muse:core.error")(e);
	}
}

startServer();