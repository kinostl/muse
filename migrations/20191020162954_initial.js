exports.up = function(knex) {
	return knex.schema
		.createTable('channels', function (table) {
			table.increments('id');
			table.string('name', 255).notNullable();
			table.string('type', 255).notNullable();
		})
		.createTable('accounts', function (table) {
			table.increments('id');
			table.string('name', 255).notNullable();
			table.string('password', 255).notNullable();
			table.jsonb('attributes');
		})
		.then(()=>knex('channels').insert({
			'name':'general',
			'type':'ooc',
		}));
};

exports.down = function(knex) {
	return knex.schema.dropTableIfExists('channels');
};
