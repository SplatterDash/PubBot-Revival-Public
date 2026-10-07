const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { addInfraction } = require('../../xpdata/infraction-methods');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ban')
		.setDescription('Ban a member from the server.')
		.addUserOption((option) => option.setName('user').setDescription('The user to ban.').setRequired(true))
		.addStringOption((option) => option.setName('reason').setDescription('The reason for banning the user.').setMaxLength(255))
		.addIntegerOption((option) => option.setName('clean').setDescription('If removing the user\'s messages, how far back in time to go.').setChoices({
			name: '1 Minute',
			value: 60,
		}, {
			name: '10 Minutes',
			value: 600,
		}, {
			name: '30 Minutes',
			value: 1800,
		}, {
			name: '1 Hour',
			value: 3600,
		}, {
			name: '12 Hours',
			value: 43200,
		}, {
			name: '24 Hours',
			value: 86400,
		}, {
			name: '72 Hours (3 Days)',
			value: 259200,
		}, {
			name: '168 Hours (7 Days)',
			value: 604800,
		}))
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

	modChan: true,
	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 */
	async execute(interaction) {
		await interaction.deferReply();
		addInfraction(interaction, interaction.options.getMember('user', true), {
			type: 'Ban',
			reason: interaction.options.getString('reason'),
		}, () => interaction.guild.members.ban(interaction.options.getMember('user', true), { reason: interaction.options.getString('reason') ?? 'No reason given.', deleteMessageSeconds: interaction.options.getInteger('clean') ?? 0 }));
	},
};