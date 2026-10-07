const { createAuditLog } = require('../../utils/createAuditLog');
const { Events } = require('discord.js');

module.exports = {

	name: Events.MessageUpdate,
	/**
     * @param {import('discord.js').Message} oMessage
	 * @param {import('discord.js').Message} nMessage
     */
	async execute(oMessage, nMessage) {
		const { guild } = oMessage;

		if (oMessage.author.id == oMessage.client.user.id) return;

		createAuditLog(false, guild, {
			title: 'Message Edited',
			fields: [{
				name: 'Author',
				value: oMessage.member.nickname ?? oMessage.member.displayName,
				inline: true,
			}, {
				name: 'Before',
				value: oMessage.content,
			}, {
				name: 'After',
				value: nMessage.content,
			}],
		});
	},
};