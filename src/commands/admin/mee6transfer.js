const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('mee6transfer')
		.setDescription('Transfer XP and levels from a user\'s Mee6 listing.')
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
		.addUserOption((option) => option.setName('user').setDescription('The user to transfer.').setRequired(true))
		.addIntegerOption((option) => option.setName('level').setDescription('The user\'s current Mee6 level.').setRequired(true))
		.addIntegerOption((option) => option.setName('xp').setDescription('The user\'s current Mee6 xp.').setRequired(true)),

	modChan: true,
	async execute(interaction) {
		const { client, options } = interaction;
		const levelData = [100, 255, 475, 770, 1150, 1625, 2205, 2900, 3720, 4675, 5775, 7030, 8450, 10045, 11825, 13800, 15980, 18375, 20995, 23850, 26950, 30305, 33925, 37820, 42000, 46475, 51255, 56350, 61770, 67525, 73625, 80080, 86900, 94095, 101675, 109650, 118030, 126825, 136045, 145700, 155800, 166355, 177375, 188870, 200850, 213325, 226305, 239800, 253820, 268375, 283475, 299130, 315350, 332145, 349525, 367500, 386080, 405275, 425095, 445550, 466650, 488405, 510825, 533920, 557700, 582175];

		const curLvl = options.getInteger('level');
		const curXp = options.getInteger('xp');
		const levProg = (levelData[curLvl] - curXp) / (levelData[curLvl] - levelData[curLvl - 1]);
		const newXpAdd = Math.round((client.xpEquation(curLvl) - client.xpEquation(curLvl - 1)) * levProg);
		await client.addXp(options.getMember('user'), newXpAdd, curLvl, true, true);
		await client.addCur(options.getMember('user'), client.currency.get(options.getMember('user').id).xp, true);
		await interaction.reply(`User ${options.getMember('user').displayName} has been set to **${newXpAdd}** XP in addition to the XP required for level **${curLvl}**.`);
	},
};