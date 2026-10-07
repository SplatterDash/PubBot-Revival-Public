const Sequelize = require('sequelize');
const { changeConsole } = require('./utils/custom-console.js');

changeConsole();

const sqlze = new Sequelize('database', 'username', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: `src/xpdata/database-${process.env.NODE_ENV}.sqlite`,
});

const users = require('./xpdata/models/users.js')(sqlze, Sequelize.DataTypes);
// const CurrencyShop =
require('./xpdata/models/currencyshop.js')(sqlze, Sequelize.DataTypes);
require('./xpdata/models/useritems.js')(sqlze, Sequelize.DataTypes);
const infs = require('./xpdata/models/infractions.js')(sqlze, Sequelize.DataTypes);

users.hasMany(infs);
infs.belongsTo(users);

const force = process.argv.includes('--force') || process.argv.includes('-f');

sqlze
	.sync({ force })
	.then(async () => {
		/** const shop = [
            CurrencyShop.upsert({ name: 'Test', description: 'Test', cost: 5 }),
        ];

        await Promise.all(shop);**/
		console.log('Database synced successfully.');

		sqlze.close();
	})
	.catch(console.error);

