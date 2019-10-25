const db = require('../db');
const PubSub = require('pubsub-js');
/***
* Player Account Functions
****/

/**
 * article/read
 * article/create
 * article/delete
 * article/name
 * article/summary
 * article/edit
 * article/type
 **/

/***
 * Administrative Functions
 ***/

const requires = {
    "content": [
        "create",
        "edit",
        "summary",
    ]
};

module.exports = {};
module.exports.help={
    "create":"Create an article.",
    "type":"Set an article's type.",
};
module.exports.handlers = {
    "create": async function (args, chatter, line) {
        let [title, content] = args;
        db.addArticle(chatter.account, title, content);
        PubSub.publish("system." + chatter.id, "Added `"+title+"` to the article database.");
    },
    "type": async function (args, chatter, line) {
        let [title, type] = args;
        db.setArticleType(chatter.account, title, type);
        PubSub.publish("system." + chatter.id, "Changed `"+title+"` to be of type "+type+".");
    },
};
module.exports.handle = async function (handler, args, chatter, line) {
    if (requires["content"].includes(handler)) {
        if(!args[1]) throw new MuseError("`"+handler+"` needs content.");
    }
    return module.exports.handlers[handler](args, chatter, line);
};