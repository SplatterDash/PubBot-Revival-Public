const { GuildQueueEvent } = require('discord-player');
const { createUnifiedEmbed } = require('../utils/createUnifiedEmbed');

module.exports = {
	name: GuildQueueEvent.EmptyChannel,
	events: true,
	async execute(queue) {
		const { channel } = queue.metadata;
		const embed = createUnifiedEmbed(queue.guild, {
			color: 'Fuchsia',
			title: 'Empty Channel',
			desc: 'I can\'t handle being alone!\nDisconnecting automatically. Thank you for the good times while they lasted!',
		});
		channel.send({ embeds: [embed] });
	},
};