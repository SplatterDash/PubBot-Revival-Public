const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('forcexpmult')
		.setDescription('Force the XP multiplier to a number for an hour.')
		.addIntegerOption((option) => option.setName('multiplier').setDescription('XP Multiplier to be applied.').setRequired(true))
		.setDefaultMemberPermissions(0),

	modChan: true,
	execute(interaction) {
		const { client, options } = interaction;
		const numb = options.getInteger('multiplier');
		interaction.reply(`Setting the multiplier to **${numb}** for an hour!`);
		client.clearDaTimer();
		client.xpMult = numb;
		setTimeout(() => {
			client.xpMult = 1;
			client.setDaTimer();
		}, 3600_000);
	},
};