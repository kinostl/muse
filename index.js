const PORT = 1212;
const HOST = "localhost";

const debug = require('debug');
const db = require('./db');
const ChatServer = require('./ChatServer');
const PubSub = require('pubsub-js');

db.knex.migrate.latest()
	.then(() => {
		return db.getChannelList();
	})
	.then((rows) => rows.map((row) => PubSub.subscribe("chat." + row.name, (message, data) => {
		debug("muse:"+message)(data);
	})))
	.then((channels) => {
		// Start the server!
		server = new ChatServer({
			"port": PORT,
			"host": HOST
		});

		debug("muse:core")("Started on " + HOST + " " + PORT);
		debug("muse:core")("Subscribed to "+channels.length+" channels.");
	}).catch((e) => {
		debug("muse:core.error")(e);
	});
