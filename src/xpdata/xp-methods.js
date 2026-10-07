const { Users } = require('./dbObjects.js');

/**
 * External function to add XP and levels to a member's account.
 *
 * This also affects the member's currency balance.
 * @param {import ('discord.js').Client} client Client to pass through to other functions.
 * @param {import ('discord.js').GuildMember} member Guild member to modify XP.
 * @param {Number} xp Amount of XP to modify.
 * @param {Number} lvls Amount of levels to modify.
 * @param {Boolean} calcXp Whether or not the command should (if true) set the XP and levels then add `xp` to the member's XP, or (if false) add `lvls` and `xp` to the member's level and XP numbers respectively.
 * @param {Boolean} alsoCur Whether or not the currency is also affected by the XP raise (false by default).
 * @returns {Promise<Boolean>} Whether or not this addition caused a level-up.
 */
async function addXpAndCheck(client, member, xp, lvls, calcXp, alsoCur) {
	await addXp(client, member, xp, lvls, calcXp, alsoCur);
	return checkLevelUp(client, member);
};

/**
 * External function to add currency to a member's account.
 *
 * This does NOT affect the member's XP or levels.
 * If you want to affecy both currency *and* XP, use `addXpAndCheck`.
 * @param {import ('discord.js').Client} client Client to get the member's current currency balance.
 * @param {import ('discord.js').GuildMember} member Guild member to modify XP.
 * @param {Number} num Amount to modify the currency.
 * @param {Boolean} calc Whether or not the command should set (true) or add to (false, default) the member's current currency balance.
 * @returns The user save.
 */
async function modBalance(client, member, num, calc = false) {
	const user = client.currency.get(member.id) ?? await createUser(client, member);

	if (calc) user.balance = num;
	else user.balance += num;

	return user.save();
}
/**
 * Internal function to add XP and levels to a member's data.
 *
 * This can also affect the user's currency.
 * @param {import ('discord.js').Client} client Client to get the member's XP and levels.
 * @param {import ('discord.js').GuildMember} member Guild member to get.
 * @param {Number} xp Amount to modify the XP.
 * @param {Number} lvls Amount to modify the levels.
 * @param {Boolean} calcXp Whether or not the command should (if true) set the XP and levels then add `xp` to the member's XP, or (if false) add `lvls` and `xp` to the member's level and XP numbers respectively.
 * @param {Boolean} alsoCur Whether or not the currency is also affected by the XP raise (false by default).
 * @returns The user's save.
 */
async function addXp(client, member, xp, lvls, calcXp = false, alsoCur = false) {
	const user = client.currency.get(member.id) ?? await createUser(client, member);

	if (calcXp) {
		user.level = Number(lvls);
		user.xp = xpEquation(user.level - 1);
	}
	else {
		user.level += Number(lvls);
	}
	user.xp += Number(xp);
	if (alsoCur) user.balance += Number(xp);
	return user.save();
}

/**
 * Internal function. Checks to see if a member has enough XP to level up.
 *
 * If levels need to be adjusted, this command handles the adjustments.
 * @param {import ('discord.js').Client} client Client to pass through.
 * @param {import ('discord.js').GuildMember} member Guild member to modify.
 * @returns {Boolean} Whether this member levelled up.
 */
function checkLevelUp(client, member) {
	const info = client.getCurrency(member);
	const level = info[0];
	const xp = info[1];
	const bar = xpEquation(level);
	if (xp >= bar) {
		do {
			addXp(client, member, 0, 1);
			modBalance(client, member, 15);
		} while (client.xpEquation(client.getCurrency(member)[0]) <= xp);
		checkLvlRoles(client, member);
		return true;
	}
	else if (xp < xpEquation(level - 2)) {
		do {
			addXp(client, member, 0, -1);
		} while (client.xpEquation(client.getCurrency(member)[0] - 2) > xp);
		checkLvlRoles(client, member);
	}
	return false;
};

/**
 * Checks to see if the member has the right role for their current level.
 *
 * Pulls information from `client.hiddenData`.
 * @param {import ('discord.js').Client} client Client object with `hiddenData` param.
 * @param {import ('discord.js').GuildMember} member Member to check.
 */
function checkLvlRoles(client, member) {
	const level = client.getCurrency(member)[0];
	const daKeys = Object.keys(client.levelRoles).filter((numb) => {
		return parseInt(numb) <= level;
	}).reverse();
	if (!member.roles.cache.has(client.levelRoles[daKeys[0]])) {
		for (const numb in Object.keys(client.levelRoles)) {
			const daId = client.levelRoles[numb];
			if (member.roles.cache.has(daId)) member.roles.remove(daId);
		}
		member.roles.add(client.levelRoles[daKeys[0]]);
	}
};

/**
 * Creates a new listing on both `client.currency` and the local database for this user.
 *
 * Only needs to happen if the user is not on the database.
 * @param {import ('discord.js').Client} client Client object with `currency` collection.
 * @param {import('discord.js').GuildMember} member Guild member.
 * @returns The user item as it shows on the database.
 */
async function createUser(client, member) {
	const newUser = await Users.create({ user_id: member.id, guild_id: member.guild.id, level: 0, xp: 0, balance: 0 });
	client.currency.set(member.id, newUser);
	return newUser;
};

/**
 * Internal function for calculating XP barriers.
 * @param {Number} lvl Level to calculate for.
 * @returns How much XP is needed to get to `lvl` + 1.
 */
function xpEquation(lvl) {
	return Number((2 * (lvl ** 2)) + (35 * lvl) + 30);
};

module.exports = { addXpAndCheck, xpEquation, modBalance, createUser };