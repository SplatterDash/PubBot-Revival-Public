const { Events } = require('discord.js');
const { createAuditLog } = require('../../utils/createAuditLog');

module.exports = {

	// name: Events.MessageDelete,
	/**
     * @param {import('discord.js').Message} message
     */
	async execute(message) {
		const { guild } = message;

		createAuditLog(true, guild, {
			title: 'Message Deleted',
			fields: [{
				name: 'Author',
				value: message.member.nickname ?? message.member.displayName,
				inline: true,
			}, {
				name: 'Content',
				value: message.content,
			}],
		});
	},
};