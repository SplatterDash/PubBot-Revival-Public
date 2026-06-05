const { useQueue } = require('discord-player');
const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { createMusicPoll } = require('../../utils/createMusicPoll');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('skip')
		.setDescription('Skips the current song.'),

	music: true,
	async execute(interaction) {
		await interaction.deferReply();
		if (!interaction.member.voice.channel) return interaction.editReply({ content: 'You are not in a voice channel!', flags: MessageFlags.Ephemeral });

		const queue = useQueue();
		if (!queue) return interaction.editReply({ content: 'There is a queue or song actively playing!', flags: MessageFlags.Ephemeral });

		createMusicPoll(interaction, {
			trk: queue.currentTrack,
		}, () => {
			queue.node.skip();
		});
	},
};