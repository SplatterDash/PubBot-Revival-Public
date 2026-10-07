const { SlashCommandBuilder, TextDisplayBuilder, ContainerBuilder, MessageFlags } = require('discord.js');
const { HONEYPOT_CHANNEL: honeyPot } = process.env;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('honeypotsetup')
		.setDescription('Creates message for the honeypot channel.')
		.setDefaultMemberPermissions(0),

	hadoOnly: true,

	async execute(interaction) {
		interaction.reply({ content: 'Creating honeypot message...', flags: MessageFlags.Ephemeral });
		const component = new ContainerBuilder()
			.setAccentColor(16705372)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent('# DON\'T SEND ANY MESSAGES IN HERE!\n**If you can read this, then you have a human brain.** We rigged this channel with a trapdoor out to the alleyway, and it opens when you say something in here. If you don\'t wanna get kicked to the curb (without a chance to appeal), then don\'t say anything in here!'),
			);

		interaction.guild.channels.fetch(honeyPot, { force: true })
			.then(async (chan) => {
				await chan.send({
					components: [component],
					flags: MessageFlags.IsComponentsV2,
				});
			});
	},
};