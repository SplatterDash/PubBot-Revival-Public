const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { addInfraction } = require('../../xpdata/infraction-methods');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('timeout')
		.setDescription('Timeout a member in the server.')
		.addUserOption((option) => option.setName('user').setDescription('The user to timeout.').setRequired(true))
		.addIntegerOption((option) => option.setName('length').setDescription('Length of timeout in seconds.').setRequired(true))
		.addStringOption((option) => option.setName('reason').setDescription('The reason for timing out the user.'))
		.setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

	modChan: true,
	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 */
	async execute(interaction) {
		await interaction.deferReply();
		const { options } = interaction;
		addInfraction(interaction, options.getMember('user', true), {
			type: 'Timeout',
			reason: options.getString('reason'),
		}, () => {
			options.getMember('user', true).timeout(options.getInteger('length', true) * 1000);
		});
	},
};