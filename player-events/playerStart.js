const { GuildQueueEvent } = require('discord-player');
const { createUnifiedEmbed } = require('../utils/createUnifiedEmbed');

module.exports = {
	name: GuildQueueEvent.PlayerStart,
	events: true,
	async execute(queue, track) {
		const { channel } = queue.metadata;
		const embed = createUnifiedEmbed(queue.guild, {
			color: 'Fuchsia',
			title: 'Now Playing',
			desc: track.author + ' - *' + track.title + '*',
		});
		channel.send({ embeds: [embed] });
	},
};