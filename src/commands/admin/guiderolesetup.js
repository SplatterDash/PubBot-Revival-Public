const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, TextDisplayBuilder, ContainerBuilder, SeparatorBuilder, SeparatorSpacingSize, MessageFlags } = require('discord.js');
// eslint-disable-next-line no-unused-vars
const { BOARD_ID: boardChan, ROLEINFO_CHAN: rolesChan, SELFASSIGN_CHAN: selfAssigns, COLORS_CHAN: colorsChan } = process.env;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('guiderolesetup')
		.setDescription('Creates messages in either the guide or role channels for interactions.')
		.setDefaultMemberPermissions(0)
		.addStringOption((option) => option.setName('location').setDescription('The location of the guide messages.').setRequired(true).setChoices({
			name: '#guide',
			value: 'guide',
		}, {
			name: '#roles',
			value: 'roles',
		}, {
			name: '#self-assign',
			value: 'self-assign',
		}, {
			name: '#colors',
			value: 'colors',
		})),

	hadoOnly: true,
	/**
		 *
		 * @param {import('discord.js').ChatInputCommandInteraction} interaction
		 */
	async execute(interaction) {
		interaction.reply({ content: 'Creating channels...', flags: MessageFlags.Ephemeral });
		switch (interaction.options.getString('location')) {
		case 'guide': {
			const components = [
				new ContainerBuilder()
					.setAccentColor(16705372)
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent('# Welcome to the Pub!\n**We hope you enjoy your stay.** Grab a seat, have a drink, make yourself comfortable. If you\'re worried that you\'ve come to the wrong place, this is my public hangout joint. We\'re making a grand re-opening to accommodate my return to Twitch. It\'s a pleasure to be back in business! If you\'re interested in being a regular, allow me to explain how things work around here.\n\n**Permanent Invite Link:** https://discord.gg/rNAZeDh'),
					),
				new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large).setDivider(false),
				new TextDisplayBuilder().setContent('# __CHANNELS__'),
				new TextDisplayBuilder().setContent('## BULLETIN\n*Everything you need to be familiar with that doesn\'t get frequently updated is here, including rules and regulations.*'),
				new ContainerBuilder()
					.setAccentColor(16705372)
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent('⁠<#704835804383674419> - The law of the land! Follow these to a tee or risk getting bounced.\n⁠<#775442648072323092> - You are here! This is a fully elaborated rundown of where to find everything you need here. There\'s a bathroom down the hall to the left.\n<#1468475444666826754> - Learn a little something about our staff! They\'re more than just enforcers - they\'re people too!\n⁠<#818219926757441556> - A fully broken down explanation of all of the titles we call ourselves.\n<#704901771910447205> - Go here to designate your preferred pronouns, and sign up to be notified about things we do here that may interest you.\n<#835229555236143125> - Here, Nitro Patrons can customize their flair to their liking.'),
					),
				new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
				new TextDisplayBuilder().setContent('## NEWS\n*Everything you may want to be familiar with that does get frequently updated here, including announcements and events.*'),
				new ContainerBuilder()
					.setAccentColor(16705372)
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent('<#704835834322485288> - Pertinent changes to how things work around the joint, promotions/demotions, and polls to gather our customers\' opinions will be updated here.\n<#704835957207203870> - Those interested can be put on the Call List to be notified when I go live on Twitch. Refer to the Roles section for more information.\n<#767095755546034186> - I do full-length analyses of your GD levels here; that is, if you get the lucky ticket. When has gambling ever hurt anybody? ...Don\'t answer that.'),
					),
				new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
				new TextDisplayBuilder().setContent('## FRONT\n*The front of the House is where the customers are allowed to be. You\'ll find your chats here.*'),
				new ContainerBuilder()
					.setAccentColor(16705372)
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent('<#704873808133095524> - This is your all-purpose designated mingling area. Veterans, Associates, and Regulars can share images here in moderation, but most of the activity should be conversation. \n<#705167229393698816> - You have to make reservations to get in here! Becoming a Patron or an Associate will get you a VIP pass to talk here, which will be valid so long as you remain a Patron or Associate.\n<#1199020538568376461> - A little place to be real and sober.\n<#763036048950820895> - Your designated machine shop. Please don\'t operate heavy machinery anywhere else in the bar, it gets messy quick.'),
					),
				new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
				new TextDisplayBuilder().setContent('## GALLERY\n*In here y\'all can show off your artistic prowess.*'),
				new ContainerBuilder()
					.setAccentColor(16705372)
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent('<#763153518583349248> - Share in-progress GD projects here.\n<#709193627850768404> - There\'s plenty of room here to share all of your memories worth a thousand words. All customers are welcome to share rule-abiding pictures and videos here.\n#<454470658550792192> - Share your drawings, paintings, graphic design, videos, photography, and GFX here.\n<#797744956017475585> - Share music you are working on here.'),
					),
				new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
			];

			const components2 = [
				new TextDisplayBuilder().setContent('## EVENTS\n*If you\'re in the mood for poker night with the gang, or you\'re just looking to play games with some new people as a means of making new friends, we might have just the thing for you here. Game-specific events and conversations can occur here in a way that will not be disruptive to, nor disrupted by an ongoing conversation elsewhere.*'),
				new ContainerBuilder()
					.setAccentColor(16705372)
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent('<#751575056752181308> - All the latest word about our Game Nights, events where we set aside some time to play games together! This is almost entirely operated by <@333092050645811200>; you should go to him if you have any questions.\n<#726209774286536744> - Discussion about matters specific to Game Night has a convenient home here.\n<#858396891564605440> - Our voice gathering specific for Game Nights!\n<#862375030384754718> - For any *really* special events that need a stage (like karaoke), this is the place to be!'),
					),
				new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
				new TextDisplayBuilder().setContent('## HIGHLIGHTS\n*We don\'t just put anything on the fridge - these are some of the best memories made here through all the drinks!*'),
				new ContainerBuilder()
					.setAccentColor(16705372)
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent('<#839624053181906954> - Some of the best art posted by members of the Pub.\n<#821087197754032129> - Videos and memories from gameplay and gatherings in the Pub.\n<#839623723429658656> - Some of the most fond memories from the chats in the Pub and on streams.'),
					),
				new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
				new TextDisplayBuilder().setContent('## VOICE\n*This is the only corner of the bar where you can TRULY make some noise! Stop by every now and then if you feel in the mood.*'),
				new ContainerBuilder()
					.setAccentColor(16705372)
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent('<#707006937728024597> - If you\'re the quiet type, you can communicate with your mates at The Bar here while you listen.\n<#799221434542981142> - Pop your commands to PubBot in here and let the good times roll!\n<#242175525164941315> - The best seats in the house! To avoid crowding, the space here is limited. \n<#457142430525816844> - Jam out to your favorite tunes. Plug your requests into PubBot and dance the night away!\n<#243221452940115969> - Some people could make better use out of your seat at the bar, especially if you\'re so drunk you can\'t speak. Idling for too long will get you escorted Out Back. An Uber will be here shortly to take you home.'),
					),
			];

			interaction.guild.channels.fetch(boardChan, { force: true })
				.then(async (chan) => {
					await chan.send({
						components: components,
						flags: MessageFlags.IsComponentsV2,
						allowedMentions: { parse: [] },
					});
					await chan.send({
						components: components2,
						flags:MessageFlags.IsComponentsV2,
						allowedMentions: { parse: [] },
					});
				})
				.catch(console.error);
			break;
		}
		case 'roles': {
			break;
		}
		case 'self-assign': {
			const components = [
				new TextDisplayBuilder().setContent('# __NOTIFICATIONS__\n*Here you can register yourself to be instantly notified about things that may interest you!*'),
				new ContainerBuilder()
					.setAccentColor(16705372)
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent('📝 **Call List**  - You will be tagged in ⁠content when I go live on Twitch or upload content elsewhere. Visitors are always welcome!\n\n🎲 **Game Night**  - You will be tagged in ⁠game-news when our staff coordinate Game Nights. Come play with us! \n\n📰 **Newsletter** - You will be tagged in ⁠announcements about important changes to the server. This includes voting, pertinent renovations, special events, and changes to the rules. This does not include promotions or milestones achieved by our establishment or the community that surrounds it.'),
					),
				new ActionRowBuilder()
					.addComponents(
						new ButtonBuilder()
							.setStyle(ButtonStyle.Primary)
							.setCustomId('roles-calllist')
							.setLabel('Call List')
							.setEmoji({
								name: '📝',
							}),
						new ButtonBuilder()
							.setStyle(ButtonStyle.Primary)
							.setCustomId('roles-gamenight')
							.setLabel('Game Night')
							.setEmoji({
								name: '🎲',
							}),
						new ButtonBuilder()
							.setStyle(ButtonStyle.Primary)
							.setLabel('Newsletter')
							.setCustomId('roles-newsletter')
							.setEmoji({
								name: '📰',
							}),
					),
				new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
				new TextDisplayBuilder().setContent('# __PRONOUNS__\nWe want to ensure you feel comfortable and respected here. Feel free to assign yourself the pronouns that you feel most correctly describe you, so that new friends you make here won\'t accidentally misgender you. You do not have to pick just one, or any at all.'),
				new ActionRowBuilder()
					.addComponents(
						new ButtonBuilder()
							.setStyle(ButtonStyle.Primary)
							.setLabel('He/Him')
							.setCustomId('roles-hehim')
							.setEmoji({
								name: '♂️',
							}),
						new ButtonBuilder()
							.setStyle(ButtonStyle.Primary)
							.setCustomId('roles-sheher')
							.setLabel('She/Her')
							.setEmoji({
								name: '♀️',
							}),
						new ButtonBuilder()
							.setStyle(ButtonStyle.Primary)
							.setLabel('They/Them')
							.setCustomId('roles-theythem'),
					),
			];
			interaction.guild.channels.fetch(selfAssigns, { force: true })
				.then(async (chan) => {
					await chan.send({
						components: components,
						flags: MessageFlags.IsComponentsV2,
					});
				})
				.catch(console.error);
			break;
		}
		case 'colors': {
			const components = [
				new TextDisplayBuilder().setContent(' # __COLORS __\nAs a token of our appreciation for being a Patron, we\'d like to give you some flair options. React to this message with one of the following roles in order to change your name to that color. Choosing another color while you already have one will automatically remove and replace the old color with the new one. '),
				new ActionRowBuilder()
					.addComponents(
						new ButtonBuilder()
							.setStyle(ButtonStyle.Primary)
							.setLabel('Red')
							.setCustomId('roles-red')
							.setEmoji({
								name: '🟥',
							}),
						new ButtonBuilder()
							.setStyle(ButtonStyle.Primary)
							.setLabel('Orange')
							.setCustomId('roles-orange')
							.setEmoji({
								name: '🟧',
							}),
						new ButtonBuilder()
							.setStyle(ButtonStyle.Primary)
							.setLabel('Yellow')
							.setCustomId('roles-yellow')
							.setEmoji({
								name: '🟨',
							}),
						new ButtonBuilder()
							.setStyle(ButtonStyle.Primary)
							.setLabel('Green')
							.setCustomId('roles-green')
							.setEmoji({
								name: '🟩',
							}),
					),
				new ActionRowBuilder()
					.addComponents(
						new ButtonBuilder()
							.setStyle(ButtonStyle.Primary)
							.setLabel('Blue')
							.setEmoji({
								name: '🟦',
							})
							.setCustomId('roles-blue'),
						new ButtonBuilder()
							.setStyle(ButtonStyle.Primary)
							.setLabel('Violet')
							.setEmoji({
								name: '🟪',
							})
							.setCustomId('roles-violet'),
						new ButtonBuilder()
							.setStyle(ButtonStyle.Primary)
							.setLabel('White')
							.setEmoji({
								name: '⬜',
							})
							.setCustomId('roles-white'),
						new ButtonBuilder()
							.setStyle(ButtonStyle.Primary)
							.setLabel('Black')
							.setEmoji({
								name: '⬛',
							})
							.setCustomId('roles-black'),
					),
			];

			interaction.guild.channels.fetch(colorsChan, { force: true })
				.then(async (chan) => {
					await chan.send({
						components: components,
						flags: MessageFlags.IsComponentsV2,
					});
				})
				.catch(console.error);
			break;
		}
		}
	},
};