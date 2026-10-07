const { SlashCommandBuilder } = require('discord.js');
const { SPLATTER_ID } = process.env;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('whitelist-override')
		.setDescription('Looking to whitelist your NG account? Loads a popup to put your information in.')
		.setDefaultMemberPermissions(0),

	execute(interaction) {
		if (interaction.user.id != SPLATTER_ID) {
			return interaction.reply('This command can only be run by Splatter!');
		}
		const { client } = interaction;
		client.whitelistOverride = !client.whitelistOverride;
		interaction.reply(`The whitelist override feature is now turned ${client.whitelistOverride ? 'ON' : 'OFF'}.`);
	},
};