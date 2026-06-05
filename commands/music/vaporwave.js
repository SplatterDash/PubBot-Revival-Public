const { useQueue } = require('discord-player');
const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('vaporwave')
		.setDescription('Adds a vaporwave filter to the currently playing track.'),

	music: true,
	async execute(interaction) {
		await interaction.deferReply();
		if (!interaction.member.voice.channel) return interaction.editReply({ content: 'You are not in a voice channel!', flags: MessageFlags.Ephemeral });

		const queue = useQueue();
		if (!queue) return interaction.editReply({ content: 'There is no active queue or song playing!', flags: MessageFlags.Ephemeral });

		queue.filters.ffmpeg.toggle(['vaporwave']);

		interaction.editReply(queue.filters.ffmpeg.isEnabled('vaporwave') ? '*vaporwave time baybee*' : 'Your music is no longer vaporwaved.');
	},
};