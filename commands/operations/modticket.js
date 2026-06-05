const { SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, LabelBuilder, TextInputBuilder, FileUploadBuilder, MessageFlags, ButtonBuilder, ButtonStyle, TextDisplayBuilder, TextInputStyle, ModalBuilder, PermissionFlagsBits, ActionRowBuilder } = require('discord.js');
const { createUnifiedEmbed } = require('../../utils/createUnifiedEmbed');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('modticket')
		.setDescription('Submit a ticket to talk with a mod about an issue.'),

	cooldown: 60,
	async execute(interaction) {
		const { hiddenData } = interaction.client;
		if (!hiddenData[guildId] || !hiddenData[guildId].ticketBlacklist || !hiddenData[guildId].ticketBlacklist.includes(interaction.user.id)) {
			const topTitle = new TextDisplayBuilder().setContent(
				'# PLEASE READ BEFORE FILLING OUT THIS FORM\nPlease ONLY fill out this form for legitimate reasons. This is intended for issues within the server, not outside of it.\nWhen you submit this form, a channel will be made for you to connect you with the staff. Please be patient, as the staff can be busy, but we will get back to you ASAP.\nAny abuse of the mod ticketing system will result in being blacklisted from using the system again in the future.',
			);

			const catList = new StringSelectMenuBuilder()
				.setCustomId('ticketCategory')
				.setPlaceholder('Select one...')
				.setRequired(true)
				.addOptions(
					new StringSelectMenuOptionBuilder()
						.setLabel('Technical - Bot or Role Issue in Server')
						.setValue('Technical')
						.setEmoji('💻'),
					new StringSelectMenuOptionBuilder()
						.setLabel('Report - Problem with Server Member')
						.setValue('Conflict')
						.setEmoji('😡'),
					new StringSelectMenuOptionBuilder()
						.setLabel('General Question')
						.setValue('Question')
						.setEmoji('❓'),
					new StringSelectMenuOptionBuilder()
						.setLabel('Other - Not Listed Here')
						.setValue('Other')
						.setEmoji('🫃'),
				);

			const catText = new LabelBuilder()
				.setLabel('Issue Category')
				.setStringSelectMenuComponent(catList);

			const detailBox = new TextInputBuilder()
				.setCustomId('details')
				.setStyle(TextInputStyle.Paragraph)
				.setRequired(true)
				.setPlaceholder('What\'s goin on? Give as much detail as possible.');

			const detailText = new LabelBuilder()
				.setLabel('Details')
				.setTextInputComponent(detailBox);

			const fileUploads = new FileUploadBuilder()
				.setCustomId('suppDocs')
				.setMaxValues(10)
				.setRequired(false);

			const fileText = new LabelBuilder()
				.setLabel('File Uploads')
				.setDescription('If you have any files, upload them here! Max is 10 files.')
				.setFileUploadComponent(fileUploads);

			const modal = new ModalBuilder().setCustomId('ticketModal').setTitle('Ye Olde Hado\'s Mod Ticket System')
				.addTextDisplayComponents(topTitle)
				.addLabelComponents(catText, detailText, fileText);

			await interaction.showModal(modal);

			const collectorFilter = (i) => {
				return i.user.id === interaction.user.id && i.customId === 'ticketModal';
			};

			interaction
				.awaitModalSubmit({ time: 180_000, filter: collectorFilter })
				.then(async (newInt) => {
					newInt.reply({ content: 'Creating ticket channel.', flags: MessageFlags.Ephemeral });
					try {
						const daChan = await newInt.guild.channels.create({
							name: `ticket-${newInt.user.id}`,
							parent: process.env.TICKET_CAT,
							permissionOverwrites: [
								{
									id: newInt.guild.roles.everyone.id,
									deny: [PermissionFlagsBits.ViewChannel],
								},
								{
									id: newInt.user.id,
									allow: [PermissionFlagsBits.ViewChannel],
								},
								{
									id: process.env.BOUNCER_ROLE,
									allow: [PermissionFlagsBits.ViewChannel],
								},
							],
						});

						const button = new ButtonBuilder().setCustomId('resolve').setLabel('Issue Resolved').setStyle(ButtonStyle.Primary);
						const row = new ActionRowBuilder().addComponents(button);
						const embed = createUnifiedEmbed(newInt.guild, {
							title: `Ticket: ${newInt.user.displayName}`,
							thumb: newInt.member.user.avatarURL(),
							fields: [
								{ name: 'Category', value: newInt.fields.getStringSelectValues('ticketCategory')[0] },
								{ name: 'Details', value: newInt.fields.getTextInputValue('details') },
							],
							noFooter: true,
						});

						return daChan.send({
							content: `<@${process.env.HADO_ID}> <@&${process.env.BARBACK_ROLE}> <@&${process.env.BOUNCER_ROLE}> <@${newInt.user.id}>`,
							embeds: [embed],
							files: Array.from(newInt.fields.getUploadedFiles('suppDocs').values()),
							components: [row],
						});
					}
					catch (err) {
						console.error(err);
						newInt.followUp({ content: 'Error creating ticket channel.', flags: MessageFlags.Ephemeral });
					};
				})
				.catch((err) => {
					console.error(err);
					interaction.followUp({ content: 'Error processing ticket request.', flags: MessageFlags.Ephemeral });
				});
		};
		return interaction.reply({ content: 'You are not able to access the ticket system.', flags: MessageFlags.Ephemeral });
	},
};