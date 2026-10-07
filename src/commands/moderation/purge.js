const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('purge')
		.setDescription('Purge messages from the channel that this message is sent.')
		.addIntegerOption((opt) => opt.setName('amount').setDescription('Amount of messages to purge.').setMinValue(1).setRequired(true))
		.addUserOption((opt) => opt.setName('user').setDescription('User\'s message to purge.'))
		.setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

	bypassChannelWhitelist: true,
	async execute(interaction) {
		const { options, channel } = interaction;
		if (options.getMember('user')) {
			await interaction.deferReply({ flags: MessageFlags.Ephemeral });
			await channel.messages.fetch();
			const messages = channel.messages.cache.filter((i) => i.author.id == options.getMember('user').id);
			channel.bulkDelete(Array.from(messages.keys()).slice(0, options.getInteger('amount') + 1))
				.then(interaction.editReply(`Purged ${options.getInteger('amount')} messages from user ${options.getMember('user')}.`))
				.catch(console.error);
		}
		else {
			channel.bulkDelete(options.getInteger('amount'))
				.then(interaction.reply({ content: `Purged ${options.getInteger('amount')} messages.`, flags: MessageFlags.Ephemeral }))
				.catch(console.error);
		}
	},
};