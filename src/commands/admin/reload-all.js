const { SlashCommandBuilder } = require('discord.js');
const path = require('node:path');
const fs = require('node:fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reload-all')
		.setDescription('Reloads all commands.')
		.setDefaultMemberPermissions(0),

	modChan: true,
	async execute(interaction) {
		await interaction.deferReply();
		interaction.client.commands.each((v, k) => {
			try {
				const commandFolders = path.resolve('./commands');
				const commandFolder = fs.readdirSync(commandFolders).filter((fold) => fs.readdirSync(path.join(commandFolders, fold)).filter((file) => file === `${k}.js`).length > 0);
				const filePath = path.join(path.join(commandFolders, commandFolder[0]), `${k}.js`);

				delete require.cache[filePath];

				const newCommand = require(filePath);
				interaction.client.commands.set(k, newCommand);
			}
			catch (error) {
				console.error(error);
			}
		});
		await interaction.editReply('All commands have been reloaded successfully.');
	},
};