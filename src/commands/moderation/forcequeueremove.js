const { useQueue } = require('discord-player');
const { SlashCommandBuilder, MessageFlags, PermissionFlagsBits } = require('discord.js');
const { createUnifiedEmbed } = require('../../utils/createUnifiedEmbed');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('forcequeueremove')
		.setDescription('Forces the media player to remove a song in the queue.')
		.addIntegerOption((option) => option.setName('position').setDescription('The song to remove\'s position in queue. Default is 0.'))
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

	music: true,
	async execute(interaction) {
		await interaction.deferReply();
		if (!interaction.member.voice.channel) return interaction.editReply({ content: 'You are not in a voice channel!', flags: MessageFlags.Ephemeral });

		const queue = useQueue();
		if (!queue) return interaction.editReply({ content: 'There is no active queue or song playing!', flags: MessageFlags.Ephemeral });

		const pos = interaction.options.getInteger('position') ?? 1;

		queue.removeTrack(pos - 1);

		const embed = createUnifiedEmbed(queue.guild, {
			color: 'Fuchsia',
			title: 'Removing Track...',
			desc: `A moderator has decided to remove the track in position ${pos} by force.`,
			noTimestamp: true,
		});
		interaction.editReply({ embeds: [embed] });
	},
};