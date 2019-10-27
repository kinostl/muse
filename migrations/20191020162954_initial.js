exports.up = function(knex) {
	return knex.schema
		.createTable('channels', function (table) {
			table.increments('id');
			table.string('name', 255).notNullable();
			table.enu('type', [
				'chat', //Out of Character
				'green', //Partial In Character
				'stage', //In Character
				'chapter', //Chapter Specific In Character
				'discussion' //Chapter or Article Discussion
			]).notNullable().defaultTo('chat');
			table.bool('isDefault').notNullable().defaultTo(false);
			table.unique('name');
		})
		.createTable('chapters', (table)=>{
			table.increments('id');
			table.integer('accounts_id').notNullable();
			table.integer('channels_id').notNullable();
			table.string('title', 255).notNullable();
			table.string('summary', 140);
		})
		.createTable('accounts', function (table) {
			table.increments('id');
			table.string('name', 255).notNullable();
			table.string('password', 255).notNullable();
			table.jsonb('attributes');
			table.unique('name');
		})
		.createTable('articles', function (table) {
			table.increments('id');
			table.integer('accounts_id').notNullable();
			table.enu('type', [
				'reference', //Anything else. Things, profiles, reference characters
				'character', //Playable
				'location', //Spawnable for Chapter
				'event', //Timeline
			]).notNullable().defaultTo("reference");
			table.string('title', 255).notNullable();
			table.string('summary', 140);
			table.text('content').notNullable();
			table.jsonb('attributes');
		})
		.createTable('logs', (table)=>{
			table.increments('id');
			table.integer('accounts_id').notNullable();
			table.integer('channels_id').notNullable();
			table.integer('characters_id');
			table.integer('chapters_id');
			table.integer('locations_id');
			table.text('content').notNullable();
			table.timestamps();
		})
		.createTable('subscriptions', function (table) {
			table.increments('id');
			table.integer('accounts_id').notNullable();
			table.integer('channels_id').notNullable();
			table.integer('articles_id');
			table.string('title',255);
			table.enu('status',[
				'on',
				'off',
				'gagged'
			]).notNullable().defaultTo('on');
		})
		.then(()=>knex('channels').insert({
			'name':'general',
			'type':'chat',
			'isDefault':true
		}));
};

exports.down = function(knex) {
	return knex.schema.dropTableIfExists('channels');
};
