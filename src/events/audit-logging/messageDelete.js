const { createAuditLog } = require('../../utils/createAuditLog');
const { Events } = require('discord.js');

module.exports = {

	name: Events.MessageDelete,
	/**
     * @param {import('discord.js').Message} oMessage
	 * @param {import('discord.js').Message} nMessage
     */
	async execute(message) {
		const { guild } = message;

		if (message.author.id == message.client.user.id) return;

		console.log(message.content);

		createAuditLog(false, guild, {
			title: 'Message Deleted by Author',
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