const { useMainPlayer } = require('discord-player');
const { SlashCommandBuilder, PermissionsBitField, MessageFlags } = require('discord.js');
const { createUnifiedEmbed } = require('../../utils/createUnifiedEmbed');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Plays music.')
		.addStringOption((option) => option.setName('song').setDescription('Song to play.').setRequired(true)),

	music: true,
	async execute(interaction) {
		await interaction.deferReply();
		const player = useMainPlayer();
		const query = interaction.options.getString('song', true);

		const voiceChannel = interaction.member.voice.channel;

		// Check if the user is in a voice channel
		if (!voiceChannel) {
			return interaction.editReply({ content: 'You need to be in a voice channel to play music!', flags: MessageFlags.Ephemeral });
		}

		// Check if the bot is already playing in a different voice channel
		if (interaction.guild.members.me.voice.channel && interaction.guild.members.me.voice.channel !== voiceChannel) {
			return interaction.editReply({ content: 'I am already playing in a different voice channel!', flags: MessageFlags.Ephemeral });
		}

		// Check if the bot has permission to join the voice channel
		if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.Connect)) {
			return interaction.editReply({ content: 'I do not have permission to join your voice channel!', flags: MessageFlags.Ephemeral });
		}

		// Check if the bot has permission to speak in the voice channel
		if (!interaction.guild.members.me.permissionsIn(voiceChannel).has(PermissionsBitField.Flags.Speak)) {
			return interaction.editReply({ content: 'I do not have permission to speak in your voice channel!', flags: MessageFlags.Ephemeral });
		}

		const search = await player.search(query, {
			requestedBy: interaction.user,
		});

		if (!search.hasTracks()) return interaction.editReply({ content: 'No results were found for your song input!', flags: MessageFlags.Ephemeral });

		try {
			// Play the song in the voice channel
			const result = await player.play(voiceChannel, query, {
				nodeOptions: {
					metadata: { channel: interaction.channel, guild: interaction.guild },
					volume: 100,
					leaveOnStop: false,
					leaveOnEmpty: true,
					leaveOnEmptyCooldown: 60000,
					leaveOnEnd: true,
					leaveOnEndCooldown: 60000,
					pauseOnEmpty: true,
					preferBridgedMetadata: true,
					disableBiquad: true,
				},
				requestedBy: interaction.user,
			});

			const embed = createUnifiedEmbed(interaction.guild, {
				color: 'Fuchsia',
				title: 'Added to queue!',
				desc: result.track.author + ' - ' + result.track.title,
				noTimestamp: true,
			});

			// Reply to the user that the song has been added to the queue
			return interaction.editReply({ embeds: [embed] });
		}
		catch (error) {
			// Handle any errors that occur
			console.error(error);
			return interaction.editReply({ content: 'An error occurred while playing the song!', flags: MessageFlags.Ephemeral });
		}
	},
};