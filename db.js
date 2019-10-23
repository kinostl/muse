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

db.setSubStatus = async(account, channel, status)=>{
    let query={
        'accounts_id':account.id,
        'channels_id':channel.id,
    }
    let existingSubQuery = db.knex('subscriptions').where(query);
    let existingSub = await existingSubQuery.first();
    if(existingSub){
        await existingSubQuery.update({
            status:status
        });
    }else{
        query.status=status;
        await db('subscriptions').insert(query);
    }
};

db.subscribe = async (account, channel) => {
    await db.setSubStatus(account, channel, 'on');
};

db.unsubscribe = async (account, channel) => {
    await db.setSubStatus(account, channel, 'off');
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
    .join('channels',{'subscriptions.channels_id':'channels.id'}) //TODO I dont know how joins work and this probably am a problem
    .select();
    return channels;
};

db.getDefaultChannels = async () => {
    return await db.knex('channels').where({isDefault:true}).select();
};

db.setDefaultSubs = async (account) => {
    let defaultChannels = await db.getDefaultChannels();
    let defaultSubs = defaultChannels.map((channel)=>({
        accounts_id: account.id,
        channels_id: channel.id
    }));
    await db.knex('subscriptions').insert(defaultSubs);
};

db.addAccount = async (name, password) => {
    password = await bcrypt.hash(password, 10);
    let existingAccount = await db.knex('accounts').where({name:name}).first();
    if(existingAccount) throw new MuseError("The name `" + name + "` is already taken.");
    await db.knex('accounts').insert({
        name: name,
        password: password,
    });
    let account=await db.knex('accounts').where({name:name}).first();
    await db.setDefaultSubs(account);
    return account;
};

module.exports = db;