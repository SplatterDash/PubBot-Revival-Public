const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');
const { AttachmentBuilder } = require('discord.js');
const { request } = require('undici');
const path = require('node:path');
const { createUnifiedEmbed } = require('../utils/createUnifiedEmbed');
const { AssetPathAbsolute } = require('../utils/assetPaths.js');


class StaffBoard {
	constructor(client) {
		const { BOARD_ID: boardRoom, GUILD_ID: guildId, BARBACK_ROLE: barbackId, BOUNCER_ROLE: bouncerId, HADO_ID: hadoId } = process.env;

		this.barbackArray = [];
		this.bouncerArray = [];

		this.staffRoleArray = [];
		this.staffRoleArray.push(barbackId, bouncerId);
		this.hadoIdStr = hadoId;

		this.boardGuild = client.guilds.cache.get(guildId);
		this.boardChannel = this.boardGuild.channels.cache.get(boardRoom);

		if (!this.boardChannel) {
			console.error('STARTUP ERROR: No channel found for staff board.');
		}

    	GlobalFonts.registerFromPath(path.join(AssetPathAbsolute, 'fonts', 'comicbd.ttf'), 'Comic Sans MS');

		GlobalFonts.registerFromPath(path.join(AssetPathAbsolute, 'fonts', 'PUSAB__.otf'), 'Pusab');

		this.boardImagePath = path.join(AssetPathAbsolute, 'images', 'board');

		this.headerSize = [550, 200];

		this.reloadBoard(true);
	}

	async reloadBoard(opening = false) {
		if (!this.boardChannel) {
			console.error('No channel found for staff board. Stopping staff board regeneration.');
			return;
		}

		if (opening) {
			await this.boardGuild.members.fetch({ force: true })
				.then(console.log('Successfully obtained first-time staff member cache.'))
				.catch((err) => console.error(err));
			this.boardChannel.messages.fetch({ force: true })
				.then(console.log('Successfully obtained first-time staff message channel cache.'))
				.catch((err) => console.error(err));
		}

		await this.boardGuild.members.cache.filter((i) => {
			if (i.roles.cache.has(this.staffRoleArray[0])) {
				this.barbackArray.push(i);
			}
			else if (i.roles.cache.has(this.staffRoleArray[1])) {
				this.bouncerArray.push(i);
			}
			return true;
		});

		const canvas = createCanvas(1919, 1279);
   		const ctx = canvas.getContext('2d');

		await this.loadAnImage(ctx, path.join(this.boardImagePath, 'wallbg.jpg'), 0, 0, canvas.width, canvas.height);
		await this.loadAnImage(ctx, path.join(this.boardImagePath, 'barlab_tend.png'), 50, 0, this.headerSize[0], this.headerSize[1]);
		await this.loadAnImage(ctx, path.join(this.boardImagePath, 'barlab_back.png'), 650, 0, this.headerSize[0], this.headerSize[1]);
		await this.loadAnImage(ctx, path.join(this.boardImagePath, 'barlab_boun.png'), 1230, 0, this.headerSize[0], this.headerSize[1]);

		await this.plotMember('bartender', this.boardGuild.members.cache.get(this.hadoIdStr), 250, 500, 200, 200, ctx);
		for (const barback of this.barbackArray) {
			await this.plotMember('barback', barback, 900 - ((this.barbackArray.length <= 5) ? 0 : (150 - (300 * (Math.floor(this.barbackArray.indexOf(barback) / 5))))), 200 + (200 * ((this.barbackArray.indexOf(barback) == 0) ? 0 : (this.barbackArray.indexOf(barback) % 5))), 120, 120, ctx);
		};
		for (const bouncer of this.bouncerArray) {
			await this.plotMember('bouncer', bouncer, 1475 - ((this.bouncerArray.length <= 5) ? 0 : (150 - (300 * (Math.floor(this.bouncerArray.indexOf(bouncer) / 5))))), 200 + (200 * ((this.bouncerArray.indexOf(bouncer) == 0) ? 0 : (this.bouncerArray.indexOf(bouncer) % 5))), 120, 120, ctx);
		};

		const attachment = new AttachmentBuilder(await canvas.encodeSync('png'), { name: 'yeoldehadopub-stafflist.png' });

		const daEmbed = createUnifiedEmbed(this.boardGuild, {
			title: 'This is the list of all current staff members, updated regularly.',
			attach: 'attachment://yeoldehadopub-stafflist.png',
			noTimestamp: true,
			noFooter: true,
		});

		if (!opening) {
			const previousMessage = this.boardChannel.messages.cache.filter((m) => (m.author.id == this.boardGuild.members.me.id) && (m.embeds.length > 0));
			previousMessage.last().edit({ embeds: [daEmbed], files: [attachment] });
		}
		else {
			this.boardChannel.send({ embeds: [daEmbed], files: [attachment] });
		}

		this.barbackArray.length = 0;
		this.bouncerArray.length = 0;
	}

	async plotMember(identifier, member, x, y, sizex, sizey, context) {
		const arcx = x + (identifier == 'bartender' ? 100 : 60), arcy = y + (identifier == 'bartender' ? 100 : 60), arcd = (identifier == 'bartender' ? 100 : 60);
		if (identifier == 'bartender') context.save();
		context.beginPath();
		context.arc(arcx, arcy, arcd, 0, Math.PI * 2, true);
		context.closePath();
		context.clip();
		const { body } = await request(member.displayAvatarURL({ extension: 'jpg' }));
		await this.loadAnImage(context, await body.arrayBuffer(), x, y, sizex, sizey)
			.then(() => {
				context.restore();

				const servername = member.nickname ?? member.user.displayName;
				const username = member.user.displayName;

				context.font = this.applyText(context, servername, 'Pusab', identifier == 'bartender' ? 75 : 50);
				context.fillStyle = (identifier == 'bartender' ? member.roles.highest.hexColor : member.roles.cache.get(this.staffRoleArray[identifier == 'barback' ? 0 : 1]).hexColor);
				context.fillText(servername, x + ((arcx - x) / 2) + (arcd / 2) - (context.measureText(servername).width / 2), y + (identifier == 'bartender' ? 260 : 150));

				if (servername != username) {
					context.font = this.applyText(context, username, 'Comic Sans MS', identifier == 'bartender' ? 51 : 30);
					context.fillStyle = (identifier == 'bartender' ? member.roles.highest.hexColor : member.roles.cache.get(this.staffRoleArray[(identifier == 'barback' ? 0 : 1)]).hexColor);
					context.fillText(username, x + ((arcx - x) / 2) + (arcd / 2) - (context.measureText(username).width / 2), y + (identifier == 'bartender' ? 300 : 180));
				}
				context.save();
			})
			.catch(console.error);
	}

	async loadAnImage(context, filepath, x, y, sizex, sizey) {
		const daImage = await loadImage(filepath);
		context.drawImage(daImage, x, y, sizex, sizey);
	}

	applyText(context, text, fontface, initsize) {
		let fontSize = initsize;

		if (initsize < 51) {
			do {
				context.font = `${(fontSize -= 10)}px ${fontface}`;
			} while (context.measureText(text).width > 400);
		}
		else {
			context.font = `${fontSize}px ${fontface}`;
		}

		return context.font;
	}

	async deleteBoard() {
		const boardMessage = this.boardChannel.messages.cache.filter((m) => (m.author.id == this.boardChannel.guild.members.me.id) && (m.embeds.length > 0)).last();
		await boardMessage.delete();
	}
}

module.exports = StaffBoard;