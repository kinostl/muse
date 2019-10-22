const confs = require('./knexfile');
const knex = require('knex')(confs[process.env.NODE_ENV || "testing"]);
const bcrypt = require('bcrypt');
const {MuseError} = require('./errors');

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

db.login = async (name, password) => {
    let account = await db.knex('accounts').where('name', name).first();
    if (!account) throw new MuseError("Account not found.");
    let isPassWordCorrect = await bcrypt.compare(password, account.password);
    if (!isPassWordCorrect) throw new MuseError("Incorrect password.");
    delete account.password;
    return account;
};

db.getSubscriptions = async (account) => {
    await db.knex('subscriptions').where({
        'accounts_id':account.id,
        'status':'gagged'
    }).update({status:'on'});
    let channels = await db.knex('subscriptions').where({
        'accounts_id':account.id,
        'status':'on'
    })
    .join('channels',{'subscriptions.channels_id':'channels.id'})
    .select();
    return channels;
}

db.addAccount = async (name, password) => {
    password = await bcrypt.hash(password, 10);
    let existingAccount = await db.knex('accounts').where({name:name}).first();
    if(existingAccount) throw new MuseError("The name `" + name + "` is already taken.");
    await db.knex('accounts').insert({
        name: name,
        password: password,
    });
    let account=await db.knex('accounts').where({name:name}).first();
    let defaultChannels=await db.knex('channels').where({isDefault:true}).select();
    let defaultSubs = defaultChannels.map((channel)=>({
        accounts_id: account.id,
        channels_id: channel.id
    }));
    await db.knex('subscriptions').insert(defaultSubs);
    return account;
};

module.exports = db;