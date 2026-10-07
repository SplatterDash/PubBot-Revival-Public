const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { removeInfractions } = require('../../xpdata/infraction-methods');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('infractions-remove')
		.setDescription('Remove an infraction from a member in the server.')
		.addIntegerOption((option) => option.setName('id').setDescription('The ID of the infraction.').setRequired(true))
		.addStringOption((option) => option.setName('reason').setDescription('The reason for banning the user.').setMaxLength(255))
		.setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

	modChan: true,
	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 */
	async execute(interaction) {
		await interaction.deferReply();
		removeInfractions(interaction, interaction.options.getInteger('id'), interaction.options.getString('reason'));
	},
};