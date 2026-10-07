const { createUnifiedEmbed } = require('./createUnifiedEmbed');
const { ACTIONLOG, MODLOG } = process.env;

/**
 *
 * @param {Boolean} modlog
 * @param {import('discord.js').Guild} guild
 * @param {{ title: String, fields: import('discord.js').RestOrArray<import('discord.js').APIEmbedField>}} options
 */
function createAuditLog(modlog, guild, options) {
	const embed = createUnifiedEmbed(guild, {
		title: options.title,
		fields: options.fields,
		noFooter: true,
	});

	if (modlog) {
		guild.channels.fetch(MODLOG)
			.then((chan) => chan.send({
				embeds: [embed],
			}));
	}
	else {
		guild.channels.fetch(ACTIONLOG)
			.then((chan) => chan.send({
				embeds: [embed],
			}));
	}
}

module.exports = { createAuditLog };