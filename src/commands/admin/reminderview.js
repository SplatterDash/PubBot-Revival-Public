const { SlashCommandBuilder, MessageFlags, PermissionFlagsBits } = require('discord.js');
const { createUnifiedEmbed } = require('../../utils/createUnifiedEmbed');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reminderview')
		.setDescription('View all of your reminders in the reminder system.')
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

	async execute(interaction) {
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const embed = createUnifiedEmbed(interaction.guild, {
			color: 'Blurple',
			title: 'Current Reminders - ' + (interaction.member.nickname ?? interaction.user.displayName),
			thumb: interaction.member.displayAvatarURL(),
		});

		const { client, guild } = interaction;
		const { hiddenData } = client;
		const { id } = guild;
		if (!hiddenData[id] || !hiddenData[id].reminders || hiddenData[id].reminders.length < 1) {
			embed.setDescription('There are no reminders set for this guild.');
			return interaction.editReply({ embeds: [embed] });
		}
		const daUserData = hiddenData[id].reminders.filter((i) => i.author == interaction.member.id);
		if (daUserData.length < 1) {
			embed.setDescription('You have no reminders in the reminder system.');
			return interaction.editReply({ embeds: [embed] });
		}
		daUserData.forEach((dat) => {
			embed.addFields(
				{ name: 'Title', value: dat.tag, inline: true },
				{ name: 'Time', value: `<t:${dat.time}:F>`, inline: true },
				{ name: 'Roles', value: dat.roles.length > 0 ? dat.roles.join(', ') : 'None (DM Reminder)', inline: true },
			);
			if (daUserData.indexOf(dat) < daUserData.length - 1) embed.addFields({ name: '\u200b', value: '\u200b' });
		});
		interaction.editReply({ embeds: [embed] });
	},
};