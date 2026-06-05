const { createUnifiedEmbed } = require('./createUnifiedEmbed');
const { ACTIONLOG, MODLOG } = process.env;

/**
 *
 * @param {Boolean} modlog
 * @param {import('discord.js').Guild} guild
 * @param {{ title: String, fields: import('discord.js').RestOrArray<import('discord.js').APIEmbedField>}} options
 */
function createAuditLog(modlog, guild, options) {
	createUnifiedEmbed(guild, {
		title: options.title,
		fields: options.fields,
		noFooter: true,
	});

	if (modlog) {
		guild.channels.createMessage(MODLOG, {
			embeds: [embed],
		});
	}
	else {
		guild.channels.createMessage(ACTIONLOG, {
			embeds: [embed],
		});
	}
}

module.exports = { createAuditLog };