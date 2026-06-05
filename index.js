const fs = require('node:fs');
const path = require('node:path');
// eslint-disable-next-line no-unused-vars
const { Client, GatewayIntentBits, Collection, GuildMember } = require('discord.js');
const WelcomeBoards = require('./canvas/welcome-boards');
const { DISCORD_TOKEN: token, NODE_ENV: nodeEnv, YT_COOKIE: ytCookie, FOOTER_POOL: footPool, PING_MESS_REG: pingReg, PING_MESS_SEASON: pingSeas } = process.env;
const { addXpAndCheck, xpEquation, modBalance } = require('./xpdata/xp-methods.js');
const { changeConsole } = require('./utils/custom-console.js');
const { Player, onBeforeCreateStream } = require('discord-player');
const { YoutubeExtractor } = require('discord-player-youtube');
const { SoundcloudExtractor } = require('discord-player-soundcloud');
const { SpotifyExtractor } = require('discord-player-spotify');
const { AttachmentExtractor } = require('@discord-player/extractor');

changeConsole();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildModeration, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates] });

const player = new Player(client, {
	skipFFmpeg: false,
});

(async () => {
	async function regExt(ext, optns) {
		return await player.extractors.register(ext, optns);
	}
	const youtExt = await regExt(YoutubeExtractor, {
		cookie: ytCookie,
		filterAutoplayTracks: true,
		disableYTJSLog: true,
	});
	const soundExt = await regExt(SoundcloudExtractor, {});
	const spotExt = await regExt(SpotifyExtractor, {
		market: 'SE',
	});

	if (youtExt) youtExt.priority = 3;
	if (soundExt) soundExt.priority = 2;
	if (spotExt) spotExt.priority = 1;

})();

// eslint-disable-next-line no-unused-vars
onBeforeCreateStream(async (track, queryType, queue) => {
	const daIdents = [SoundcloudExtractor.identifier, AttachmentExtractor.identifier, YoutubeExtractor.identifier, SpotifyExtractor.identifier];
	try {
		if (daIdents.includes(track.extractor.identifier)) return track.extractor?.stream(track);
		return undefined;
	}
	catch {
		return undefined;
	}
});

/**
 * Hidden data JSON object.
 *
 * `hiddenData` stores the following:
 * - User IDs blacklisted from using the ticket system.
 * - "Meet the Staff" data and messages.
 * - Event data, including reminders.
 * */
client.hiddenData = fs.existsSync(`./hidden_data/hidden-data-${nodeEnv === 'production' ? 'prod' : 'dev'}.json`) ? JSON.parse(fs.readFileSync(`./hidden_data/hidden-data-${nodeEnv === 'production' ? 'prod' : 'dev'}.json`)) : {};

/**
 * Function to save hidden data JSON.
 *
 * This is rarely called unless it's vital or during shutdown.
 */
client.saveHiddenData = () => {
	fs.writeFileSync(`./hidden_data/hidden-data-${nodeEnv === 'production' ? 'prod' : 'dev'}.json`, JSON.stringify(client.hiddenData, null, 2));
};

/**
 * Command cooldown collection.
 *
 * Input using the following:
 *
 * ```js
 * if (!cooldowns.has(command.data.name)) {
 * 		cooldowns.set(command.data.name, new Collection());
 * }
 * ```
 * and then follow the [Command cooldown discord.js
 * documentation](https://discordjs.guide/legacy/additional-features/cooldowns)
 * for more info.
 */
client.cooldowns = new Collection();

/**
 * Board management system.
 *
 * This controls the welcome boards, created when a new
 * user joins the server, and booser boards, created when
 * a user subscribes or boosts with Nitro.
 */
client.welcomeboards = new WelcomeBoards();

/**
 * Currency collection.
 *
 * This is the local holder for the currency and XP systems.
 * Long-term and offline storage is held in a `database.sqlite`
 * file - one for development, and one for production.
 *
 * Keep your production and development stuff separate!
 */
client.currency = new Collection();

const levRlFile = `./xpdata/level-roles-${nodeEnv === 'production' ? 'prod' : 'dev'}.json`;
client.levelRoles = fs.existsSync(levRlFile) ? JSON.parse(fs.readFileSync(levRlFile)) : {};

/**
 * Function to modify the XP of a guild member.
 *
 * While it's main name is `add`, it can also subtract a member's XP or levels.
 * This also modifies their currency.
 * @param {GuildMember} mem Guild member object.
 * @param {Number} xp How much XP to modify.
 * @param {Number} lvls How many levels to modify.
 * @param {Boolean} calcX Whether or not we're setting the levels & XP of the user or adding to them. `false` (default) adds `lvls` to the user's level count, `true` sets the level, then sets the XP based on the new level, and finally adds `xp` to the new XP amount.
 * @param {Boolean} alsoCur Whether or not the currency is also affected by the XP raise (false by default).
 * @returns {Promise<Boolean>} Whether or not the user levelled up.
 */
client.addXp = async function(mem, xp = 0, lvls = 0, calcX = false, alsoCur = true) {
	const truthy = await addXpAndCheck(client, mem, xp, lvls, calcX, alsoCur);
	return truthy;
};;

/**
 * Function to modify the XP of a guild member.
 *
 * While it's main name is `add`, it can also subtract a member's currency.
 * This does NOT modify their XP or levels.
 * @param {GuildMember} mem Member to modify amount to. If they don't exist in the database, we create a new database for them.
 * @param {Number} amnt How much currency to modify.
 * @param {Boolean} calc Whether or not we're setting the currency of the user or adding to it. `false` (default) adds `amnt` to the user's currenct, `true` sets the user's currency to `amnt`.
 * @returns The user's data saves in the database.
 */
client.addCur = async (mem, amnt, calc = false) => {
	return modBalance(client, mem, amnt, calc);
};

/**
 * The equation to calculate the amount needed to move on to the next level.
 *
 * The overall function is `f(x) = 2x^2 + 35x + 30`, where `x` is the
 * user's current level and `f(x)` is the amount of total XP needed
 * to get to the next level.
 * @param {Number} lvl The level to calculate.
 * @returns {Number} How much XP is needed to get to `lvl` + 1.
 */
client.xpEquation = (lvl) => {
	return xpEquation(lvl);
};

/**
 * Gathers the user's current currency.
 *
 * **THIS DOES NOT WRITE A NEW ENTRY TO THE DATABASE IF THE USER ISN'T THERE.**
 * @param {GuildMember} member Guild member object.
 * @returns {Array<Number>} Array of user's level, XP, and balance respectively; [0, 0, 0] if the user has no listing.
 */
client.getCurrency = (member) => {
	const user = client.currency.get(member.id);
	return (user ? [user.level, user.xp, user.balance] : [0, 0, 0]);
};

/**
 * Multiplier for the XP gain.
 *
 * This is perfect for enabling random periods of double or triple XP,
 * either via command or with random timing.
 */
client.xpMult = 1;

client.xpMultTimer = createTimer();

client.setDaTimer = () => {
	client.xpMultTimer = createTimer();
};

client.clearDaTimer = () => {
	clearTimeout(client.xpMultTimer);
};

function createTimer() {
	return (function loop() {
		let now = new Date();
		if (Math.floor(Math.random() * 100) >= 99) {
			if (Math.floor(Math.random() * 100) == 79) client.xpMult = 3;
			else client.xpMult = 2;
		}
		else if (client.xpMult != 1) {
			client.xpMult = 1;
		}
		// allow for time passing
		now = new Date();
		// exact ms to next hour interval
		const delay = 3600_000 - (now % 3600_000);
		return setTimeout(loop, delay);
	})();
}

/**
 * Currency cooldown collection.
 *
 * This prevents spamming of messages to try and XP or
 * currency grind.
 */
client.currenCooldowns = new Collection();

global.randomMessageItems = {
	footers: footPool.split('--'),
	pings: pingReg.split('--').concat(new Date().getMonth() >= 11 ? pingSeas.split('--') : []),
};

global.createFooterMessage = function() {
	return 'PubBot, ' + randomMessageItems.footers[Math.round(Math.random() * (randomMessageItems.footers.length - 1))].replace('%a', '\'');
};

/**
 * Command storage for the bot.
 *
 * In `index.js`, the commands are only added if they have two props:
 * - a "data" property, which has the function for a command setup,
 * - an "execute" command, which executes the command when called.
 *
 * BTW: using `client.prototype` in your `index.js` file
 * will make it readable in all files, no matter where you
 * use it. That's how this info is being displayed!
 */
client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		}
		else {
			console.warn(`Startup error. Command ${filePath} missing required "data" or "execute" property.`);
		}
	}
}

// Client event loading.
// Uses the same modular system as commands, only instead of
// "data" we use "name", which is pulling from `Events`
// on discord.js.
const eventsPath = path.join(__dirname, 'events');
const eventFolders = fs.readdirSync(eventsPath);

for (const folder of eventFolders) {
	const eventFoldersPath = path.join(eventsPath, folder);
	const eventFiles = fs.readdirSync(eventFoldersPath).filter((file) => file.endsWith('.js'));;

	for (const file of eventFiles) {
		const filePath = path.join(eventFoldersPath, file);
		const event = require(filePath);
		if (!event.debug || process.execArgv.includes('--inspect')) {
			if ('name' in event && 'execute' in event) {
				if (event.once) {
					client.once(event.name, (...args) => event.execute(...args));
				}
				else {
					client.on(event.name, (...args) => event.execute(...args));
				}
			}
			else {
				console.warn(`Startup error. Event ${filePath} missing required "name" or "execute" property.`);
			}
		}
	}
}

const playEventsPath = path.join(__dirname, 'player-events');
const playEventFiles = fs.readdirSync(playEventsPath).filter((file) => file.endsWith('.js'));

for (const file of playEventFiles) {
	const filePath = path.join(playEventsPath, file);
	const event = require(filePath);
	if (!event.debug || process.execArgv.includes('--inspect')) {
		if (event.events) {
			player.events.on(event.name, (...args) => event.execute(...args));
		}
		else {
			player.on(event.name, (...args) => event.execute(...args));
		}
	}
}

// Process events. Utilized for graceful shutdowns.
process.on('SIGINT', async () => {
	console.log('Received SIGINT shutdown request.');
	await shutdownProtocol();
});

process.on('SIGTERM', async () => {
	console.log('Received SIGTERM shutdown request.');
	await shutdownProtocol();
});

process.on('SIGABRT', async () => {
	console.log('Received SIGABRT shutdown request.');
	await shutdownProtocol();
});

process.on('uncaughtException', (error) => {
	console.error('Uncaught exception: ', error);
});

process.on('unhandledRejection', (reason) => {
	console.error('Unhandled promise rejection: ', reason);
});

process.on('message', async function(msg) {
	if (msg == 'shutdown') {
		console.log('Closing all connections...');
		await shutdownProtocol();
	}
});


/**
 * Shutdown function. Used for graceful shutdowns.
 *
 * This code, in the order shown, performs the following:
 * - Sets a timer for a possible force shutdown (last case scenario).
 * - Saves `hidden-data.json` for long-term storage of certain items.
 * - Saves all `client.currency` entries to the database.
 * - Deletes staffboard message to prevent clutter.
 * - Performs a graceful shutdown with a happy message! :)
 */
async function shutdownProtocol() {
	setTimeout(() => {
		console.warn('Process took too long; now forcing shutdown.');
		process.exit(1);
	}, 10_000);
	client.saveHiddenData();
	for (curr in client.currency.keys()) {
		const daUser = client.currency.get(curr);
		await daUser.save();
	}
	await client.staffboard.deleteBoard();

	await console.log('Shutdown protocol complete. Thank you for using PubBot!');
	process.exit(0);
};

client.login(token);