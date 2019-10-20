const PubSub = require('pubsub-js');
const db = require('../db');

const requires = {
    "channel_name": ["on", "off", "say"],
};

const permissions = {
    "admin": ["add", "delete", "type"]
};

/**
 * chan/on
 * chan/off
 * chan/list
 * chan/say
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
    "on": async (args, target, chatter, message) => {
        if (chatter.subscribedTo("chat." + target)) {
            PubSub.publish("system." + chatter.id, "Already connected to `" + target + "`.");
        } else {
            chatter.subscribe("chat." + target);
        }
    },
    "off": async (args, target, chatter, message) => {
        if (chatter.subscribedTo("chat." + target)) {
            chatter.unsubscribe("chat." + target);
        } else {
            PubSub.publish("system." + chatter.id, "Already disconnected from `" + target + "`.");
        }
    },
    "say": async (args, target, chatter, message) => {
        if (chatter.subscribedTo("chat." + target)) {
            PubSub.publish("chat." + target, chatter.nickname + " says, \"" + say_string + "\".");
        } else {
            PubSub.publish("system." + chatter.id, "Not connected to `" + target + "`. Connect with `@channel/on`.");
        }
    },
    "list": async (args, target, chatter, message) => {
        let channel_names = await db.getChannelList();
        PubSub.publish("system." + chatter.id, "Channels: " + channel_names.join(","));
    },
};
module.exports.handle = async function (args, target, chatter, message) {
    let command = args[0];
    if (requires["channel_name"].includes(command)) {
        let channel_name = await db.getChannel(target);
        if(channel_name.length < 1){
            throw new Error("Could not find a channel that contains `" + target + "`.");
        }else{
            target = channel_name[0];
        }
    }
    await module.exports.handlers[command](args, target, chatter, message);
};