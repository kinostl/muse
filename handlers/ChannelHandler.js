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
    "on": async (target, chatter, message) => {
        if (chatter.subscribedTo("chat." + target)) {
            PubSub.publish("system." + chatter.id, "Already connected to `" + target + "`.");
        } else {
            chatter.subscribe("chat." + target);
        }
    },
    "off": async (target, chatter, message) => {
        if (chatter.subscribedTo("chat." + target)) {
            chatter.unsubscribe("chat." + target);
        } else {
            PubSub.publish("system." + chatter.id, "Already disconnected from `" + target + "`.");
        }
    },
    "say": async (target, chatter, message) => {
        if (chatter.subscribedTo("chat." + target)) {
            PubSub.publish("chat." + target, chatter.nickname + " says, \"" + say_string + "\".");
        } else {
            PubSub.publish("system." + chatter.id, "Not connected to `" + target + "`. Connect with `@channel/on`.");
        }
    },
    "list": async (target, chatter, message) => {
        let channels = await db.getChannelList();
        if(channels.length > 0){
            let channel_list = channels.reduce((list, channel) => list+"\r\n Name: "+channel.name+", Type: "+channel.type, "Channels: ");
            PubSub.publish("system." + chatter.id, channel_list);
        }else{
            PubSub.publish("system." + chatter.id, "No Channels.");
        }
    },
};
module.exports.handle = async function (handler, target, chatter, message) {
    if (requires["channel_name"].includes(handler)) {
        let channel_name = await db.getChannel(target);
        if (channel_name) {
            target = channel_name;
        } else {
            throw new Error("Could not find a channel that contains `" + target + "`.");
        }
    }
    await module.exports.handlers[handler](target, chatter, message);
};