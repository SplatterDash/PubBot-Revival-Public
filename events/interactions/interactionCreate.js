const { useMainPlayer } = require('discord-player');
const { Events, MessageFlags, ModalBuilder, TextInputStyle, TextDisplayBuilder, TextInputBuilder, LabelBuilder, Collection } = require('discord.js');
const { createUnifiedEmbed } = require('../../utils/createUnifiedEmbed');
const { BOT_CHANNEL: botChannel, MUSIC_CHANNEL: musicChannel, MOD_COMMANDS: modChannel, HADO_ID: hadoId, WHITELIST_ID: whitelist, BARBACK_ROLE: barback, BOUNCER_ROLE: bouncer } = process.env;

module.exports = {
	name: Events.InteractionCreate,

	/**
	 *
	 * @param {import('discord.js').BaseInteraction} interaction
	 * @returns
	 */
	async execute(interaction) {
		if (interaction.isChatInputCommand()) {
			const { cooldowns, commands } = interaction.client;
			const command = commands.get(interaction.commandName);

			if (!command) {
				console.error(`No command matching ${interaction.commandName} was found.`);
				return;
			}

			if (!command.bypassChannelWhitelist) {
				const channelList = command.channelWhitelist ?? (command.music ? [musicChannel] : (command.modChan ? [modChannel] : [botChannel]));
				if (!channelList.includes(interaction.channelId)) {
					return interaction.reply({
						content: 'You are not allowed to use this command here!',
						flags: MessageFlags.Ephemeral,
					});
				}
			}

			if (command.hadoOnly && interaction.user.id != hadoId) {
				return interaction.reply({
					content: 'You are not allowed to use this command.',
					flags: MessageFlags.Ephemeral,
				});
			}

			if (!cooldowns.has(command.data.name)) {
				cooldowns.set(command.data.name, new Collection());
			}

			const now = Date.now();
			const timestamps = cooldowns.get(command.data.name);
			const defaultCooldownDuration = 3;
			const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1_000;

			if (timestamps.has(interaction.user.id)) {
				const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

				if (now < expirationTime) {
					const expiredTimestamp = Math.round(expirationTime / 1_000);
					return interaction.reply({
						content: `You are on a cooldown for \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`,
						flags: MessageFlags.Ephemeral,
					});
				}
			}

			timestamps.set(interaction.user.id, now);
			setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

			const player = useMainPlayer();

			const data = {
				guild: interaction.guild,
			};

			try {
				await player.context.provide(data, () => command.execute(interaction));
			}
			catch (error) {
				console.error(error);
				if (interaction.replied || interaction.deferred) {
					await interaction.followUp({
						content: `There was an error while executing command ${interaction.commandName}!`,
						flags: MessageFlags.Ephemeral,
					});
				}
				else {
					await interaction.reply({
						content: `There was an error while executing command ${interaction.commandName}!`,
						flags: MessageFlags.Ephemeral,
					});
				}
			}
		}
		else if (interaction.isButton()) {
			if (interaction.channelId == whitelist) {
				if (interaction.user.id != hadoId) {
					return interaction.reply({ content: 'This can only be done by Hado.', flags: MessageFlags.Ephemeral });
				}

				const embed = interaction.message.embeds[0];
				const member = interaction.guild.members.cache.get(embed.footer.text);

				if (!member) {
					interaction.reply(`Member with ID **${embed.footer.text}** no longer exists in the server.`);
					interaction.message.delete();
					return;
				}

				const topTitle = new TextDisplayBuilder().setContent(
					`# ${interaction.customId.toUpperCase()} WHITELIST CONFIRMATION - ${member.user.displayName}\nAre you sure?`,
				);

				const addlBox = new TextInputBuilder()
					.setCustomId('addlNotes')
					.setStyle(TextInputStyle.Paragraph)
					.setPlaceholder('This will be shared with the whitelist requester.');

				const addlLabel = new LabelBuilder()
					.setLabel('Additional Notes')
					.setTextInputComponent(addlBox);

				const modal = new ModalBuilder().setCustomId('whitelistConfirmation').setTitle('Whitelist Confirmation')
					.addTextDisplayComponents(topTitle)
					.addLabelComponents(addlLabel);

				await interaction.showModal(modal);

				interaction.awaitModalSubmit({ time: 60_000, filter: (i) => i.user.id === interaction.user.id && i.customId === 'whitelistConfirmation' })
					.then((newInt) => {
						const newEmbed = createUnifiedEmbed(newInt.guild, {
							title: embed.title,
							color: embed.color,
							desc: `This request has been ${interaction.customId.toUpperCase()}.`,
							noFooter: true,
						});
						newInt.reply({ embeds: [newEmbed], flags: MessageFlags.Ephemeral });
						try {
							member.send(`Hi there!\nYour whitelist request has been **${interaction.customId}**.\n\n__Additional notes from Hado:__\n*"${newInt.fields.getTextInputValue('addlNotes')}"*`);
						}
						catch (err) {
							newInt.reply(`Error messaging user **${member.user.displayName}**: ${err.message}`);
							console.error(err);
						}
						interaction.message.delete();
					})
					.catch((err) => {
						console.error(err);
						interaction.followUp({ content: 'Error processing whitelist approval.', flags: MessageFlags.Ephemeral });
					});
			}
			else if (interaction.customId.startsWith('roles-')) {
				const colors = ['RED', 'ORA', 'YEL', 'GRE', 'BLU', 'VIO', 'WHI', 'BLA'];
				await interaction.deferReply({ flags: MessageFlags.Ephemeral });
				let ident = '';

				const rls = await interaction.guild.roles.fetch();

				switch (interaction.customId.split('-')[1]) {
				case 'calllist': {
					ident = 'Call List';
					break;
				}
				case 'gamenight': {
					ident = 'Game Night';
					break;
				}
				case 'newsletter': {
					ident = 'Newsletter';
					break;
				}
				case 'hehim': {
					ident = 'He/Him';
					break;
				}
				case 'sheher': {
					ident = 'She/Her';
					break;
				}
				case 'theythem': {
					ident = 'They/Them';
					break;
				}
				case 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'violet' | 'white' | 'black': {
					ident = interaction.customId.substring(6, 9).toUpperCase();
					const colRls = rls.filter((r) => colors.includes(r.name) && r.name != ident);
					for (const role of colRls) {
						if (interaction.member.roles.cache.has(role[0])) interaction.member.roles.remove(role[0]);
					}
					break;
				}
				}

				if (ident === '') return;

				const role = rls.find((r) => r.name === ident);
				if (interaction.member.roles.cache.has(role.id)) {
					interaction.member.roles.remove(role.id, 'button interaction');
					return interaction.editReply(`Removed the ${role.name} role.`);
				}
				else {
					interaction.member.roles.add(role.id, 'button interaction');
					return interaction.editReply(`Added the ${role.name} role.`);
				}

			}
			else {
				switch (interaction.customId) {
				case 'resolve': {
					if (interaction.member.roles.cache.hasAny(`${barback}`, `${bouncer}`)) {
						return interaction.reply({ content: 'This can only be done by a staff member.', flags: MessageFlags.Ephemeral });
					}

					const member = interaction.guild.members.cache.get(interaction.channel.name.substr(7));

					if (!member) {
						interaction.reply('The member who called this ticket no longer exists in the server. Autodeleting ticket in 10 seconds.');
						setTimeout(() => interaction.channel.delete('Ticket complete, member does not exist.'), 10_000);
						return;
					}

					const topTitle = new TextDisplayBuilder().setContent(
						`Confirming ticket closure for **${member.user.displayName}**\nAre you sure?`,
					);

					const addlBox = new TextInputBuilder()
						.setCustomId('addlNotes')
						.setStyle(TextInputStyle.Paragraph)
						.setPlaceholder('This will be shared with the ticket requester.');

					const addlLabel = new LabelBuilder()
						.setLabel('Additional Notes')
						.setTextInputComponent(addlBox);

					const modal = new ModalBuilder().setCustomId('ticketConfirmation').setTitle('Ticket Closure Confirmation')
						.addTextDisplayComponents(topTitle)
						.addLabelComponents(addlLabel);

					await interaction.showModal(modal);

					interaction.awaitModalSubmit({ time: 60_000, filter: (i) => i.user.id === interaction.user.id && i.customId === 'ticketConfirmation' })
						.then((newInt) => {
							newInt.reply('This ticket has been closed. This channel will be deleted in 10 seconds.');
							setTimeout(() => {
								try {
									member.send(`Hi there!\nThe ticket you filed was closed successfully.\n\n__Additional notes from the staff:__\n*"${newInt.fields.getTextInputValue('addlNotes')}"*`);
									newInt.channel.delete(`Ticket marked resolved by **${newInt.user.displayName}**.`);
								}
								catch (err) {
									console.error(err);
								}
							}, 10_000);
						})
						.catch((err) => {
							console.error(err);
							interaction.followUp({ content: 'Error processing ticket closure.', flags: MessageFlags.Ephemeral });
						});
					break;
				}
				}
			}
		}
		else {
			return;
		}
	},
};