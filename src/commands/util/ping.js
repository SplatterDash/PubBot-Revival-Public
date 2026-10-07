const { SlashCommandBuilder } = require('discord.js');
const { createUnifiedEmbed } = require('../../utils/createUnifiedEmbed');

module.exports = {
	data: new SlashCommandBuilder().setName('ping').setDescription('Calculates bot ping.'),

	async execute(interaction) {
		const embed = createUnifiedEmbed(interaction.guild, {
			title: 'Pinging...',
			color: 'DarkGold',
			noTimestamp: true,
		});
		const sent = await interaction.reply({ embeds: [embed], withResponse: true });
		const newEmbed = createUnifiedEmbed(interaction.guild, {
			from: embed,
			title: 'Ping, calculated ' + global.randomMessageItems.pings[Math.round(Math.random() * (global.randomMessageItems.pings.length - 1))].replace('%a', '\''),
			fields: [
				{ name: 'Roundtrip Latency', value: `${sent.resource.message.createdTimestamp - interaction.createdTimestamp} ms`, inline: true },
				{ name: 'Websocket Heartbeat', value: `${interaction.client.ws.ping} ms`, inline: true },
			],
		});
		interaction.editReply({ embeds: [newEmbed] });
	},
};