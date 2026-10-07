const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('modifybal')
		.setDescription('Used to add, remove, or set a user\'s currenct. Will not affect XP or levels.')
		.setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
		.addUserOption((option) => option.setName('user').setDescription('User that you want to give to.').setRequired(true))
		.addIntegerOption((option) => option.setName('amount').setDescription('How much currency to give.').setRequired(true))
		.addBooleanOption((option) => option.setName('set').setDescription('Whether or not you want to set the currency (FALSE by default).')),

	bypassChannelWhitelist: true,
	async execute(interaction) {
		const { options, client } = interaction;
		await interaction.reply(`User ${options.getMember('user').displayName} has been given **${options.getInteger('amount')}** currency.`);
		await client.addCur(options.getMember('user'), options.getInteger('amount'), options.getBoolean('set'));
	},
};