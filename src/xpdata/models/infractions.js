/**
 * @param {import('sequelize').Sequelize} sequelize
 * @param {import('sequelize').DataTypes} DataTypes
 * @returns
 */
module.exports = (sequelize, DataTypes) => {
	return sequelize.define(
		'infractions',
		{
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			user_id: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			guild_id: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			inf_type: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			reason: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			enforcer_id: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			duration: {
				type: DataTypes.INTEGER,
				allowNull: false,
				defaultValue: 0,
			},
			time: {
				type: DataTypes.STRING,
				allowNull: false,
			},
		},
		{
			timestamps: false,
		},
	);
};