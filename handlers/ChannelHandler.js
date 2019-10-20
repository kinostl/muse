const PubSub = require('pubsub-js');

/**
 * TODO remove this and replace it with a database
 */
const channel_names = [
    "general",
    "cooking"
]

const requires = {
    "channel_name": ["on", "off"],
};

const permissions = {
    "admin": ["add", "delete", "type"]
};

/**
 * chan/on
 * chan/off
 * chan/list
 * chan/as
 * chan/title
 * chan/recall
 **/

/***
 * Administrative Functions
 ***/

/**
 * chan/add
 * chan/delete
 * chan/type
 **/

module.exports = {}
module.exports.handlers = {
    "on": (args, target, chatter, message) => {
        if (chatter.subscribedTo("chat." + target)) {
            PubSub.publish("system." + chatter.id, "Already connected to `" + target + "`.");
        } else {
            chatter.subscribe("chat." + target);
        }
    },
    "off": (args, target, chatter, message) => {
        if (chatter.subscribedTo("chat." + target)) {
            chatter.unsubscribe("chat." + target);
        } else {
            PubSub.publish("system." + chatter.id, "Already disconnected from `" + target + "`.");
        }
    },
    "list": (args, target, chatter, message) => {
        PubSub.publish("system." + chatter.id, "Channels: " + channel_names.join(","));
    },
};
module.exports.handle = function (args, target, chatter, message) {
    let command = args[0];
    if (requires["channel_name"].includes(command)) {
        let channel_name = channel_names.find((o) => o.includes(target));
        if(!channel_name){
            throw new Error("Could not find a channel that contains `" + target + "`.");
        }else{
            target = channel_name;
        }
    }
    module.exports.handlers[command](args, target, chatter, message);
};