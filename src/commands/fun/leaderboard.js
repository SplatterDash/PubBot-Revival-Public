const { SlashCommandBuilder, MessageFlags, ButtonBuilder, ActionRowBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { Users } = require('../../xpdata/dbObjects');
const { createUnifiedEmbed } = require('../../utils/createUnifiedEmbed');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('leaderboard')
		.setDescription('View XP leaderboard for the server!'),

	/**
         * @param {import('discord.js').ChatInputCommandInteraction} interaction
         */
	async execute(interaction) {
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });
		const { guild, member } = interaction;
		await Users.findAll({ where: { guild_id: guild.id } })
			.then(async (daRatings) => {
				daRatings.sort((a, b) => b.dataValues.xp - a.dataValues.xp);
				const user = daRatings.filter((r) => r.dataValues.user_id === member.id)[0];
				const totPages = Math.ceil(daRatings.length / 10);
				const daPage = 0;

				/**
                 * @returns {import('discord.js').EmbedBuilder}
                 */
				async function createPage() {
					const items = daRatings.slice(daPage, daPage + 9);
					const fieldsInput = [];
					for (const i of items) {
						const mem = await guild.members.fetch({ user: i.dataValues.user_id, force: true });
						if (!mem) return console.error('Error fetching member with id ' + i.dataValues.user_id + ', stopping page development.');
						const name = mem.nickname ?? mem.displayName;
						fieldsInput.push({
							name: `${daRatings.indexOf(i) + 1}. ${name}`,
							value: `**${i.dataValues.xp}** total xp, level **${i.dataValues.level}**`,
						});
					}
					return createUnifiedEmbed(guild, {
						title: 'Leaderboard for ' + guild.name,
						desc: `*Your Position:* __**${user ? daRatings.indexOf(user) + 1 : 'None'}**__ *(${user?.dataValues.xp ?? '0'} total xp, level ${user?.dataValues.level ?? '0'})*`,
						fields: fieldsInput,
						color: 'LuminousVividPink',
					});
				};

				const multiPage = totPages > 0;
				const firstButt = new ButtonBuilder().setCustomId('lb-first').setLabel('<<< First').setDisabled(true).setStyle(ButtonStyle.Secondary);
				const prevButt = new ButtonBuilder().setCustomId('lb-prev').setLabel('< Previous').setDisabled(true).setStyle(ButtonStyle.Primary);
				const nextButt = new ButtonBuilder().setCustomId('lb-next').setLabel('Next >').setDisabled(multiPage).setStyle(ButtonStyle.Primary);
				const lastButt = new ButtonBuilder().setCustomId('lb-last').setLabel('Last >>>').setDisabled(multiPage).setStyle(ButtonStyle.Secondary);
				const daRow = new ActionRowBuilder().addComponents(firstButt, prevButt, nextButt, lastButt);

				const daEmbed = await createPage();

				interaction.editReply({
					embeds: [daEmbed],
					components: [daRow],
				})
					.then((resp) => {
						const collectFilter = (i) => i.user.id === interaction.user.id;
						const coll = resp.createMessageComponentCollector({ filter: collectFilter, componentType: ComponentType.Button });

						coll.on('collect', async (int) => {
							switch (int.customId) {
							case 'lb-first': {
								firstButt.setDisabled(true);
								prevButt.setDisabled(true);
								nextButt.setDisabled(false);
								lastButt.setDisabled(false);
								curPage = 0;
								break;
							}
							case 'lb-prev': {
								firstButt.setDisabled(curPage - 1 === 0);
								prevButt.setDisabled(curPage - 1 === 0);
								nextButt.setDisabled(false);
								lastButt.setDisabled(false);
								curPage--;
								break;
							}
							case 'lb-next': {
								firstButt.setDisabled(false);
								prevButt.setDisabled(false);
								nextButt.setDisabled(curPage + 1 === pagesTot - 1);
								lastButt.setDisabled(curPage + 1 === pagesTot - 1);
								curPage++;
								break;
							}
							case 'lb-last': {
								firstButt.setDisabled(false);
								prevButt.setDisabled(false);
								nextButt.setDisabled(true);
								lastButt.setDisabled(true);
								curPage = pagesTot - 1;
								break;
							}
							}
							const daNewEmbed = await createPage();
							resp.edit({
								embeds: [daNewEmbed],
								components: [daRow],
							});
						});
					})
					.catch(console.error);
			})
			.catch(console.error);
	},
};