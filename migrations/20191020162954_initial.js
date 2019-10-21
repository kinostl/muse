exports.up = function(knex) {
	return knex.schema
		.createTable('channels', function (table) {
			table.increments('id');
			table.string('name', 255).notNullable();
			table.string('type', 255).notNullable();
			table.unique('name');
		})
		.createTable('accounts', function (table) {
			table.increments('id');
			table.string('name', 255).notNullable();
			table.string('password', 255).notNullable();
			table.jsonb('attributes');
			table.unique('name');
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
			]).notNullable().defaultTo('off');
		})
		.then(()=>knex('channels').insert({
			'name':'general',
			'type':'ooc',
		}));
};

exports.down = function(knex) {
	return knex.schema.dropTableIfExists('channels');
};
