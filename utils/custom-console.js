const logFunc = console.log;
const wrnFunc = console.warn;
const errFunc = console.error;
const debFunc = console.debug;


function changeConsole() {
	console.log = (...args) => {
		logFunc('\x1b[96m[%s] \x1b[30m\x1b[46m[INFO]\x1b[0m    \x1b[36m', new Date().toISOString(), ...args, '\x1b[0m');
	};
	console.error = (...args) => {
		errFunc('\x1b[1m\x1b[91m[%s] \x1b[41m\x1b[30m[ERROR]\x1b[0m   \x1b[31m', new Date().toISOString(), ...args, '\x1b[0m');
	};

	console.warn = (...args) => {
		wrnFunc('\x1b[1m\x1b[93m[%s] \x1b[30m\x1b[43m[WARNING]\x1b[0m \x1b[33m', new Date().toISOString(), ...args, '\x1b[0m');
	};

	console.debug = (...args) => {
		debFunc('\x1b[1m\x1b[95m[%s] \x1b[30m\x1b[45m[DEBUG]\x1b[0m   \x1b[35m', new Date().toISOString(), ...args, '\x1b[0m');
	};
};

module.exports = { changeConsole };