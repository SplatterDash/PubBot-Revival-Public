const { EmbedBuilder } = require('discord.js');

/**
 *
 * @param {import('discord.js').Guild} guild
 * @param {{ title: String,
 * author?: import('discord.js').GuildMember,
 * color?: import('discord.js').ColorResolvable,
 * from?: (import('discord.js').APIEmbed | import('discord.js').JSONEncodable<import('discord.js').APIEmbed>),
 * attach?: String,
 * noTimestamp?: Boolean,
 * thumb?: String,
 * fields?: import('discord.js').RestOrArray<import('discord.js').APIEmbedField>,
 * noFooter?: Boolean,
 * desc?: String
 * }} options
 * @returns
 */
function createUnifiedEmbed(guild, options) {
	const { title, author, color, from, attach, noTimestamp, thumb, fields, noFooter, desc } = options;

	const embed = (from ? EmbedBuilder.from(from) : new EmbedBuilder());
	if (title) embed.setTitle(title);
	if (desc) embed.setDescription(desc);
	if (author) {
		embed.setAuthor({
			url: author.url,
			name: author.name,
		});
	};
	if (color) embed.setColor(color);
	if (attach) embed.setImage(attach);
	if (thumb) embed.setThumbnail(thumb);
	if (fields) fields.forEach((cont) => embed.addFields({ name: cont.name, value: cont.value, inline: cont.inline }));
	if (!noTimestamp) embed.setTimestamp();
	if (!noFooter) {
		embed.setFooter({
			iconURL: guild.members.me.displayAvatarURL(),
			text: global.createFooterMessage(),
		});
	}

	return (embed);
}

module.exports = { createUnifiedEmbed };