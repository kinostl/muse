const PubSub = require('pubsub-js');
const db = require('../db');

const requires = {
    "channel": ["on", "off", "say"],
};

const permissions = {
    "admin": ["add", "delete", "type", "name"]
};

/**
 * chan/as
 * chan/title
 * chan/recall
 **/

/***
 * Administrative Functions
 ***/

/**
 * chan/delete
 * chan/type
 * chan/name
 **/

module.exports = {}
module.exports.help={
    "on":"Join a channel",
    "off":"Leave a channel",
    "list":"See available channels",
    "say":"Send message to channel",
    "add":"Create a new channel",
}
module.exports.handlers = {
    "on": async (args, chatter, line) => {
        let channel=args[0];
        if (chatter.subscribedTo("chat." + channel.name)) {
            PubSub.publish("system." + chatter.id, "Already connected to `" + channel.name + "`.");
        } else {
            chatter.subscribe("chat." + channel.name);
        }
    },
    "off": async (args, chatter, line) => {
        let channel=args[0];
        if (chatter.subscribedTo("chat." + channel.name)) {
            chatter.unsubscribe("chat." + channel.name);
        } else {
            PubSub.publish("system." + chatter.id, "Already disconnected from `" + channel.name + "`.");
        }
    },
    "say": async (args, chatter, line) => {
        let channel=args[0];
        let message=args[1];
        if (chatter.subscribedTo("chat." + channel.name)) {

            PubSub.publish("chat." + channel.name, chatter.nickname + " says, \"" + message + "\".");
        } else {
            PubSub.publish("system." + chatter.id, "Not connected to `" + channel.name + "`. Connect with `@channel/on`.");
        }
    },
    "list": async (args, chatter, line) => {
        let channels = await db.getChannelList();
        if(channels.length > 0){
            let channel_list = channels.reduce((list, channel) => list+"\r\n Name: "+channel.name+", Type: "+channel.type, "Channels: ");
            PubSub.publish("system." + chatter.id, channel_list);
        }else{
            PubSub.publish("system." + chatter.id, "No Channels.");
        }
    },
    "add": async (args, chatter, line) => {
        await db.addChannel(args[0],'ooc');
        PubSub.publish("system." + chatter.id, "Added "+args[0]+" to channels.");
    },
};
module.exports.handle = async function (handler, args, chatter, line) {
    if (requires["channel"].includes(handler)) {
        let channel= await db.getChannel(args[0]);
        if (channel) {
            args[0] = channel;
        } else {
            throw new Error("Could not find a channel that contains `" + args[0] + "`.");
        }
    }
    await module.exports.handlers[handler](args, chatter, line);
};