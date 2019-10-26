const PubSub = require('pubsub-js');
const debug = require('debug');
const {MuseError} = require('./errors');
const handlers = require('./handlers');

module.exports = async function (chatter, line) {
    let args = line.trim().split(" ", 2);
    let [command, handler] = args[0].slice(1).split("/").map((o)=>o.trim());
    try{
        let commands = Object.keys(handlers).filter((o)=>o.includes(command));
        if(!commands) throw new MuseError("`"+command+"` is not an option.");
        if(commands.length > 1) throw new MuseError("`"+command+"` is ambiguous. Please specify from these options: "+commands.join(","));
        command = commands[0];

        let _handlers = Object.keys(handlers[command]).filter((o)=>o.includes(handler));
        if(!_handlers) throw new MuseError("`"+handler+"` is not an option.");
        if(_handlers.length > 1) throw new MuseError("`"+handler+"` is ambiguous. Please specify from these options: "+_handlers.join(","));
        args = args[1] && args[1].split("=", 2).map((o) => o.trim());
        await handlers[command].handle(handler, args, chatter, line);
    }catch(e){
        if(e instanceof MuseError){
            PubSub.publish("system." + chatter.id, e.message);
        }else{
            debug('muse:core.error')(e);
        }
    }

    /**
     * help
     **/

    /**
     * mail/send
     * mail/read
     * mail/delete
     **/
}