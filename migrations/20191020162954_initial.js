exports.up = function(knex) {
	return knex.schema
		.createTable('channels', function (table) {
			table.increments('id');
			table.string('name', 255).notNullable();
			table.string('type', 255).notNullable();
			table.bool('isDefault').notNullable().defaultTo(false);
			table.unique('name');
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
				'location', //Spawnable for Story
				'event', //Timeline
			]).notNullable().defaultTo("reference");
			table.string('title', 255).notNullable();
			table.string('summary', 255);
			table.text('content').notNullable();
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
			'type':'ooc',
			'isDefault':true
		}));
};

exports.down = function(knex) {
	return knex.schema.dropTableIfExists('channels');
};
