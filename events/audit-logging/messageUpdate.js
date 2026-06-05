const { Events } = require('discord.js');
const { createAuditLog } = require('../../utils/createAuditLog');


module.exports = {

	// name: Events.MessageUpdate,
	/**
     * @param {import('discord.js').Message} oMessage
	 * @param {import('discord.js').Message} ,Message
     */
	async execute(oMessage, nMessage) {
		const { guild } = oMessage;

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