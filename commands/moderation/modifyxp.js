const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('modifyxp')
		.setDescription('Used to add, remove, or set a user\'s level or XP. Will also affect currency.')
		.setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
		.addUserOption((option) => option.setName('user').setDescription('User that you want to give to.').setRequired(true))
		.addIntegerOption((option) => option.setName('xp').setDescription('How much XP to give.'))
		.addIntegerOption((option) => option.setName('levels').setDescription('How many levels to give.'))
		.addBooleanOption((option) => option.setName('set').setDescription('Whether or not you want to set the level (default is false).'))
		.addBooleanOption((option) => option.setName('currency').setDescription('Whether or not you also want to change the member\'s currency by XP (default is false).')),

	bypassChannelWhitelist: true,
	async execute(interaction) {
		const { options, client } = interaction;
		if (options.getBoolean('set') && !options.getInteger('levels')) return interaction.reply('Cannot set levels without a level input.');
		await interaction.reply(`User ${options.getMember('user').displayName} has been given **${options.getInteger('xp') ?? 0}** XP and ${options.getBoolean('set') ? `set to level **${options.getInteger('levels')}**` : `**${options.getInteger('levels') ?? 0}** levels`}.`);
		await client.addXp(options.getMember('user'), options.getInteger('xp'), options.getInteger('levels'), options.getBoolean('set'), options.getBoolean('currency'));
	},
};