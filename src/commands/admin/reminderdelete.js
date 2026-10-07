const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reminderdelete')
		.setDescription('Delete a reminder that you set in the reminder system.')
		.addStringOption((option) => option.setName('title').setDescription('The title of the reminder you want to remove.'))
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

	execute(interaction) {
		const { hiddenData } = interaction.client;
		if (!hiddenData[interaction.guild.id] || !hiddenData[interaction.guild.id].reminders || hiddenData[interaction.guild.id].reminders < 1) return interaction.reply('No reminders exist for this server!');
		const rem = hiddenData[interaction.guild.id].reminders.filter((r) => r.tag.toLowerCase() == interaction.options.getString('title').toLowerCase() && r.author == interaction.member.id);
		if (rem.length <= 0) return interaction.reply('That reminder doesn\'t exist!');
		hiddenData[interaction.guild.id].reminders.splice(hiddenData[interaction.guild.id].reminders.indexOf(rem[0]), 1);
		interaction.reply('Reminder successfully deleted.');
	},
};