const { PlayerEvent } = require('discord-player');

module.exports = {
	name: PlayerEvent.Debug,
	events: true,
	debug: true,
	execute(queue, message) {
		console.debug('(' + queue + ') ' + message);
	},
};