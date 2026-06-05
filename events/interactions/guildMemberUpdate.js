const { Events } = require('discord.js');
const { BARBACK_ROLE: barback, BOUNCER_ROLE: bouncer } = process.env;

module.exports = {
	name: Events.GuildMemberUpdate,
	async execute(oldMember, newMember) {
		if (newMember.premiumSince && ((!oldMember.premiumSince && newMember.premiumSince) || (oldMember.premiumSince != newMember.premiumSince))) {
			newMember.guild.client.welcomeboards.createBoard(newMember, 'boost');
		}

		if (oldMember.roles.cache == newMember.roles.cache) return;

		if ((checkAdminRoles(oldMember) || checkAdminRoles(newMember))) {
			newMember.guild.client.staffboard.reloadBoard();
		}

		function checkAdminRoles(member) {
			if (member.roles.cache.has(`${barback}`) || member.roles.cache.has(`${bouncer}`)) {
				return true;
			};
			return false;
		}
	},
};