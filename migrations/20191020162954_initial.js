exports.up = function(knex) {
	return knex.schema
		.createTable('channels', function (table) {
			table.increments('id');
			table.string('name', 255).notNullable();
			table.string('type', 255).notNullable();
		})

};

exports.down = function(knex) {
	return knex.schema.dropTableIfExists('channels');
};
