const { Events, ActivityType } = require('discord.js');
const StaffBoard = require('../../canvas/staffboard');
const { Users } = require('../../xpdata/dbObjects.js');
const { useMainPlayer } = require('discord-player');
const { ACTIVITY_MESS: activity, ACTIVITY_SEASON: season, GUILD_ID: guildId } = process.env;

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		const storedBalances = await Users.findAll();
		storedBalances.forEach((b) => client.currency.set(b.user_id, b));

		if (process.execArgv.includes('--inspect')) console.log(useMainPlayer().scanDeps());

		(function loop() {
			let now = new Date();
			const { hiddenData } = client;
			const keysCol = Object.keys(hiddenData);
			keysCol.forEach((guild) => {
				if (hiddenData[guild].reminders != null) {
					hiddenData[guild].reminders.forEach((reminder) => {
						if ((now.getTime() / 1000) >= reminder.time) {
							client.guilds.fetch({ guild: guild, force: true })
								.then((guil) => {
									const chan = (reminder.roles.length >= 1) ? guil.channels.cache.get(reminder.channel) : guil.members.cache.get(reminder.author);
									let roleString = '';
									if (reminder.roles.length >= 1) {
										for (const role of reminder.roles) {
											roleString += `<@&${role.id}> `;
										}
									}
									chan.send((reminder.roles.length >= 1 ? roleString : '') + reminder.message);
								})
								.catch(console.error);
							hiddenData[guild].reminders.splice(hiddenData[guild].reminders.indexOf(reminder), 1);
						}
					});
				}
			});
			// allow for time passing
			now = new Date();
			// exact ms to next minute interval
			const delay = 60000 - (now % 60000);
			setTimeout(loop, delay);
		})();

		console.log(`Ready! Logged in as ${client.user.tag}`);
		const daGuild = await client.guilds.fetch({ guild: guildId, force: true });
		client.user.setActivity((new Date().getMonth() >= 11 ? season : activity).replace('%gn', daGuild.name), { type: ActivityType.Custom });
		client.staffboard = new StaffBoard(client);
	},
};