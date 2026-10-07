const { useQueue } = require('discord-player');
const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { createMusicPoll } = require('../../utils/createMusicPoll');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('removesong')
		.setDescription('Removes a song from the queue.')
		.addIntegerOption((option) => option.setName('position').setDescription('Position of the song you want to remove (use `/queue` if needed!)')),

	music: true,
	async execute(interaction) {
		await interaction.deferReply();
		if (!interaction.member.voice.channel) return interaction.editReply({ content: 'You are not in a voice channel!', flags: MessageFlags.Ephemeral });

		const queue = useQueue();
		if (!queue) return interaction.editReply({ content: 'There is a queue or song actively playing!', flags: MessageFlags.Ephemeral });

		const pos = interaction.options.getInteger('position') ?? 1;
		if (queue.size <= pos - 1) return interaction.editReply({ content: 'There is no song in that position!', flags: MessageFlags.Ephemeral });

		createMusicPoll(interaction, {
			action: 'Remove',
			trk: queue.tracks[pos - 1],
		}, () => {
			queue.removeTrack(pos - 1);
		});
	},
};