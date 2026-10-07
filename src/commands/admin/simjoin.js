const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('simjoin')
		.setDescription('Simulates a member joining the server.')
		.setDefaultMemberPermissions(0),

	hadoOnly: true,
	execute(interaction) {
		interaction.client.emit('guildMemberAdd', interaction.member);
		return interaction.reply({ content: 'Success.', flags: MessageFlags.Ephemeral });
	},
};