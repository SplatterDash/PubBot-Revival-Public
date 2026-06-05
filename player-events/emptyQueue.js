const { GuildQueueEvent } = require('discord-player');
const { createUnifiedEmbed } = require('../utils/createUnifiedEmbed');

module.exports = {
	name: GuildQueueEvent.EmptyQueue,
	events: true,
	async execute(queue) {
		const { channel } = queue.metadata;
		const embed = createUnifiedEmbed(queue.guild, {
			color: 'Fuchsia',
			title: 'Empty Queue',
			desc: 'If I don\'t hear from anyone in 60 seconds, I\'ll disconnect automatically.',
		});
		channel.send({ embeds: [embed] });
	},
};