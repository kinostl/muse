const PubSub = require('pubsub-js');
const debug = require('debug');

const handlers = {
    //"help": require('./handlers/HelpHandler'),
    //"story": require('./handlers/StoryHandler'),
    "channel": require('./handlers/ChannelHandler'),
    //"mail": require('./handlers/MailHandler'),
    //"article": require('./handlers/ArticleHandler'),
    //"player": require('./handlers/PlayerHandler'),
    //"profile": require('./handlers/ProfileHandler'),
    //"account": require('./handlers/AccountHandler'),
}

module.exports = function (chatter, message) {
    let [command, target] = message.trim().split(" ", 2);
    let args = command.slice(1).split("/");
    try{
        command = args[0];
        let handler = args[1];
        if (
            handlers.hasOwnProperty(command)
            && handlers[command].handlers.hasOwnProperty(handler)
        ) {
            args.splice(0, 1);
            handlers[command].handle(args, target, chatter, message);
        } else {
            throw new Error("`" + message + "` is not a valid command.");
        }
    }catch(e){
        debug('core.error')(e);
        PubSub.publish("system." + chatter.id, e.message);
    }

    /**
     * help
     **/

    /**
     * story/start
     * story/end
     * story/title
     * story/summary
     * story/invite
     **/


    /**
     * mail/send
     * mail/read
     * mail/delete
     **/

    /**
     * article/create
     * article/delete
     * article/name
     * article/summary
     * article/edit
     * article/type
     **/

    /***
     * Player Account Functions
     ****/

    /**
     * player/block
     * player/unblock
     * player/ignore
     * player/unignore
     **/


    /**
     * profile/create
     * profile/delete
     * profile/rename
     **/

    /***
     * Administrative Functions
     ***/

    /**
     * account/add_role
     * account/remove_role
     * account/ban
     * account/unban
     **/
}