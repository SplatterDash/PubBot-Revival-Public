const { MessageFlags, SlashCommandBuilder } = require('discord.js');
const { description } = require('../../../package.json');
const { createUnifiedEmbed } = require('../../utils/createUnifiedEmbed');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('info')
		.setDescription('Get info about yourself, the server, or the bot!')
		.addStringOption((option) =>
			option.setName('topic')
				.setDescription('What would you like info on?')
				.addChoices(
					{ name: 'My self!', value: 'user' },
					{ name: 'The server!', value: 'server' },
					{ name: 'You, the bot!', value: 'bot' },
				)
				.setRequired(true),
		)
		.addBooleanOption((option) => option.setName('ephemeral').setDescription('Hide your info from others? (default is TRUE)')),

	async execute(interaction) {
		await interaction.deferReply({ flags: (interaction.options.getBoolean('ephemeral') ? MessageFlags.Ephemeral : 0) });
		switch (interaction.options.getString('topic')) {
		case 'user': {
			const { user, member } = interaction;
			const { getCurrency, xpEquation } = interaction.guild.client;

			const currencInf = getCurrency(member);

			const embed = createUnifiedEmbed(interaction.guild, {
				title: `User info for ${member.nickname ?? user.displayName}` + (member.nickname ? ` (${user.displayName})` : ''),
				thumb: member.avatarURL() ?? user.avatarURL(),
				fields: [
					{ name: 'Joined Discord:', value: user.createdAt.toDateString(), inline: true },
					{ name: 'Joined the Pub:', value: member.joinedAt.toDateString(), inline: true },
					{ name: 'Highest Role:', value: member.roles.highest.name, inline: true },
					{ name: '\u200B', value: '\u200B' },
					{ name: 'Level:', value: `${currencInf[0]}`, inline: true },
					{ name: 'To Next Level:', value: `${xpEquation(currencInf[0]) - currencInf[1]}`, inline: true },
					{ name: 'Balance:', value: `${currencInf[2]}`, inline: true },
				],
				color: '#1824f9',
			});

			interaction.editReply({ embeds: [embed] });
			break;
		}
		case 'server': {
			const { guild } = interaction;

			const embed = createUnifiedEmbed(guild, {
				title: `Server info for ${guild.name}`,
				thumb: guild.iconURL(),
				fields: [
					{ name: 'Established:', value: guild.createdAt.toDateString(), inline: true },
					{ name: 'Members:', value: `${guild.memberCount}`, inline: true },
				],
				color: '#1824f9',
			});

			interaction.editReply({ embeds: [embed] });
			break;
		}
		case 'bot': {
			const { user } = interaction.client;
			const { me } = interaction.guild.members;

			const embed = createUnifiedEmbed(interaction.guild, {
				title: 'PubBot Info',
				thumb: user.avatarURL(),
				desc: `*"${description}"*`,
				fields: [
					{ name: 'Creator:', value: 'SplatterDash', inline: true },
					{ name: 'Originally Introduced:', value: me.joinedAt.toDateString(), inline: true },
					{ name: 'Revived:', value: new Date(process.env.PUBLISH_DATE).toDateString(), inline: true },
					{ name: '\u200B', value: '\u200B' },
					{ name: 'Last Updated:', value: new Date(process.env.LAST_UPDATED).toDateString(), inline: true },
					{ name: 'Uptime:', value: `${interaction.client.uptime / 1000} s`, inline: true },
				],
				color: '#1824f9',
			});

			interaction.editReply({ embeds: [embed] });
			break;
		}
		}
	},
};