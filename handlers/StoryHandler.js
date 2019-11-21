const db = require('../db');
const {MuseError} = require('../errors');
/***
* Player Account Functions
****/

/**
 * story/start
 * story/end
 * story/title
 * story/summary
 * story/invite
 * @chapter/as
 * @chapter/post
 * @chapter/discuss
 * @article/discuss
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
        let {chapter, discussion} = await db.addChapter(chatter.account, title);
        chatter.subscribe("chapter."+chapter, title);
        chatter.subscribe("discussion."+discussion, title);
        chatter.systemMessage("Prepared for the chapter `" + title + "`.");
    },
};
module.exports.handle = async function (handler, args, chatter, line) {
    [
        "title",
    ].forEach((requirement) => {
        if (requires[requirement].includes(handler)) {
            if (!args[0]) throw new MuseError("`" + handler + "` needs " + requirement + ".");
        }
    })
    return module.exports.handlers[handler](args, chatter, line);
};