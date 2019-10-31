const db = require('../db');
/***
* Player Account Functions
****/

/**
 * article/list
 * article/read
 * 
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
    ],
    "type": ["type"],
    "name":["name"],
};

module.exports = {};
module.exports.help={
    "create":"Create an article.",
    "type":"Set an article's type.",
};
module.exports.handlers = {
    "read": async function (args, chatter, line) {
        let [id] = args;
        let article = await db.getArticle(id);
        if(!article) throw new MuseError("Article not found.");
        article = "==="+article.title+"===\r\n"+
        (article.summary?"\t("+article.summary+")\r\n":"")+
        "\t"+article.content;
        chatter.systemMessage(article);
    },
    "create": async function (args, chatter, line) {
        let [title, content] = args;
        db.addArticle(chatter.account, title, content);
        chatter.systemMessage("Added `"+title+"` to the article database.");
    },
    "list": async function (args, chatter, line) {
        let articles = await db.getArticleList();
        articles = articles.reduce((print, article)=>print+"\r\n#"+article.id+"\tTitle: "+article.title+"\r\n "+(article.summary?article.summary:article.content.substring(0,70)+"..."),"==Latest Articles==");
        chatter.systemMessage(articles);
    },
    "type": async function (args, chatter, line) {
        let [title, type] = args;
        db.setArticleType(chatter.account, title, type);
        chatter.systemMessage("Changed `"+title+"` to be of type "+type+".");
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