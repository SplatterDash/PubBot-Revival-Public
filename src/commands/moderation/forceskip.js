const { useQueue } = require('discord-player');
const { SlashCommandBuilder, MessageFlags, PermissionFlagsBits } = require('discord.js');
const { createUnifiedEmbed } = require('../../utils/createUnifiedEmbed');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('forceskip')
		.setDescription('Forces the media player to skip the current song.')
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

	music: true,
	async execute(interaction) {
		await interaction.deferReply();
		if (!interaction.member.voice.channel) return interaction.editReply({ content: 'You are not in a voice channel!', flags: MessageFlags.Ephemeral });

		const queue = useQueue();
		if (!queue) return interaction.editReply({ content: 'There is no active queue or song playing!', flags: MessageFlags.Ephemeral });

		if (!queue.isPlaying) return interaction.editReply({ content: 'There is no song currently playing!', flags: MessageFlags.Ephemeral });

		queue.node.skip();

		const embed = createUnifiedEmbed(queue.guild, {
			color: 'Fuchsia',
			title: 'Skipping...',
			desc: 'A moderator has decided to skip this track by force.',
			noTimestamp: true,
		});
		interaction.editReply({ embeds: [embed] });
	},
};