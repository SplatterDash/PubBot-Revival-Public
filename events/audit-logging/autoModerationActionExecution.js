const { Events } = require('discord.js');
const { createAuditLog } = require('../../utils/createAuditLog');

module.exports = {

	// name: Events.AutoModerationActionExecution,
	/**
     * @param {import('discord.js').AutoModerationActionExecution} amExecution
     */
	async execute(amExecution) {
		const { guild } = amExecution;

		createAuditLog(true, guild, {
			title: 'Automod Action',
			fields: [{
				name: 'Action',
				value: amExecution.action.type.toString(),
				inline: true,
			}, {
				name: 'Target',
				value: amExecution.member.nickname ?? amExecution.member.displayName,
				inline: true,
			}, {
				name: 'Message',
				value: amExecution.content,
			}],
		});
	},
};