const { useQueue } = require('discord-player');
const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { createUnifiedEmbed } = require('../../utils/createUnifiedEmbed');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('queue')
		.setDescription('Displays the current queue.'),

	music: true,
	async execute(interaction) {
		await interaction.deferReply();

		const queue = useQueue();
		if (!queue) return interaction.editReply({ content: 'There is no active queue or song playing!', flags: MessageFlags.Ephemeral });

		const curPlay = queue.currentTrack;

		const upcomingTracks = queue.tracks.map((track, index) => `Position ${index + 1}--${track.author} - "${track.title}"`);

		const embed = createUnifiedEmbed(queue.guild, {
			color: 'Fuchsia',
			title: 'Current Queue',
			desc: `*Now Playing* - "${curPlay.title}" (${curPlay.author})`,
			noTimestamp: true,
		});

		const thisPage = upcomingTracks.slice(0, 5);
		thisPage.forEach((text) => {
			const daThing = text.split('--');
			embed.addFields(
				{ name: '\u200b', value: '\u200b' },
				{ name: daThing[0], value: daThing[1] });
		});
		interaction.editReply({ embeds: [embed] });
	},
};