/**
 * @param {import('sequelize').Sequelize} sequelize
 * @param {import('sequelize').DataTypes} DataTypes
 * @returns
 */
module.exports = (sequelize, DataTypes) => {
	return sequelize.define(
		'user_item',
		{
			user_id: DataTypes.STRING,
			item_id: DataTypes.INTEGER,
			amount: {
				type: DataTypes.INTEGER,
				default: 0,
				allowNull: false,
			},
		},
		{
			timestamps: false,
		},
	);
};