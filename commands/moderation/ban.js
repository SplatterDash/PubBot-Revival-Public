const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { addInfraction } = require('../../xpdata/infraction-methods');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ban')
		.setDescription('Ban a member from the server.')
		.addUserOption((option) => option.setName('user').setDescription('The user to ban.').setRequired(true))
		.addStringOption((option) => option.setName('reason').setDescription('The reason for banning the user.').setMaxLength(255))
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
		}, () => interaction.guild.members.ban(interaction.options.getMember('user', true), { reason: interaction.options.getString('reason') ?? 'No reason given.' }));
	},
};