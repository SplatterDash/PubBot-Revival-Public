const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { addInfraction } = require('../../xpdata/infraction-methods');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('warn')
		.setDescription('Warn a member in the server.')
		.addUserOption((option) => option.setName('user').setDescription('The user to warn.').setRequired(true))
		.addStringOption((option) => option.setName('reason').setDescription('The reason for warning the user.'))
		.setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

	modChan: true,
	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 */
	async execute(interaction) {
		await interaction.deferReply();
		addInfraction(interaction, interaction.options.getMember('user', true), {
			reason: interaction.options.getString('reason'),
		});
	},
};