/**
 * @param {import('sequelize').Sequelize} sequelize
 * @param {import('sequelize').DataTypes} DataTypes
 * @returns
 */
module.exports = (sequelize, DataTypes) => {
	return sequelize.define(
		'users',
		{
			user_id: {
				type: DataTypes.STRING,
				primaryKey: true,
			},
			guild_id: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			level: {
				type: DataTypes.INTEGER,
				defaultValue: 0,
				allowNull: false,
			},
			xp: {
				type: DataTypes.INTEGER,
				defaultValue: 0,
				allowNull: false,
			},
			balance: {
				type: DataTypes.INTEGER,
				defaultValue: 0,
				allowNull: false,
			},
		},
		{
			timestamps: false,
		},
	);
};