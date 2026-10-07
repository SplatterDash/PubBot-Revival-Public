const { ModalBuilder, SectionBuilder, SeparatorBuilder } = require('@discordjs/builders');
const { SlashCommandBuilder, PermissionFlagsBits, TextInputBuilder, LabelBuilder, MessageFlags, SeparatorSpacingSize, TextInputStyle } = require('discord.js');
const { MEET_BOARD: meetBoard } = process.env;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('meetstaff')
		.setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
		.setDescription('Set or change your memo for the Meet the Staff board!'),

	modChan: true,
	/**
         *
         * @param {import('discord.js').ChatInputCommandInteraction} interaction
         */
	async execute(interaction) {
		const { client, member, guild } = interaction;
		const { hiddenData, saveHiddenData } = client;

		const textInput = new TextInputBuilder()
			.setCustomId('staffInfo')
			.setMaxLength(500)
			.setStyle(TextInputStyle.Paragraph)
			.setPlaceholder('So what do you wanna say about yourself?');

		const currentEntry = hiddenData[guild.id]?.meetStaff?.filter((s) => s.id === member.id);

		if (currentEntry && currentEntry.length > 0) {
			textInput.setValue(currentEntry[0].text);
		}

		const textLabel = new LabelBuilder()
			.setLabel('About You')
			.setDescription('This will show on the Meet the Staff page.')
			.setTextInputComponent(textInput);

		const daModal = new ModalBuilder()
			.setCustomId('meet-staff-modal')
			.setTitle('"Meet The Staff" Setup')
			.setLabelComponents(textLabel);

		await interaction.showModal(daModal);

		const collectorFilter = (i) => {
			return i.user.id === interaction.user.id && i.customId === 'meet-staff-modal';
		};

		interaction.awaitModalSubmit({ filter: collectorFilter, time: 360_000 })
			.then(async (int) => {
				int.reply({ content: 'Info submitted!', flags: MessageFlags.Ephemeral });
				const { fields } = int;

				const cont = new SectionBuilder()
					.addTextDisplayComponents((txt) => txt.setContent(`# ABOUT ${member.nickname.toUpperCase() ? member.nickname.toUpperCase() + ` (${member.user.displayName})` : member.user.displayName.toUpperCase()}\n${fields.getTextInputValue('staffInfo')}`))
					.setThumbnailAccessory((tn) => tn.setDescription(`${member.nickname ?? member.user.displayName}'s profile picture`).setURL(member.displayAvatarURL() ?? member.user.displayAvatarURL()));

				const div = new SeparatorBuilder()
					.setDivider(true)
					.setSpacing(SeparatorSpacingSize.Small);

				if (!client.hiddenData[guild.id]?.meetStaff) {
					client.hiddenData[guild.id].meetStaff = [];
				}

				if (currentEntry?.length > 0) {
					const newDat = hiddenData[guild.id].meetStaff.splice(hiddenData[guild.id].meetStaff.indexOf(currentEntry[0]), 1)[0];
					newDat.text = fields.getTextInputValue('staffInfo');
					hiddenData[guild.id].meetStaff.push(newDat);
					saveHiddenData();
					await guild.channels.fetch(meetBoard, { force: true })
						.then(async (chan) => {
							await chan.messages.fetch({ message: newDat.messageId, force: true })
								.then((mess) => {
									return mess.edit({
										components: [cont, div],
										flags: MessageFlags.IsComponentsV2,
									});
								})
								.catch(console.error);
						})
						.catch((err) => {
							console.error(err);
							return int.followUp('Error completing Meet the Staff!');
						});
					return;
				}


				await guild.channels.fetch(meetBoard, { force: true })
					.then(async (chan) => {
						const daMess = await chan.send({
							components: [cont, div],
							flags: MessageFlags.IsComponentsV2,
						});
						hiddenData[guild.id].meetStaff.push({
							text: fields.getTextInputValue('staffInfo'),
							id: member.user.id,
							messageId: daMess.id,
						});
						return saveHiddenData();
					})
					.catch((err) => {
						console.error(err);
						return int.followUp('Error completing Meet the Staff!');
					});
			});
	},
};