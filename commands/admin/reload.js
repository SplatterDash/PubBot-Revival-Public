const { SlashCommandBuilder } = require('discord.js');
const path = require('node:path');
const fs = require('node:fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reload')
		.setDescription('Reloads a command.')
		.addStringOption((option) => option.setName('command').setDescription('The command to reload.').setRequired(true))
		.setDefaultMemberPermissions(0),

	modChan: true,
	async execute(interaction) {
		const commandName = interaction.options.getString('command', true).toLowerCase();
		const command = interaction.client.commands.get(commandName);

		if (!command) {
			return interaction.reply(`There is no command named \`${commandName}\`!`);
		}

		try {
			const commandFolders = path.resolve('./commands');
			const commandFolder = fs.readdirSync(commandFolders).filter((fold) => fs.readdirSync(path.join(commandFolders, fold)).filter((file) => file === `${command.data.name}.js`).length > 0);
			const filePath = path.join(path.join(commandFolders, commandFolder[0]), `${command.data.name}.js`);

			delete require.cache[filePath];

			const newCommand = require(filePath);
			interaction.client.commands.set(newCommand.data.name, newCommand);
			await interaction.reply(`Command \`${newCommand.data.name}\` was reloaded successfully.`);
		}
		catch (error) {
			console.error(error);
			await interaction.reply(`Error while reloading ${command.data.name}:\n\n\`${error.message}\``);
		}
	},
};