const { Events } = require('discord.js');

module.exports = {
	name: Events.Debug,
	debug: true,
	execute: console.debug,
};