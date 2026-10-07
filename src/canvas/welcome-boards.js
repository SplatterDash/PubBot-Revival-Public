const { GlobalFonts, createCanvas, loadImage } = require('@napi-rs/canvas');
const { AttachmentBuilder } = require('discord.js');
const { WELCOME_CHANNEL: welcomeId } = process.env;
const { request } = require('undici');
const path = require('node:path');
const { AssetPathAbsolute } = require('../utils/assetPaths.js');

class WelcomeBoards {
	constructor() {
		GlobalFonts.registerFromPath(path.join(AssetPathAbsolute, 'fonts', 'comicbd.ttf'), 'Comic Sans');

		GlobalFonts.registerFromPath(path.join(AssetPathAbsolute, 'fonts', 'PUSAB__.otf'), 'Pusab');

		this.baseImagePath = path.join(AssetPathAbsolute, 'images', 'welcome-boost');
	}

	async createBoard(member, indicator = 'welcome') {
		const channel = member.guild.channels.cache.get(welcomeId);
		if (!channel) {
			console.warn('Unable to find welcome channel.');
			return;
		}

		const canvas = createCanvas(700, 250);
		const ctx = canvas.getContext('2d');

		const loadAnImage = async (cntx, imagepath, x, y, sizex, sizey) => {
			const daImage = await loadImage(imagepath);
			cntx.drawImage(daImage, x, y, sizex, sizey);
		};

		await loadAnImage(ctx, path.join(this.baseImagePath, `${indicator == 'boost' ? 'boost' : 'welcome'}_back.jpg`), 0, 0, 700, 250);
		ctx.strokeStyle = '#0099ff';

	    ctx.strokeRect(0, 0, canvas.width, canvas.height);

		const applyText = (context, text, fontface, initsize) => {
			let fontSize = initsize;

			do {
				context.font = `${(fontSize -= 10)}px ${fontface}`;
			} while (context.measureText(text).width > 700);

			return context.font;
		};

		ctx.fillStyle = '#ffffff';
		const topText = `${indicator == 'boost' ? 'Raise a glass to' : 'Welcome'} ${member.user.displayName}!`;
		ctx.font = applyText(ctx, topText, 'Comic Sans MS', 45);
		ctx.fillText(topText, 350 - (ctx.measureText(topText).width / 2), 200, 700);

		const bottText = (indicator == 'boost' ? `Thank you for boosting ${member.guild.name}` : `${member.guild.name} - Currently Serving ${member.guild.memberCount} Patrons`);
		ctx.font = applyText(ctx, bottText, 'Pusab', 25);
		ctx.fillText(bottText, 350 - (ctx.measureText(bottText).width / 2), 225, 700);

		ctx.save();
		ctx.beginPath();
		ctx.arc(360, 88, 63, 0, Math.PI * 2, true);
		ctx.closePath();
		ctx.clip();
		const { body } = await request(member.displayAvatarURL({ extension: 'jpg' }));
		await loadAnImage(ctx, await body.arrayBuffer(), 297, 25, 125, 125);

		const attachment = new AttachmentBuilder(await canvas.encodeSync('png'), { name: `yeoldehadopub-${indicator}-${member.user.displayName}.png` });
		channel.send({ content: `<@${member.id}>`, files: [attachment] });
	}
}

module.exports = WelcomeBoards;