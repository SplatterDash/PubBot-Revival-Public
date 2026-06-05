const { Events } = require('discord.js');
const channelXPBL = process.env.XP_GAIN_BLACKLIST.split('--');

module.exports = {
	name: Events.MessageCreate,
	async execute(message) {
		if (message.author.bot || message.interactionMetadata || channelXPBL.includes(`${message.channel.id}`)) return;

		const { member, id } = message;
		const { addXp, getCurrency, xpMult } = message.client;
		const { id: memId } = message.author;

		if (message.client.currenCooldowns.has(memId)) {
			const cooldwn = message.client.currenCooldowns.get(memId);
			if (cooldwn.length >= 10) {
				return;
			}
			cooldwn.push(id);
			setTimeout(() => {
				cooldwn.splice(cooldwn.indexOf(id), 1);
			}, 600_000);
		}
		else {
			message.client.currenCooldowns.set(memId, [id]);
		};

		const addVal = Math.floor(1 * (1 + (0.05 * getCurrency(member)[0])) * xpMult);
		const lvldUp = await addXp(member, addVal);
		if (lvldUp) message.channel.send(`<@${memId}> Congrats, you are now level **${getCurrency(message.member)[0]}**!`);
	},
};