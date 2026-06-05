const { useQueue } = require('discord-player');
const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('deepfry')
		.setDescription('deep fried music'),

	music: true,
	async execute(interaction) {
		await interaction.deferReply();
		if (!interaction.member.voice.channel) return interaction.editReply({ content: 'You are not in a voice channel!', flags: MessageFlags.Ephemeral });

		const queue = useQueue();
		if (!queue) return interaction.editReply({ content: 'There is no active queue or song playing!', flags: MessageFlags.Ephemeral });

		queue.filters.ffmpeg.toggle(['bassboost', 'earrape']);

		interaction.editReply(queue.filters.ffmpeg.isEnabled('bassboost') ? 'hehehe music go brrrr' : 'Your music is no longer deepfried.');
	},
};