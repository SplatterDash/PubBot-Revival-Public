const { useQueue, QueueRepeatMode } = require('discord-player');
const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('loop')
		.setDescription('Toggles looping for the queue.')
		.addNumberOption((option) =>
			option
				.setName('mode')
				.setDescription('The desired loop mode.')
				.setRequired(true)
				.addChoices(
					{
						name: 'Off',
						value: QueueRepeatMode.OFF,
					},
					{
						name: 'Track',
						value: QueueRepeatMode.TRACK,
					},
					{
						name: 'Queue',
						value: QueueRepeatMode.QUEUE,
					},
					{
						name: 'Autoplay',
						value: QueueRepeatMode.AUTOPLAY,
					},
				),
		),

	music: true,
	async execute(interaction) {
		await interaction.deferReply();
		if (!interaction.member.voice.channel) return interaction.editReply({ content: 'You are not in a voice channel!', flags: MessageFlags.Ephemeral });

		const queue = useQueue();
		if (!queue) return interaction.editReply({ content: 'There is no active queue or song playing!', flags: MessageFlags.Ephemeral });

		const loopM = interaction.options.getNumber('mode');
		const optionsText = ['OFF', 'TRACK', 'QUEUE', 'AUTOPLAY'];

		queue.setRepeatMode(loopM);

		interaction.editReply(`The queue has been set to **${optionsText[loopM]}** looping.`);
	},
};