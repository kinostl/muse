exports.up = function(knex) {
	return knex.schema
		.createTable('channels', function (table) {
			table.increments('id');
			table.string('name', 255).notNullable();
			table.string('type', 255).notNullable();
		}).then(()=>knex('channels').insert({
			'name':'general',
			'type':'ooc',
		}));
};

exports.down = function(knex) {
	return knex.schema.dropTableIfExists('channels');
};
