const confs = require('./knexfile');
const knex = require('knex')(confs[process.env.NODE_ENV || "testing"]);
const bcrypt = require('bcrypt');
const {MuseError} = require('./errors');

const db = {}
db.knex = knex;

//Channels
db.getChannel = async (name) => db.knex('channels').where('name', 'like', `%${name}%`).first();
db.getChannelList = async () => db.knex('channels').select();
db.addChannel = async (name, type) => db.knex('channels').insert({
    name: name,
    type: type
});
db.setChannelType = async (name, type) => db.knex('channels')
    .where('name', name)
    .update({ type: type });

db.getDefaultChannels = async () => db.knex('channels').where({isDefault:true}).select();

//Accounts
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
        return existingSubQuery.update({
            status:status
        });
    }else{
        query.status=status;
        return db('subscriptions').insert(query);
    }
};

db.subscribe = async (account, channel) => db.setSubStatus(account, channel, 'on');
db.unsubscribe = async (account, channel) => db.setSubStatus(account, channel, 'off');

db.getSubscriptions = async (account) => {
    await db.knex('subscriptions').where({
        'accounts_id':account.id,
        'status':'gagged'
    }).update({status:'on'});
    return db.knex('subscriptions').where({
        'accounts_id':account.id,
        'status':'on'
    })
    .join('channels',{'subscriptions.channels_id':'channels.id'}) //TODO I dont know how joins work and this probably am a problem
    .select();
};


db.setDefaultSubs = async (account) => {
    let defaultChannels = await db.getDefaultChannels();
    let defaultSubs = defaultChannels.map((channel)=>({
        accounts_id: account.id,
        channels_id: channel.id
    }));
    return db.knex('subscriptions').insert(defaultSubs);
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

//Articles

db.addArticle = async (account, title, content) => db.knex('articles').insert({
    accounts_id: account.id,
    content: content,
    title: title
});

db.getArticleList = async () => db.knex('articles').select().limit(10);
db.getArticle = async (id) => db.knex('articles').where({id:id}).first();

//Logs

db.addLog = async (content, account, channel, character, location, chapter) => {
    let logData = {
        accounts_id: account.id,
        channels_id: channel.id,
        content: content,
    };
    if(chapter) logData.chapters_id = chapter.id;
    if(character) logData.characters_id = character.id;
    if(location) logData.locations_id = location.id;

    return db.knex('logs').insert(logData);
}

// Chapters

db.addChapter = async (account, title) {
    //create discussion channel
    let discussion = db.addChannel(title+" discussion",'discussion');
    //create chapter channel
    let chapter = db.addChannel(title,'chapter');

    //create chapter
    await chapter;
    let channel = await db.knex('channels').where({
        name: name,
        type: 'chapter'
    }).last();
    await db.knex('chapters').insert({
        accounts_id: account.id,
        channels_id: channel.id,
        title: title,
    });

    //setup subscriptions
    await discussion;
    await db.subscribe(account, title);
    await db.subscribe(account, title+" discussion");
}

module.exports = db;