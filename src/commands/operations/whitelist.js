const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder, ModalBuilder, TextDisplayBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, MessageFlags, ButtonBuilder, ButtonStyle, ActionRowBuilder, LabelBuilder, hyperlink } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('whitelist')
		.setDescription('Looking to whitelist your NG account? Loads a popup to put your information in.'),

	cooldown: 60,
	async execute(interaction) {
		const topTitle = new TextDisplayBuilder().setContent(
			'# PLEASE READ BEFORE FILLING OUT THIS FORM\nIn order for your profile to be considered for whitelisting, **ALL OF THE FOLLOWING MUST BE TRUE**:\n- You must have **at least three pieces of music** available on your profile.\n- One of your pieces **must be AT LEAST one week old.**\n- You must be scouted for the Newgrounds Audio Portal and following the [Newgrounds Audio Portal rules](https://www.newgrounds.com/wiki/help-information/terms-of-use/audio-guidelines).\nYour whitelist request will be automatically denied if your account does not follow the above guidelines!\n\nPlease also remember:\n- **BE PATIENT WITH YOUR REQUEST!** Hado is a real person with a life to live like you, so it may take some time for you to hear back on your request. You will be notified via DM by PubBot (as long as your DMs are open) when the request has been approved or denied.\n- This server isn\'t just for whitelisting - it is a general server that you must follow the rules to. **If you\'re banned from this server, your whitelist request will be automatically denied.**\n- **DO NOT SPAM THE WHITELIST REQUESTS.** You should receive a confirmation reply when your request is submitted. Spamming doesn\'t make the process go any faster - it only clogs the system and makes Hado want to deny your request.',
		);

		const linkBox = new TextInputBuilder()
			.setCustomId('linkInput')
			.setStyle(TextInputStyle.Short)
			.setPlaceholder('[username].newgrounds.com/')
			.setMinLength(15)
			.setRequired(true);

		const linkLabel = new LabelBuilder()
			.setLabel('Please link your Newgrounds account below.')
			.setTextInputComponent(linkBox);

		const dawList = new StringSelectMenuBuilder()
			.setCustomId('dawSelect')
			.setPlaceholder('Select one...')
			.setRequired(true)
			.addOptions(
				new StringSelectMenuOptionBuilder()
					.setLabel('Ableton Live')
					.setValue('Ableton'),
				new StringSelectMenuOptionBuilder()
					.setLabel('Audacity')
					.setValue('Audacity'),
				new StringSelectMenuOptionBuilder()
					.setLabel('Auxy')
					.setValue('Auxy'),
				new StringSelectMenuOptionBuilder()
					.setLabel('BandLab (Cakewalk, NOT Mobile)')
					.setValue('BandLabCakewalk'),
				new StringSelectMenuOptionBuilder()
					.setLabel('Bitwig')
					.setValue('Bitwig'),
				new StringSelectMenuOptionBuilder()
					.setLabel('Beepbox/Ultrabox')
					.setValue('BeepboxUltrabox'),
				new StringSelectMenuOptionBuilder()
					.setLabel('FL Studio')
					.setValue('FLStudio'),
				new StringSelectMenuOptionBuilder()
					.setLabel('Flat.io')
					.setValue('FlatIo'),
				new StringSelectMenuOptionBuilder()
					.setLabel('GarageBand')
					.setValue('GarageBand'),
				new StringSelectMenuOptionBuilder()
					.setLabel('LMMS')
					.setValue('LMMS'),
				new StringSelectMenuOptionBuilder()
					.setLabel('Logic Pro')
					.setValue('LogicPro'),
			);

		const dawText = new LabelBuilder()
			.setLabel('Primary DAW')
			.setDescription('NOTE: If your DAW does not show up in this list, please reach out to Hado or SplatterDash.')
			.setStringSelectMenuComponent(dawList);

		const addlBox = new TextInputBuilder()
			.setCustomId('addlNotes')
			.setStyle(TextInputStyle.Paragraph)
			.setPlaceholder('Talk about your thought process, inspirations, or anything else music-specific.');

		const addlLabel = new LabelBuilder()
			.setLabel('Anything else you wanna say about your music?')
			.setDescription('This shows us that you\'re the creator of the songs on your profile.')
			.setTextInputComponent(addlBox);

		const modal = new ModalBuilder().setCustomId('whitelistModal').setTitle('Ye Olde Hado\'s Whitelisting Form')
			.addTextDisplayComponents(topTitle)
			.addLabelComponents(linkLabel, dawText, addlLabel);

		await interaction.showModal(modal);

		const collectorFilter = (i) => {
			return i.user.id === interaction.user.id && i.customId === 'whitelistModal';
		};

		interaction
			.awaitModalSubmit({ time: 300_000, filter: collectorFilter })
			.then(async (newInt) => {
				await newInt.reply({ content: 'Thanks for submitting your whitelist request! Hado will review it, and you will be notified via DM about the final results. PLEASE DO NOT SUBMIT ANOTHER REQUEST.', flags: MessageFlags.Ephemeral });
				const whitelistChannel = newInt.guild.channels.cache.get(process.env.WHITELIST_ID);
				const daLink = newInt.fields.getTextInputValue('linkInput');

				const whitelistEmbed = new EmbedBuilder()
					.setColor('#e27c00')
					.setTitle('Whitelist Request: ' + (newInt.member.nickname ?? newInt.member.user.displayName))
					.setThumbnail(newInt.member.user.avatarURL())
					.addFields(
						{ name: 'Newgrounds Link:', value: hyperlink('Newgrounds link', daLink.startsWith('http') ? daLink : 'https://' + daLink), inline: true },
						{ name: 'DAW:', value: newInt.fields.getStringSelectValues('dawSelect')[0], inline: true },
					)
					.addFields({ name: 'Additional Notes:', value: newInt.fields.getTextInputValue('addlNotes') })
					.setTimestamp()
					.setFooter({ text: newInt.member.id });

				const approvalButton = new ButtonBuilder().setCustomId('approved').setLabel('Approve').setStyle(ButtonStyle.Success);

				const rejectButton = new ButtonBuilder().setCustomId('rejected').setLabel('Reject').setStyle(ButtonStyle.Danger);

				const row = new ActionRowBuilder().addComponents(approvalButton, rejectButton);

				whitelistChannel.send({
					components: [row],
					embeds: [whitelistEmbed],
				});
			})
			.catch((err) => {
				console.error(err);
				interaction.followUp({ content: 'Error processing whitelist request.', flags: MessageFlags.Ephemeral });
			});
	},
};