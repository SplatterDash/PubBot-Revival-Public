const { SlashCommandBuilder, TextInputBuilder, TextInputStyle, LabelBuilder, MessageFlags, RoleSelectMenuBuilder, ModalBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('remindercreate')
		.setDescription('Create a reminder for anything from events to personal items.')
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

	bypassChannelWhitelist: true,
	async execute(interaction) {
		const titlInput = new TextInputBuilder()
			.setCustomId('remindTitle')
			.setStyle(TextInputStyle.Short)
			.setRequired(true)
			.setMaxLength(80);

		const titlText = new LabelBuilder()
			.setLabel('Reminder Title')
			.setDescription('This can be used to call the reminder in the future.')
			.setTextInputComponent(titlInput);

		const messInput = new TextInputBuilder()
			.setCustomId('remindMess')
			.setStyle(TextInputStyle.Paragraph)
			.setRequired(true)
			.setMaxLength(500);

		const messText = new LabelBuilder()
			.setLabel('Reminder Message')
			.setDescription('This will show to everyone at the reminder time.')
			.setTextInputComponent(messInput);

		const dateInput = new TextInputBuilder()
			.setCustomId('remindDate')
			.setPlaceholder('MM/DD, or if it happens in a future year, MM/DD/YYYY')
			.setStyle(TextInputStyle.Short)
			.setRequired(true)
			.setMinLength(5)
			.setMaxLength(10);

		const dateText = new LabelBuilder()
			.setLabel('Reminder Date')
			.setTextInputComponent(dateInput);

		const timeInput = new TextInputBuilder()
			.setCustomId('remindTime')
			.setPlaceholder('HH:MM (AM/PM), or HH:MM')
			.setStyle(TextInputStyle.Short)
			.setRequired(true)
			.setMinLength(5)
			.setMaxLength(8);

		const timeText = new LabelBuilder()
			.setLabel('Reminder Time')
			.setTextInputComponent(timeInput);

		const roleInput = new RoleSelectMenuBuilder()
			.setCustomId('remindRoles')
			.setMaxValues(3)
			.setRequired(false);

		const roleText = new LabelBuilder()
			.setLabel('Role to Ping')
			.setDescription('If nothing is inputted, the bot will DM you the reminder.')
			.setRoleSelectMenuComponent(roleInput);

		const modal = new ModalBuilder().setCustomId('eventModal').setTitle('Create New Event')
			.addLabelComponents(titlText, messText, dateText, timeText, roleText);

		await interaction.showModal(modal);

		const collectorFilter = (i) => {
			return i.user.id === interaction.user.id && i.customId === 'eventModal';
		};

		interaction
			.awaitModalSubmit({ time: 180_000, filter: collectorFilter })
			.then(async (newInt) => {
				await newInt.deferReply({ flags: MessageFlags.Ephemeral });
				const { fields, client, guild } = newInt;
				const daDateString = fields.getTextInputValue('remindDate');
				const daTimeString = fields.getTextInputValue('remindTime');
				const curDate = new Date();
				const daDate = new Date(`${daDateString.length < 8 ? curDate.getFullYear() : daDateString.substr(daDateString.length - 4, 4)}-${daDateString.substr(0, 2)}-${daDateString.substr(2 + (daDateString.at(2) == '/' ? 1 : 0), 2)} ${(daTimeString.toLowerCase().endsWith('pm') && daTimeString.startsWith('12')) ? Number(daTimeString.substr(0, 2)) + 12 : ((!daTimeString.toLowerCase().endsWith('pm') && isNaN(daTimeString.substr(daTimeString.length - 1, 1)) && daTimeString.startsWith('12')) ? Number(daTimeString.substr(0, 2)) - 12 : daTimeString.substr(0, 2))}:${daTimeString.substr(2 + (daTimeString.at(2) == ':' ? 1 : 0), 2)}`);
				if ((curDate.getTime() / 1000) > daDate.getTime() / 1000) return newInt.editReply('You can\'t set a reminder for the past!');

				const { hiddenData, saveHiddenData } = client;
				if (!hiddenData[guild.id]) hiddenData[guild.id] = {};
				if (!hiddenData[guild.id].reminders) hiddenData[guild.id].reminders = [];
				if (hiddenData[guild.id].reminders.filter((i) => i.tag == fields.getTextInputValue('remindTitle') && i.author == newInt.member.id && i.time == (daDate.getTime() / 1000)).length > 0) {
					return newInt.editReply('A reminder of that title and time made by you already exists! Are you sure you didn\'t already make that reminder?');
				}
				hiddenData[guild.id].reminders.push({
					tag: fields.getTextInputValue('remindTitle'),
					message: fields.getTextInputValue('remindMess'),
					author: newInt.member.id,
					time: (daDate.getTime() / 1000),
					channel: newInt.channel.id,
					roles: fields.getSelectedRoles('remindRoles') ?? [],
				});
				saveHiddenData();
				newInt.editReply(`Reminder **${fields.getTextInputValue('remindTitle')}** set for <t:${daDate.getTime() / 1000}:F>. I will ${fields.getSelectedRoles('remindRoles') ? 'ping the inputted roles in this channel' : 'DM you'} at that time.`);
			})
			.catch((err) => {
				console.error(err.message);
				interaction.followUp('Error creating event!');
			});
	},
};