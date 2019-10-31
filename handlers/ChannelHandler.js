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
        if (chatter.subscribedTo("chat." + channel.name)) throw new MuseError("Already connected to `" + channel.name + "`.");
        if (chatter.account) db.subscribe(chatter.account, channel);
        chatter.subscribe("chat." + channel.name);
    },
    "off": async (args, chatter, line) => {
        let channel=args[0];
        if (!chatter.subscribedTo("chat." + channel.name)) throw new MuseError("Already disconnected from `" + channel.name + "`.");
        if (chatter.account) db.unsubscribe(chatter.account, channel);
        chatter.unsubscribe("chat." + channel.name);
    },
    "say": async (args, chatter, line) => {
        let channel=args[0];
        let message=args[1];
        if (!chatter.subscribedTo("chat." + channel.name)) throw new MuseError("Not connected to `" + channel.name + "`. Connect with `@channel/on`.");
        message = chatter.id + " says, \"" + message + "\".";
        PubSub.publish("chat." + channel.name, message);
        await db.addLog(message, chatter.account, channel);
    },
    "list": async (args, chatter, line) => {
        let channels = await db.getChannelList();
        if(channels.length < 1) throw new MuseError("No Channels.");
        let channel_list = channels.reduce((list, channel) => list + "\r\n Name: " + channel.name + ", Type: " + channel.type, "Channels: ");
        chatter.systemMessage(channel_list);
    },
    "add": async (args, chatter, line) => {
        //TODO rework this to get ooc from command
        db.addChannel(args[0],'ooc');
        chatter.systemMessage("Added "+args[0]+" to channels.");
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
    return module.exports.handlers[handler](args, chatter, line);
};