const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { addInfraction } = require('../../xpdata/infraction-methods');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('mute')
		.setDescription('Server mute a member in the server.')
		.addUserOption((option) => option.setName('user').setDescription('The user to mute.').setRequired(true))
		.addStringOption((option) => option.setName('reason').setDescription('The reason for muting the user.'))
		.setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers),

	modChan: true,
	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 */
	async execute(interaction) {
		await interaction.deferReply();
		addInfraction(interaction, interaction.options.getMember('user', true), {
			type: 'Mute',
			reason: interaction.options.getString('reason'),
		}, () => {
			interaction.options.getMember('user', true).voice.serverMute = true;
		});
	},
};