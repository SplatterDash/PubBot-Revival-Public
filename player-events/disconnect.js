const { GuildQueueEvent } = require('discord-player');
const { createUnifiedEmbed } = require('../utils/createUnifiedEmbed');

module.exports = {
	name: GuildQueueEvent.Disconnect,
	events: true,
	async execute(queue) {
		const { channel } = queue.metadata;
		const embed = createUnifiedEmbed(queue.guild, {
			color: 'Fuchsia',
			title: 'I have now disconnected.',
			desc: 'Thank you for using PubBot\'s Jukebox services. Come again soon!',
		});
		channel.send({ embeds: [embed] });
	},
};