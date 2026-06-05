const { Events } = require('discord.js');
const { createAuditLog } = require('../../utils/createAuditLog');

module.exports = {
	name: Events.GuildMemberAdd,

	/**
	 *
	 * @param {import('discord.js').GuildMember} member
	 */
	async execute(member) {
		member.client.welcomeboards.createBoard(member);

		/**createAuditLog(false, member.guild, {
			title: 'Member Joined',
			fields: [{
				title: 'Name',
				value: member.displayName,
				inline: true,
			}, {
				title: 'Account Created',
				value: member.user.createdAt.toDateString(),
				inline: true,
			}],
		});**/
	},
};