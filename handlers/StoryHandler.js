const db = require('../db');
const PubSub = require('pubsub-js');
/***
* Player Account Functions
****/

/**
 * story/start
 * story/end
 * story/title
 * story/summary
 * story/invite
 **/

/***
 * Administrative Functions
 ***/

const requires = {
    "content": [
        "summary",
    ],
    "title":[
        "start",
        "end",
        "title"
    ],
};

module.exports = {};
module.exports.help={
    "start":"Start a new chapter. Creates a chapter and discussion channel.",
};
module.exports.handlers = {
    "start": async function (args, chatter, line) {
        let [title] = args;
        db.addChapter(chatter.account, title);
        PubSub.publish("system." + chatter.id, "Prepared for the chapter `"+title+"`.");
    },
};
module.exports.handle = async function (handler, args, chatter, line) {
    [
        "content",
        "type",
        "name"
    ].forEach((requirement) => {
        if (requires[requirement].includes(handler)) {
            if (!args[1]) throw new MuseError("`" + handler + "` needs " + requirement + ".");
        }
    })
    return module.exports.handlers[handler](args, chatter, line);
};