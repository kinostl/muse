const PubSub = require('pubsub-js');
const db = require('../db');
const {MuseError} = require('../errors');

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
 * chan/gag
 * chan/ungag
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
            throw new MuseError("Already connected to `" + channel.name + "`.");
        } else {
            chatter.subscribe("chat." + channel.name);
        }
    },
    "off": async (args, chatter, line) => {
        let channel=args[0];
        if (chatter.subscribedTo("chat." + channel.name)) {
            chatter.unsubscribe("chat." + channel.name);
        } else {
            throw new MuseError("Already disconnected from `" + channel.name + "`.");
        }
    },
    "say": async (args, chatter, line) => {
        let channel=args[0];
        let message=args[1];
        if (chatter.subscribedTo("chat." + channel.name)) {
            PubSub.publish("chat." + channel.name, chatter.id + " says, \"" + message + "\".");
        } else {
            throw new MuseError("Not connected to `" + channel.name + "`. Connect with `@channel/on`.");
        }
    },
    "list": async (args, chatter, line) => {
        let channels = await db.getChannelList();
        if(channels.length > 0){
            let channel_list = channels.reduce((list, channel) => list+"\r\n Name: "+channel.name+", Type: "+channel.type, "Channels: ");
            PubSub.publish("system." + chatter.id, channel_list);
        }else{
            throw new MuseError("No Channels.");
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
            throw new MuseError("Could not find a channel that contains `" + args[0] + "`.");
        }
    }
    await module.exports.handlers[handler](args, chatter, line);
};