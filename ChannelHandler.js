const PubSub = require('pubsub-js');

/**
 * TODO remove this and replace it with a database
 */
let channel_names=[
	"general",
	"cooking"
]

module.exports = function (chatter, message) {
    let [channel_id, say_string] = message.trim().split(" ", 2);
    channel_id = channel_id.slice(1);
    let channel_name = channel_names.find((o) => o.includes(channel_id));
    if (channel_name) {
        if (chatter.subscribedTo("chat." + channel_name)) {
            PubSub.publish("chat." + channel_name, chatter.nickname + " says, \"" + say_string + "\".");
        } else {
            PubSub.publish("system." + chatter.id, "Not connected to `" + channel_name + "`. Connect with `@channel/on`.");
        }
    } else {
        PubSub.publish("system." + chatter.id, "Could not find a channel that contains `" + channel_id + "`.");
    }
}