const Sequelize = require('sequelize');

const sqlze = new Sequelize('database', 'username', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: `xpdata/database-${process.env.NODE_ENV}.sqlite`,
});

const Users = require('./models/users.js')(sqlze, Sequelize.DataTypes);
const CurrencyShop = require('./models/currencyshop.js')(sqlze, Sequelize.DataTypes);
const UserItems = require('./models/useritems.js')(sqlze, Sequelize.DataTypes);
const Infractions = require('./models/infractions.js')(sqlze, Sequelize.DataTypes);

UserItems.belongsTo(CurrencyShop, { foreignKey: 'item_id', as: 'item' });

Users.hasMany(Infractions);
Infractions.belongsTo(Users);

Reflect.defineProperty(Users.prototype, 'addItem', {
	value: async (item) => {
		const userItem = await UserItems.findOne({
			where: { user_id: this.user_id, item_id: item.id },
		});

		if (userItem) {
			userItem.amount += 1;
			return userItem.save();
		}

		return UserItems.create({ user_id: this.user_id, item_id: item.id, amount: 1 });
	},
});

Reflect.defineProperty(Users.prototype, 'getItems', {
	value: () => {
		return UserItems.findAll({
			where: { user_id: this.user_id },
			include: ['item'],
		});
	},
});

Reflect.defineProperty(Users.prototype, 'addInf', {
	value: (user, details) => {
		Infractions.create({
			user_id: user.user_id,
			guild_id: user.guild_id,
			inf_type: details.type ?? 'Warn',
			reason: details.reason ?? 'No reason given',
			enforcer_id: details.enforcer_id,
			duration: details.duration ?? 0,
			time: `${Date.now()}`,
		})
			.then((inf) => {
				return inf.save();
			})
			.catch(console.error);
	},
});

Reflect.defineProperty(Users.prototype, 'getInfs', {
	value: async (vals) => {
		return await Infractions.findAll({
			where: { user_id: vals.user_id, guild_id: vals.guild_id },
		});
	},
});

module.exports = { Users, CurrencyShop, UserItems, Infractions };