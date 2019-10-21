const db = require('../db');
const {DatabaseError, MuseError} = require('../errors');
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

module.exports = {};
module.exports.handlers = {
    "create": async function (args, chatter, line) {
        let [name, password] = args;
        try{
            await db.addAccount(name, password);
        }catch(e){
            if(e instanceof DatabaseError){
                throw new MuseError("The name `" + name + "` is already taken.");
            }else{
                throw e;
            }
        }
    }
};
module.exports.handle = async function (handler, args, chatter, line) {
    await module.exports.handlers[handler](args, chatter, line);
};