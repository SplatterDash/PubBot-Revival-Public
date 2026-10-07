const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, MessageFlags, ComponentType, ButtonStyle } = require('discord.js');
const { getInfractions, getAllInfractions } = require('../../xpdata/infraction-methods');
const { createUnifiedEmbed } = require('../../utils/createUnifiedEmbed');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('infractions-view')
		.setDescription('View the infractions of a user.')
		.setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
		.addIntegerOption((option) => option.setName('inf-id').setDescription('Limit search results based on infraction ID.').setRequired(false))
		.addStringOption((option) => option.setName('inf-type').setDescription('Limit search results based on infraction type.').setChoices({
			name: 'Warn',
			value: 'warn',
		}, {
			name: 'Mute',
			value: 'mute',
		}, {
			name: 'Timeout',
			value: 'timeout',
		}, {
			name: 'Kick',
			value: 'kick',
		}, {
			name: 'Ban',
			value: 'ban',
		}))
		.addStringOption((option) => option.setName('mem-id').setDescription('Limit search results based on offending user\'s ID.').setMinLength(18).setRequired(false))
		.addUserOption((option) => option.setName('enf-id').setDescription('Limit search results based on enforcing user\'s ID.').setRequired(false))
		.addIntegerOption((option) => option.setName('before').setDescription('Limit search results to anything before MMDDYYYY date.').setMaxValue(12319999).setMinValue(1010000).setRequired(false))
		.addIntegerOption((option) => option.setName('after').setDescription('Limit search results to anything after MMDDYYYY date.').setMaxValue(12319999).setMinValue(1010000).setRequired(false))
		.addNumberOption((option) => option.setName('sort').setDescription('Sort choices in specific way').setChoices({
			name: 'Newest First',
			value: 0,
		}, {
			name: 'Oldest First',
			value: 1,
		})),

	modChan: true,
	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 */
	async execute(interaction) {
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });
		const { options } = interaction;

		/**
         * @param {String} str
         * @returns {String}
         */
		function createDate(str) {
			const dat = new Date();
			dat.setMonth(Number(str.slice(0, 2)));
			dat.setDate(Number(str.slice(2, 4)));
			dat.setYear(Number(str.slice(4)));
			return `${dat}`;
		}
		const passOpts = {
			inf_id: options?.getInteger('inf-id'),
			type: options?.getString('inf-type'),
			enf_id: options?.getMember('enf-id')?.id.toString(),
			before: options?.getInteger('before')
				? createDate(options.getInteger('before').toString())
				: null,
			after: options?.getInteger('after')
				? createDate(options.getInteger('after').toString())
				: null,
		};

		options?.getString('mem-id') ? getInfractions(options.getString('mem-id'), interaction.guild.id, passOpts) : getAllInfractions(interaction.guild.id, passOpts)
			.then((result) => {
				if (result.length == 0) return interaction.editReply('No results found.');
				result.sort((a, b) => options?.getNumber('sort') > 0 ? Number(b.time) - Number(a.time) : Number(a.time) - Number(b.time));
				const pagesTot = Math.ceil(result.length / 5);
				let curPage = 0;

				const firstButt = new ButtonBuilder().setCustomId('inf-first').setLabel('<<< First').setDisabled(true).setStyle(ButtonStyle.Secondary);
				const prevButt = new ButtonBuilder().setCustomId('inf-prev').setLabel('< Previous').setDisabled(true).setStyle(ButtonStyle.Primary);
				const nextButt = new ButtonBuilder().setCustomId('inf-next').setLabel('Next >').setDisabled(pagesTot > 0).setStyle(ButtonStyle.Primary);
				const lastButt = new ButtonBuilder().setCustomId('inf-last').setLabel('Last >>>').setDisabled(pagesTot > 0).setStyle(ButtonStyle.Secondary);
				const daRow = new ActionRowBuilder().addComponents(firstButt, prevButt, nextButt, lastButt);

				/**
                 *
                 * @returns {import('discord.js').EmbedBuilder}
                 */
				function getPage() {
					const thisPage = result.slice(curPage, curPage + 5);
					const theFields = [];
					thisPage.map((r, i) => {
						theFields.push({
							name: 'ID',
							value: `${r.id}`,
							inline: true,
						});
						theFields.push({
							name: 'User',
							value: interaction.guild.members.cache.get(r.user_id)?.displayName ?? r.user_id,
							inline: true,
						});
						theFields.push({
							name: 'Enforcer',
							value: interaction.guild.members.cache.get(r.enforcer_id)?.displayName ?? r.enforcer_id,
							inline: true,
						});
						theFields.push({
							name: 'Type',
							value: r.inf_type,
							inline: true,
						});
						theFields.push({
							name: 'Reason',
							value: r.reason,
							inline: true,
						});
						theFields.push({
							name: 'Time',
							value: new Date(r.time).toString(),
							inline: true,
						});
						if (i + 1 < thisPage.length) {
							theFields.push({
								name: '\u200b',
								value: '\u200b',
							});
						}
					});

					return createUnifiedEmbed(interaction.guild, {
						title: 'Infractions list for ' + interaction.guild.name,
						desc: `Page ${curPage + 1} of ${pagesTot}`,
						noTimestamp: true,
						fields: theFields,
						color: 'Blurple',
					});
				};

				interaction.editReply({
					embeds: [getPage()],
					components: [daRow],
				})
					.then((resp) => {
						const collectFilter = (i) => i.user.id === interaction.user.id;
						const coll = resp.createMessageComponentCollector({ filter: collectFilter, componentType: ComponentType.Button });

						coll.on('collect', (int) => {
							switch (int.customId) {
							case 'inf-first': {
								firstButt.setDisabled(true);
								prevButt.setDisabled(true);
								nextButt.setDisabled(false);
								lastButt.setDisabled(false);
								curPage = 0;
								break;
							}
							case 'inf-prev': {
								firstButt.setDisabled(curPage - 1 === 0);
								prevButt.setDisabled(curPage - 1 === 0);
								nextButt.setDisabled(false);
								lastButt.setDisabled(false);
								curPage--;
								break;
							}
							case 'inf-next': {
								firstButt.setDisabled(false);
								prevButt.setDisabled(false);
								nextButt.setDisabled(curPage + 1 === pagesTot - 1);
								lastButt.setDisabled(curPage + 1 === pagesTot - 1);
								curPage++;
								break;
							}
							case 'inf-last': {
								firstButt.setDisabled(false);
								prevButt.setDisabled(false);
								nextButt.setDisabled(true);
								lastButt.setDisabled(true);
								curPage = pagesTot - 1;
								break;
							}
							}
							resp.edit({
								embeds: [getPage()],
								components: [daRow],
							});
						});
					})
					.catch(console.error);
			})
			.catch(console.error);
	},
};