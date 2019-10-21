const confs = require('./knexfile');
const knex = require('knex')(confs[process.env.NODE_ENV || "testing"]);
const bcrypt = require('bcrypt');
const {DatabaseError} = require('./errors');

const db = {}
db.knex = knex;
db.getChannel = async (name) => await db.knex('channels').where('name', 'like', `%${name}%`).first();
db.getChannelList = async () => await db.knex('channels').select();
db.addChannel = async (name, type) => await db.knex('channels').insert({
    name: name,
    type: type
});
db.setChannelType = async (name, type) => await db.knex('channels')
    .where('name', name)
    .update({ type: type });

db.addAccount = async (name, password) => {
    password = await bcrypt.hash(password, 10);
    try{
        return await db.knex('accounts').insert({
            name: name,
            password: password,
        })
    }catch(e){
        throw new DatabaseError(e);
    }
};

module.exports = db;