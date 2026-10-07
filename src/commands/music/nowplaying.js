const { useQueue } = require('discord-player');
const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { createUnifiedEmbed } = require('../../utils/createUnifiedEmbed');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('nowplaying')
		.setDescription('Shows the currently playing song.'),

	music: true,
	async execute(interaction) {
		await interaction.deferReply();
		if (!interaction.member.voice.channel) return interaction.editReply({ content: 'You are not in a voice channel!', flags: MessageFlags.Ephemeral });

		const queue = useQueue();
		if (!queue) return interaction.editReply({ content: 'There is no active queue or song playing!', flags: MessageFlags.Ephemeral });

		const curTrack = queue.currentTrack;
		if (!curTrack) return interaction.editReply({ content: 'There is no song currently playing!', flags: MessageFlags.Ephemeral });

		const embed = createUnifiedEmbed(queue.guild, {
			color: 'Fuchsia',
			title: 'Now Playing',
			desc: curTrack.author + ' - *' + curTrack.title + '*',
			noTimestamp: true,
		});
		interaction.editReply({ embeds: [embed] });
	},
};