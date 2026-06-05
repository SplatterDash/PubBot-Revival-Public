const { useQueue } = require('discord-player');
const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('disconnect')
		.setDescription('Disconnects the bot from a VC if it isn\'t playing music.'),

	music: true,
	async execute(interaction) {
		await interaction.deferReply();
		if (!interaction.member.voice.channel) return interaction.editReply({ content: 'You are not in a voice channel!', flags: MessageFlags.Ephemeral });

		const queue = useQueue();
		if (queue.tracks.size > 0) return interaction.editReply({ content: 'There is a queue or song actively playing!', flags: MessageFlags.Ephemeral });

		const { voice } = interaction.guild.members.me;
		if (!voice.channel) return interaction.editReply({ content: 'I am not currently in a voice channel!', flags: MessageFlags.Ephemeral });

		voice.disconnect();
		interaction.editReply({ content: 'Disconnected.', flags: MessageFlags.Ephemeral });
	},
};