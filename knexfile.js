// Update with your config settings.

module.exports = {

	testing: {
		client: 'sqlite3',
		connection: {
			filename: ':memory:'
		},
		useNullAsDefault: true,
	},

	development: {
		client: 'sqlite3',
		connection: {
			filename: './dev.sqlite3'
		},
		useNullAsDefault: true,
	},

	production: {
		client: 'postgresql',
		connection: {
			database: 'my_db',
			user:     'username',
			password: 'password'
		},
		pool: {
			min: 2,
			max: 10
		},
		migrations: {
			tableName: 'knex_migrations'
		},
	}

};
