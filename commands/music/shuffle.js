const { useQueue } = require('discord-player');
const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('shuffle')
		.setDescription('Shuffles the current queue.'),

	music: true,
	async execute(interaction) {
		await interaction.deferReply();
		if (!interaction.member.voice.channel) return interaction.editReply({ content: 'You are not in a voice channel!', flags: MessageFlags.Ephemeral });

		const queue = useQueue();
		if (!queue) return interaction.editReply({ content: 'There is no active queue or song playing!', flags: MessageFlags.Ephemeral });

		if (queue.tracks.size < 2) return interaction.editReply({ content: 'There is not enough songs to make a shuffled queue!', flags: MessageFlags.Ephemeral });

		queue.tracks.shuffle();

		interaction.editReply('The queue has been shuffled. Use `/queue` to see the current queue order.');
	},
};