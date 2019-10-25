const db = require('../db');
const PubSub = require('pubsub-js');
/***
* Player Account Functions
****/

/**
 * account/login
 * account/logout
 * account/create
 * account/delete
 * account/rename
 * account/block
 * account/unblock
 * account/ignore
 * account/unignore
 * account/add_role
 * account/remove_role
 **/

/***
 * Administrative Functions
 ***/

/**
 * account/ban
 * account/unban
 **/

module.exports = {};
module.exports.help={
    "login":"Log into your account.",
    "create":"Create your account.",
};
module.exports.handlers = {
    "login": async function(args, chatter, line){
        let [name, password] = args;
        await chatter.login(name, password);
        PubSub.publish("system." + chatter.id, "Logged in. Welcome, " + chatter.id +".");

    },
    "create": async function (args, chatter, line) {
        let [name, password] = args;
        await db.addAccount(name, password);
        module.exports.handlers.login([name, password],chatter, line);
    }
};
module.exports.handle = async function (handler, args, chatter, line) {
    return module.exports.handlers[handler](args, chatter, line);
};