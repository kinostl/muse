const uuid= require('uuid/v4');

exports.up = function(knex) {
	return knex.schema
		.createTable('channels', function (table) {
			table.uuid('id');
			table.string('name', 255).notNullable();
			table.enu('type', [
				'chat', //Out of Character
				'green', //Partial In Character
				'stage', //In Character
				'chapter', //Chapter Specific In Character
				'discussion' //Chapter Discussion
			]).notNullable().defaultTo('chat');
			table.bool('isDefault').notNullable().defaultTo(false);
			table.unique('name');
		})
		.createTable('chapters', (table)=>{
			table.uuid('id');
			table.uuid('accounts_id').notNullable();
			table.uuid('chapters_id').notNullable();
			table.uuid('discussions_id').notNullable();
			table.string('title', 255).notNullable();
			table.string('summary', 140);
		})
		.createTable('accounts', function (table) {
			table.uuid('id');
			table.string('name', 255).notNullable();
			table.string('password', 255).notNullable();
			table.jsonb('attributes');
			table.unique('name');
		})
		.createTable('articles', function (table) {
			table.uuid('id');
			table.uuid('accounts_id').notNullable();
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
			table.uuid('id');
			table.uuid('accounts_id').notNullable();
			table.uuid('channels_id').notNullable();
			table.uuid('characters_id');
			table.uuid('chapters_id');
			table.uuid('locations_id');
			table.text('content').notNullable();
			table.timestamps();
		})
		.createTable('subscriptions', function (table) {
			table.uuid('id');
			table.uuid('accounts_id').notNullable();
			table.uuid('channels_id').notNullable();
			table.uuid('articles_id');
			table.string('title',255);
			table.enu('status',[
				'on',
				'off',
				'gagged'
			]).notNullable().defaultTo('on');
		})
		.then(()=>knex('channels').insert({
			'id': uuid(),
			'name':'general',
			'type':'chat',
			'isDefault':true
		}));
};

exports.down = function(knex) {
	return knex.schema.dropTableIfExists('channels');
};
