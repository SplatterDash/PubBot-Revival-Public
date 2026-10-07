const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { addInfraction } = require('../../xpdata/infraction-methods');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('kick')
		.setDescription('Kick a member from the server.')
		.addUserOption((option) => option.setName('user').setDescription('The user to kick.').setRequired(true))
		.addStringOption((option) => option.setName('reason').setDescription('The reason for kicking the user.'))
		.setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

	modChan: true,
	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 */
	async execute(interaction) {
		await interaction.deferReply();
		addInfraction(interaction, interaction.options.getMember('user', true), {
			type: 'Kick',
			reason: interaction.options.getString('reason'),
		}, () => interaction.guild.members.kick(user));
	},
};