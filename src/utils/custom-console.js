const fs = require('node:fs');
const path = require('node:path');
const { NODE_ENV: nodeEnv } = process.env;

const logFunc = console.log;
const wrnFunc = console.warn;
const errFunc = console.error;
const debFunc = console.debug;

const logFolder = path.resolve(__dirname, '..', '..', 'logs');
const logFilePath = path.join(logFolder, `log-${nodeEnv === 'production' ? 'prod' : 'dev'}.txt`);

function changeConsole() {
	if (!fs.existsSync(logFolder)) fs.mkdirSync(logFolder);

	console.log = (...args) => {
		const dat = new Date().toISOString();
		logFunc('\x1b[96m[%s] \x1b[30m\x1b[46m[INFO]\x1b[0m    \x1b[36m', dat, ...args, '\x1b[0m');
		fs.appendFileSync(logFilePath, `[${dat}] [INFO]    ` + args.join('') + '\n');
	};
	console.error = (...args) => {
		const dat = new Date().toISOString();
		errFunc('\x1b[1m\x1b[91m[%s] \x1b[41m\x1b[30m[ERROR]\x1b[0m   \x1b[31m', dat, ...args, '\x1b[0m');
		fs.appendFileSync(logFilePath, `[${dat}] [ERROR]   ` + args.join('') + '\n');
	};

	console.warn = (...args) => {
		const dat = new Date().toISOString();
		wrnFunc('\x1b[1m\x1b[93m[%s] \x1b[30m\x1b[43m[WARNING]\x1b[0m \x1b[33m', dat, ...args, '\x1b[0m');
		fs.appendFileSync(logFilePath, `[${dat}] [WARNING] ` + args.join('') + '\n');
	};

	console.debug = (...args) => {
		const dat = new Date().toISOString();
		debFunc('\x1b[1m\x1b[95m[%s] \x1b[30m\x1b[45m[DEBUG]\x1b[0m   \x1b[35m', dat, ...args, '\x1b[0m');
		if (process.execArgv.includes('--inspect') || process.argv.includes('--inspect')) fs.appendFileSync(logFilePath, `[${dat}] [DEBUG]   ` + args.join('') + '\n');
	};
};

module.exports = { changeConsole };