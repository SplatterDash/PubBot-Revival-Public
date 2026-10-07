const { useTimeline, useQueue } = require('discord-player');
const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { createUnifiedEmbed } = require('../../utils/createUnifiedEmbed');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pause')
		.setDescription('Pauses or unpauses the currently playing song.'),

	music: true,
	async execute(interaction) {
		await interaction.deferReply();
		if (!interaction.member.voice.channel) return interaction.editReply({ content: 'You are not in a voice channel!', flags: MessageFlags.Ephemeral });

		const tl = useTimeline();
		if (!tl) return interaction.editReply({ content: 'There is no active queue or song playing!', flags: MessageFlags.Ephemeral });

		const curTrack = useQueue().currentTrack;

		const { paused } = tl;

		paused ? tl.resume() : tl.pause();

		const embed = createUnifiedEmbed(useQueue().guild, {
			color: 'Fuchsia',
			title: paused ? 'Resumed' : 'Paused',
			desc: curTrack.author + ' - "' + curTrack.title + '"',
			noTimestamp: true,
		});
		interaction.editReply({ embeds: [embed] });
	},
};