const { MessageFlags, ComponentType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { createUnifiedEmbed } = require('./createUnifiedEmbed');

async function createMusicPoll(interaction, options, onSuccess) {
	const { voice } = interaction.member;

	const { action, trk, time } = options;

	const maxAmount = voice.channel.members.size - 1;
	if (maxAmount <= 1) {
		interaction.editReply({ content: `You're the only one in call. Auto-performing ${action ? action.toLowerCase() : 'skip'}...`, flags: MessageFlags.Ephemeral });
		return onSuccess();
	};

	const embed = createUnifiedEmbed(interaction.guild, {
		title: `Vote to ${action ?? 'Skip'}${trk ? `: "${trk.title}" ` : ''}${trk ? `(${trk.author})` : ''}`,
		color: 'Fuchsia',
		desc: `Use the buttons to vote.\nI'm looking for **${Math.round(maxAmount / 2)}** votes on either option!\nYou have **${time ?? 60} seconds** to make a choice!`,
	});

	let vals = [0, 0];
	const mapPart = [];

	let gotSolution = false;

	row = new ActionRowBuilder().addComponents(
		new ButtonBuilder().setCustomId('yes-skip').setLabel('Yes').setStyle(ButtonStyle.Primary),
		new ButtonBuilder().setCustomId('no-skip').setLabel('No').setStyle(ButtonStyle.Secondary),
	);

	interaction.editReply({ embeds: [embed], components: [row], withResponse: true })
		.then(async (response) => {
			const collector = await response.createMessageComponentCollector({ componentType: ComponentType.Button, time: time * 1000, max: maxAmount });

			collector.on('collect', (i) => {
				if (i.member.voice.channel.id !== voice.channel.id ||
            		i.member.id === interaction.member.id ||
            		i.member.bot ||
            		mapPart.includes(i.member.id)
				) return;
				mapPart.push(i.member.id);
				vals = [vals[0] + (i.customId === 'yes-skip' ? 1 : 0), vals[1] + (i.customId === 'no-skip' ? 1 : 0)];

				if (mapPart.length >= Math.round((maxAmount - 2) / 2)) {
					gotSolution = true;
					collector.stop('complete!');
					if (vals[0] > vals[1]) {
						const newEmbed = createUnifiedEmbed(interaction.channel.guild, {
							from: embed,
							desc: `This poll has been passed. Performing ${action ? action.toLowerCase() : 'skip'}...`,
						});
						interaction.editReply({ embeds: [newEmbed], components: [] });
						onSuccess();
					}
					else {
						const newEmbed = createUnifiedEmbed(interaction.channel.guild, {
							from: embed,
							desc: 'This poll has been denied.',
						});
						interaction.editReply({ embeds: [newEmbed], components: [] });
					}
				}
				i.reply({ content: 'Response recorded!', flags: MessageFlags.Ephemeral });
			});

			collector.on('end', () => {
				if (!gotSolution) timeout(interaction);
			});
		})
		.catch(console.error);
}

function timeout(interaction) {
	const embed = createUnifiedEmbed(interaction.guild, {
		color: 'Fuchsia',
		desc: 'This poll has timed out.',
	});

	interaction.editReply({ embeds: [embed], components: [] });
}

module.exports = { createMusicPoll };