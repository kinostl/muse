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

module.exports = async function (chatter, message) {
    let [command, target] = message.trim().split(" ", 2);
    let args = command.slice(1).split("/");
    try{
        command = args[0];
        let handler = args[1];
        let _commands = Object.keys(handlers).filter((o)=>o.includes(command));
        if(!_commands){
            throw new Error("`"+command+"` is not an option.");
        }
        if(_commands.length > 1){
            throw new Error("`"+command+"` is ambiguous. Please specify from these options: "+_commands.join(","));
        }
        command = _commands[0];

        let _handlers = Object.keys(handlers[command]).filter((o)=>o.includes(handler));
        if(!_handlers){
            throw new Error("`"+handler+"` is not an option.");
        }
        if(_handlers.length > 1){
            throw new Error("`"+handler+"` is ambiguous. Please specify from these options: "+_handlers.join(","));
        }
        args.splice(0, 1);
        await handlers[command].handle(handler, target, chatter, message);
    }catch(e){
        debug('muse:core.error')(e);
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