const { useQueue, QueueRepeatMode } = require('discord-player');
const { SlashCommandBuilder, MessageFlags, PermissionFlagsBits } = require('discord.js');
const { createUnifiedEmbed } = require('../../utils/createUnifiedEmbed');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('forcestop')
		.setDescription('Stops the queue by force.')
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

	music: true,
	async execute(interaction) {
		await interaction.deferReply();
		if (!interaction.member.voice.channel) return interaction.editReply({ content: 'You are not in a voice channel!', flags: MessageFlags.Ephemeral });

		const queue = useQueue();
		if (!queue) return interaction.editReply({ content: 'There is a queue or song actively playing!', flags: MessageFlags.Ephemeral });

		const getRepeat = queue.repeatMode;
		queue.setRepeatMode(QueueRepeatMode.OFF);
		queue.clear();
		queue.node.stop();
		queue.setRepeatMode(getRepeat);

		const embed = createUnifiedEmbed(queue.guild, {
			color: 'Fuchsia',
			title: 'Stopping...',
			desc: 'A moderator has decided to stop the current queue by force.',
			noTimestamp: true,
		});
		interaction.editReply({ embeds: [embed] });
	},
};