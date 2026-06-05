const { useMainPlayer } = require('discord-player');
const { SlashCommandBuilder, PermissionsBitField, MessageFlags, TextDisplayBuilder, SectionBuilder, ButtonStyle, SeparatorBuilder, SeparatorSpacingSize, ComponentType } = require('discord.js');
const { createUnifiedEmbed } = require('../../utils/createUnifiedEmbed');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('search')
		.setDescription('Searches for music and gives you the option to play a song.')
		.addStringOption((option) => option.setName('song').setDescription('Search term.').setRequired(true)),

	music: true,
	async execute(interaction) {
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });
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

		const resultMap = search.tracks.map((track, index) => `Result ${index + 1}--**${track.author}** - "${track.toHyperlink()}"`);

		const orgArray = [new TextDisplayBuilder().setContent(`**Top 5 Search Results for Query __${query}__**`)];
		const display = resultMap.slice(0, 5);
		for (disp of display) {
			const split = disp.split('--');
			orgArray.push(new SectionBuilder()
				.setButtonAccessory((button) => button.setCustomId('button-search-' + split[0].substr(7)).setLabel(split[0]).setStyle(ButtonStyle.Primary))
				.addTextDisplayComponents((textDisplay) => textDisplay.setContent(split[1])));
			orgArray.push(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));
		}
		orgArray.push(new TextDisplayBuilder().setContent('*Press any button to add the song to the queue! These results will be active for* ***three minutes***.'));

		await interaction.editReply({
			components: orgArray,
			flags: MessageFlags.IsComponentsV2,
		})
			.then((response) => {
				const collectFilter = (i) => {
					return i.user.id === interaction.user.id;
				};

				response.awaitMessageComponent({ filter: collectFilter, componentType: ComponentType.Button, time: 180_000, errors: ['time'] })
					.then(async (newInt) => {
						await newInt.update({
							components: [new TextDisplayBuilder().setContent('Adding choice to queue...')],
						});
						const { customId } = newInt;
						const daEntry = Number(customId.substr(14));
						const songToAdd = search.tracks[daEntry - 1];

						try {
							// Play the song in the voice channel
							const result = await player.play(voiceChannel, songToAdd, {
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
							return newInt.followUp({ embeds: [embed], flags: MessageFlags.Ephemeral });
						}
						catch (error) {
							// Handle any errors that occur
							console.error(error);
							return interaction.editReply({ components: [new TextDisplayBuilder().setContent('An error occurred while playing the song!')] });
						}
					})
					.catch((err) => {
						console.error(err);
						return interaction.editReply({ components: [new TextDisplayBuilder().setContent('This search query has timed out.')] });
					});
			});
	},
};