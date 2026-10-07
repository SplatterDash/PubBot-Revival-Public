const { ComponentType, MessageFlags, ButtonStyle, ButtonBuilder, ActionRowBuilder } = require('discord.js');
const { Users, Infractions } = require('./dbObjects.js');
const { createUnifiedEmbed } = require('../utils/createUnifiedEmbed.js');

/**
 *
 * @param {import('discord.js').ChatInputCommandInteraction} int
 * @param {import('discord.js').GuildMember} target
 * @param {*} options type, reason, length
 * @param {Function<VoidFunction>} callback
 */
async function addInfraction(int, target, options = null, callback = null) {
	const { member } = int;
	const type = options?.type ?? 'Warn';

	if (member.roles.highest.rawPosition <= target.roles.highest.rawPosition && type !== 'Warn') return int.editReply({ content: 'You cannot perform actions on someone equal to or higher than your position.\nIf you believe a staff member is acting out of line, please contact Hado directly.', flags: MessageFlags.Ephemeral });

	const reason = options?.reason ?? 'No reason given';

	createAndAwaitPoll(int, type, target.displayName, reason, target.id, async () => {
		try {
			target.send(`You received a **${type}** from ${int.guild.name}${options?.length ? `for ${options.length} seconds.` : ''}.\n\nReason: ${reason}`);
		}
		catch {
			conf.followUp(`Could not send a DM confirmation to **${target.displayName}**.`);
		}
		if (callback) callback();
	}, options?.length);
}

/**
 * @param {String} target
 * @param {String} guild
 * @param {*} options infraction type, infraction id, user id, enforcer id, beforeTime, afterTime
 * @returns {Promise<import('sequelize').Model<any, any>[]>}
 */
async function getInfractions(target, guild, options) {
	const use = await Users.findOrCreate({ where: { user_id: target, guild_id: guild } });
	const infs = await use[0].getInfs(use[0].dataValues);
	const res = infs.filter((r) => {
		if (!options) return true;
		if ((!options.type || !r.inf_type.toLowerCase().endsWith(options.type))
            && (!options.enf || options.enf !== r.enforcer_id)
            && (!options.inf_id || options.inf_id !== r.id)
            && (!options.use_id || options.use_id !== r.user_id)
            && (!options.before || Number(options.before) >= Number(r.time))
            && (!options.after || Number(options.after) <= Number(r.time))
		) return true;
		return false;
	});
	return res;
}

/**
 * @param {String} guild
 * @param {*} options infraction type, infraction id, user id, enforcer id, beforeTime, afterTime
 * @returns {Promise<import('sequelize').Model<any, any>[]>}
 */
async function getAllInfractions(guild, options) {
	const infs = await Infractions.findAll({ where: { guild_id: guild } });
	const res = infs.filter((r) => {
		if (!options) return true;
		if ((!options.type || !r.inf_type.toLowerCase().endsWith(options.type))
            && (!options.enf || options.enf !== r.enforcer_id)
            && (!options.inf_id || options.inf_id !== r.id)
            && (!options.use_id || options.use_id !== r.user_id)
            && (!options.before || Number(options.before) >= Number(r.time))
            && (!options.after || Number(options.after) <= Number(r.time))
		) return true;
		return false;
	});
	return res;
}

/**
 *
 * @param {import('discord.js').ChatInputCommandInteraction} int
 * @param {Number} id
 * @returns
 */
async function removeInfractions(int, id, reason = 'No reason given.') {
	const inf = await Infractions.findOne({ where: { id: id } });
	if (!inf) return int.editReply(`No infraction exists with ID ${id}.`);

	createAndAwaitPoll(int, 'Reverse ' + inf.inf_type, await int.guild.members.fetch({ force: true, user: inf.user_id })?.displayName || 'Unknown', reason, inf.user_id, () => {
		switch (inf.inf_type) {
		case 'Ban': {
			int.guild.members.unban(inf.user_id);
			break;
		}
		case 'Mute': {
			if (int.guild.members.cache.has(inf.user_id)) {
				int.guild.members.cache.get(inf.user_id).voice.serverMute = false;
			}
			break;
		}
		case 'Timeout': {
			if (int.guild.members.cache.has(inf.user_id)) {
				int.guild.members.cache.get(inf.user_id).timeout(null);
			}
			break;
		}
		}
	});
}

/**
 *
 * @param {import('discord.js').ChatInputCommandInteraction} int
 * @param {String} type
 * @param {String} name
 * @param {String} reason
 * @param {Function<VoidFunction>} cb
 * @param {Number} length
 */
async function createAndAwaitPoll(int, type, name, reason, id, cb, length = null) {
	const cont = createUnifiedEmbed(int.guild, {
		color: '#00ffaa',
		title: `CONFIRM ${type.toUpperCase()}`,
		desc: `Are you sure you want to ${type.toLowerCase()} **${name}**?\n\n**Reason**: ${reason}${length ? `\n\n**Length**: ${length} s` : ''}`,
		noTimestamp: true,
		noFooter: true,
	});

	const row = new ActionRowBuilder()
		.addComponents(new ButtonBuilder().setCustomId('yes').setLabel('Yes').setStyle(ButtonStyle.Primary))
		.addComponents(new ButtonBuilder().setCustomId('no').setLabel('No').setStyle(ButtonStyle.Danger));

	const respo = await int.editReply({ components: [row], embeds: [cont], withResponse: true });

	const collectionFilter = (i) => i.user.id === int.user.id || i.user.id === process.env.HADO_ID;

	await respo.awaitMessageComponent({ filter: collectionFilter, componentType: ComponentType.Button, time: 60_000 })
		.then(async (conf) => {
			if (conf.customId == 'yes') {
				await conf.reply({ content: `Your ${type} request was approved.`, flags: MessageFlags.Ephemeral });
				const use = await Users.findOrCreate({ where: { user_id: id, guild_id: conf.guild.id } });
				use[0].addInf(use[0].dataValues, {
					type: type,
					reason: reason,
					enforcer_id: conf.user.id,
					duration: length,
				});
				await int.editReply({ content: `${conf.member.displayName} performed ${type.toLowerCase()} on ${name} for reason ${reason}`, embeds: [], components: [] });
				cb();
			}
			else {
				await conf.reply({ content: 'Action cancelled.', flags: MessageFlags.Ephemeral });
				await int.editReply({ content: `This ${type.toLowerCase()} request was denied.`, embeds: [], components: [] });
			}
		})
		.catch(() => {
			// console.error(err);
			int.editReply({ content: 'This request has timed out.', embeds: [], components: [] });
		});
}

module.exports = { addInfraction, getInfractions, getAllInfractions, removeInfractions };