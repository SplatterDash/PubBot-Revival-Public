const { Events } = require('discord.js');
const { createAuditLog } = require('../../utils/createAuditLog');

module.exports = {

	name: Events.GuildAuditLogEntryCreate,

	/**
	 *
	 * @param {import('discord.js').GuildAuditLogsEntry} alEntry
	 * @param {import('discord.js').Guild} guild
	 */
	async execute(alEntry, guild) {
		let title = '';
		const fields = [];

		switch (alEntry.action) {
		case 10: {
			title = 'Channel Created';
			fields.push({
				name: 'Name',
				value: alEntry.changes['new'].name,
				inline: true,
			});
			break;
		}
		case 11: {
			title = 'Channel Settings Updated';
			fields.push({
				name: 'Channel Name',
				value: alEntry.changes['new'].name,
				inline: true,
			}, {
				name: 'Changed Value',
				value: alEntry.changes['key'],
				inline: true,
			}, {
				name: 'Before',
				value: alEntry.changes['old'],
			}, {
				name: 'After',
				value: alEntry.changes['new'],
				inline: true,
			});
			break;
		}
		case 12: {
			title = 'Channel Deleted';
			fields.push({
				name: 'Name',
				value: alEntry.changes['old'].name,
				inline: true,
			});
			break;
		}
		case 13: {
			title = 'Channel Permission Overwrite Added';
			fields.push({
				name: 'Channel Name',
				value: alEntry.changes['new'].name,
				inline: true,
			}, {
				name: 'Targeted Role/User',
				value: alEntry.extra.name ?? alEntry.extra.displayName,
				inline: true,
			}, {
				name: 'Value',
				value: alEntry.changes['new'],
			});
			break;
		}
		case 14: {
			title = 'Channel Permission Overwrite Changed';
			fields.push({
				name: 'Channel Name',
				value: alEntry.changes['new'].name,
				inline: true,
			}, {
				name: 'Targeted Role/User',
				value: alEntry.extra.name ?? alEntry.extra.displayName,
				inline: true,
			}, {
				name: 'Before',
				value: alEntry.changes['old'],
			}, {
				name: 'After',
				value: alEntry.changes['new'],
				inline: true,
			});
			break;
		}
		case 15: {
			title = 'Channel Permission Overwrite Deleted';
			fields.push({
				name: 'Channel Name',
				value: alEntry.changes['new'].name,
				inline: true,
			}, {
				name: 'Targeted Role/User',
				value: alEntry.extra.name ?? alEntry.extra.displayName,
				inline: true,
			});
			break;
		}
		case 20: {
			title = 'Member Kicked';
			fields.push({
				name: 'User',
				value: `${alEntry.target} (${alEntry.targetId})`,
				inline: true,
			}, {
				name: 'Reason',
				value: alEntry.reason,
				inline: true,
			});
			break;
		}
		case 21: {
			title = 'Members Pruned';
			fields.push({
				name: 'Number of Members Removed',
				value: alEntry.extra.removed,
				inline: true,
			}, {
				name: 'Days',
				value: alEntry.extra.days,
				inline: true,
			});
			break;
		}
		case 22: {
			title = 'Member Banned';
			fields.push({
				name: 'User',
				value: `${alEntry.target} (${alEntry.targetId})`,
				inline: true,
			}, {
				name: 'Reason',
				value: alEntry.reason,
				inline: true,
			});
			break;
		}
		case 23: {
			title = 'Member Unbanned';
			fields.push({
				name: 'User',
				value: `<@${alEntry.targetId}> (${alEntry.targetId})`,
				inline: true,
			}, {
				name: 'Reason',
				value: alEntry.reason,
				inline: true,
			});
			break;
		}
		case 25: {
			title = 'Member Role Change';
			fields.push({
				name: 'User',
				value: `${alEntry.target} (${alEntry.targetId})`,
				inline: true,
			}, {
				name: 'Role Changed',
				value: `<@${alEntry.changes['new'].id}>`,
				inline: true,
			});
			break;
		}
		case 30: {
			title = 'Role Created';
			fields.push({
				name: 'Role',
				value: alEntry.target,
				inline: true,
			}, {
				name: 'Role ID',
				value: alEntry.targetId,
				inline: true,
			});
			break;
		}
		case 31: {
			title = 'Role Updated';
			fields.push({
				name: 'Role',
				value: alEntry.target,
				inline: true,
			}, {
				name: 'Role ID',
				value: alEntry.targetId,
				inline: true,
			});
			break;
		}
		case 32: {
			title = 'Role Deleted';
			fields.push({
				name: 'Role Name',
				value: alEntry.changes['old'].name,
				inline: true,
			}, {
				name: 'Role ID',
				value: alEntry.changes['old'].id,
				inline: true,
			});
			break;
		}
		case 60: {
			title = 'Emoji Created';
			fields.push({
				name: 'Emoji Name',
				value: `${alEntry.target.name} (:${alEntry.target.name}:)`,
				inline: true,
			}, {
				name: 'Emoji ID',
				value: alEntry.targetId,
				inline: true,
			});
			break;
		}
		case 61: {
			title = 'Emoji Updated';
			fields.push({
				name: 'Emoji Name',
				value: `${alEntry.target.name} (:${alEntry.target.name}:)`,
				inline: true,
			}, {
				name: 'Emoji ID',
				value: alEntry.targetId,
				inline: true,
			});
			break;
		}
		case 62: {
			title = 'Emoji Deleted';
			fields.push({
				name: 'Emoji Name',
				value: alEntry.changes['old'].name,
				inline: true,
			}, {
				name: 'Emoji ID',
				value: alEntry.changes['old'].id,
				inline: true,
			});
			break;
		}
		case 72: {
			title = 'Message Deleted by Moderator';
			fields.push({
				name: 'Content',
				value: alEntry.target?.content ?? 'Unable to fetch content.',
				inline: true,
			}, {
				name: 'Author',
				value: alEntry.target?.author ?? 'Unable to fetch author.',
				inline: true,
			}, {
				name: 'ID',
				value: alEntry.targetId,
				inline: true,
			});
			break;
		}
		case 74: {
			title = 'Message Pinned';
			fields.push({
				name: 'ID',
				value: alEntry.targetId,
				inline: true,
			}, {
				name: 'Content',
				value: alEntry.target.content,
				inline: true,
			}, {
				name: 'Channel',
				value: alEntry.target.channel,
				inline: true,
			});
			break;
		}
		case 75: {
			title = 'Message Unpinned';
			fields.push({
				name: 'ID',
				value: alEntry.targetId,
				inline: true,
			}, {
				name: 'Content',
				value: alEntry.target.content,
				inline: true,
			}, {
				name: 'Channel',
				value: alEntry.target.channel,
				inline: true,
			});
			break;
		}
		case 90: {
			title = 'Sticker Created';
			fields.push({
				name: 'Name/ID',
				value: `${alEntry.target.name} (${alEntry.target.id})`,
				inline: true,
			});
			break;
		}
		case 91: {
			title = 'Sticker Updated';
			fields.push({
				name: 'Name/ID',
				value: `${alEntry.target.name} (${alEntry.target.id})`,
				inline: true,
			});
			break;
		}
		case 92: {
			title = 'Sticker Deleted';
			fields.push({
				name: 'Name',
				value: alEntry.changes['old'].name,
				inline: true,
			}, {
				name: 'ID',
				value: alEntry.changes['old'].id,
				inline: true,
			});
			break;
		}
		case 100: {
			title = 'Scheduled Event Created';
			fields.push({
				name: 'Name',
				value: alEntry.target.name,
				inline: true,
			}, {
				name: 'Location',
				value: alEntry.target.channel,
				inline: true,
			});
			break;
		}
		case 101: {
			title = 'Scheduled Event Updated';
			fields.push({
				name: 'Name',
				value: alEntry.changes['new'].name,
				inline: true,
			});
			break;
		}
		case 102: {
			title = 'Scheduled Event Cancelled';
			fields.push({
				name: 'Name',
				value: alEntry.target.name,
				inline: true,
			});
			break;
		}
		case 110: {
			title = 'Thread Created';
			fields.push({
				name: 'Name',
				value: alEntry.target.name,
				inline: true,
			}, {
				name: 'Parent',
				value: alEntry.target.parent,
				inline: true,
			});
			break;
		}
		case 111: {
			title = 'Thread Updated';
			fields.push({
				name: 'Name',
				value: alEntry.changes['new'].name,
				inline: true,
			}, {
				name: 'ID',
				value: alEntry.changes['new'].id,
				inline: true,
			}, {
				name: 'Parent',
				value: alEntry.changes['new'].parent,
				inline: true,
			});
			break;
		}
		case 112: {
			title = 'Thread Deleted';
			fields.push({
				name: 'Name',
				value: alEntry.changes['old'].name,
				inline: true,
			}, {
				name: 'Parent',
				value: alEntry.changes['old'].parent.name,
				inline: true,
			}, {
				name: 'ID',
				value: alEntry.changes['old'].id,
				inline: true,
			});
			break;
		}
		case 140: {
			title = 'Automod Rule Created';
			fields.push({
				name: 'Name',
				value: alEntry.target.name,
				inline: true,
			});
			break;
		}
		case 141: {
			title = 'Automod Rule Updated';
			fields.push({
				name: 'Name',
				value: alEntry.changes['new'].name,
				inline: true,
			});
			break;
		}
		case 142: {
			title = 'Automod Rule Deleted';
			fields.push({
				name: 'Name',
				value: alEntry.changes['old'].name,
				inline: true,
			});
			break;
		}
		}

		if (title === '') return;

		console.log(fields);

		fields.push({
			name: 'Executed By',
			value: alEntry.executor.displayName,
		});

		createAuditLog(true, guild, {
			title: title,
			fields: fields,
		});
	},
};