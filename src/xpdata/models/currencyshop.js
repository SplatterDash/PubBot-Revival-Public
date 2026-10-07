module.exports = (sequelize, DataTypes) => {
	return sequelize.define(
		'currency_shop',
		{
			name: {
				type: DataTypes.STRING,
				unique: true,
			},
			description: DataTypes.STRING,
			category: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			cost: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
		},
		{
			timestamps: false,
		},
	);
};