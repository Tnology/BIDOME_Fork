import { Command, CommandContext, Embed } from "harmony";
import { doPermCheck, LoopType, queues } from "queue";

export default class ForceSkip extends Command {
	name = "forceskip";
	aliases = ["fs"];
	category = "music";
	description = "Skip the current song without a vote";

	async execute(ctx: CommandContext) {
		if (ctx.guild == undefined) return;
		const botState = await ctx.guild!.voiceStates.get(ctx.client.user!.id);
		if (
			queues.has(ctx.guild!.id) &&
			(botState == undefined || botState.channel == undefined)
		) {
			queues.get(ctx.guild!.id)!.deleteQueue();
		}

		const queue = queues.get(ctx.guild.id);
		if (
			queue == undefined ||
			botState == undefined ||
			botState.channel == undefined
		) {
			await ctx.message.reply(undefined, {
				embeds: [
					new Embed({
						author: {
							name: "Bidome bot",
							icon_url: ctx.client.user!.avatarURL(),
						},
						title: "Not currently playing!",
						description: "I am not currently playing anything!",
					}).setColor("red"),
				],
			});

			if (queue != undefined) {
				queue.deleteQueue();
			}
		} else {
			const queue = queues.get(ctx.guild!.id)!;
			if (
				(await doPermCheck(ctx.member!, botState.channel!)) ||
				queue.queue[0].requestedBy == ctx.author.id
			) {
				const isLooping = queue.loop;
				queue.loop = LoopType.OFF;

				await queue.player.seek(0);
				await queue.player.stop();

				await ctx.message.reply({
					embeds: [
						new Embed({
							author: {
								name: "Bidome bot",
								icon_url: ctx.client.user!.avatarURL(),
							},
							title: "Skipped",
							description: "I have skipped the current song",
						}).setColor("green"),
					],
				});

				queue.loop = isLooping;
			} else {
				await ctx.message.reply({
					embeds: [
						new Embed({
							author: {
								name: "Bidome bot",
								icon_url: ctx.client.user!.avatarURL(),
							},
							title: "Unable to skip",
							description:
								"You are not an `ADMINISTRATOR`, Alone in the channel, or the song requester",
						}).setColor("red"),
					],
				});
			}
		}
	}
}
