const { SlashCommandBuilder, MessageFlags, PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ticketblacklist')
		.setDescription('Blacklists a user from using the moderation ticket system.')
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
		.addUserOption((option) => option.setName('user').setDescription('User to blacklist.').setRequired(true)),

	modChan: true,
	execute(interaction) {
		const { hiddenData, saveHiddenData } = interaction.client;
		const guildId = interaction.guild.id;
		if (!hiddenData[guildId]) hiddenData[guildId] = {};
		if (!hiddenData[guildId].ticketBlacklist) hiddenData[guildId].ticketBlacklist = [];
		if (hiddenData[guildId].ticketBlacklist.includes(interaction.options.getUser('user').id)) return interaction.reply({ content: 'User is already on blacklist.', flags: MessageFlags.Ephemeral });
		hiddenData[guildId].ticketBlacklist.push(interaction.options.getUser('user').id);
		saveHiddenData();
		interaction.reply({ content: 'User has been added to blacklist.', flags: MessageFlags.Ephemeral });
	},
};