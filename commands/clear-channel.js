const { SlashCommandBuilder } = require("@discordjs/builders");
const { zahxId } = require("../config.json");
const { until } = require("../my_modules/until.js");

// Export data in Node.js so it can be required
// client can be accessed with interaction.client
module.exports = {
	emoji: "💦",
	// data field (description of the command)
	data: new SlashCommandBuilder()
		.setName("clear")
		.setDescription("i will clear this nasty channel 💦")
		.addIntegerOption(option => option.setName("number").setDescription("number of messages i will delete 😋").setRequired(true))
		.addUserOption(option => option.setName("user").setDescription("user i will target 😘")),
	// execute field (function associated to command)
	async execute(interaction) {
		if (interaction.user.id != zahxId) {
			await interaction.reply({ content: "You are not <@135070651319975936> !", ephemeral: true });
			return;
		}

		const userToDelete = interaction.options.getUser("user");
		let messageNumber = interaction.options.getInteger("number");
		if (!userToDelete || userToDelete.bot) messageNumber++;
		if (messageNumber < 1) {
			messageNumber = 1;
		} else if (messageNumber > 100) {
			messageNumber = 100;
		}

		let replyString;
		const s = (messageNumber > 1) ? "s" : "";
		if (userToDelete) {
			replyString = `Are you sure you want to delete ${messageNumber} message${s} from ${userToDelete} in this channel ?`;
		} else {
			replyString = `Are you sure you want to delete ${messageNumber} message${s} in this channel ?`;
		}
		await interaction.reply(replyString);
		const message = await interaction.fetchReply();


		// collect emotes 
		const filter = (reaction, user) => {
			return true;
		};
		const collector = message.createReactionCollector({ filter, time: 10000 });
		let botFinished = false;

		// loop with reactions
		let cleared = false;
		collector.on("collect", async (reaction, user) => {
			if (user.bot) return;

			// remove the reaction
			await reaction.users.remove(user.id).catch(error => {return;});
			
			if (user.id != zahxId) return;

			if (reaction.emoji.name == "❎") collector.stop();

			if (reaction.emoji.name != "✅") return;

			await until(_ => botFinished == true);
			await message.edit("Goodbye Mr.Freeman").catch(error => {return;});
			if (!userToDelete) {
				await interaction.channel.bulkDelete(messageNumber).catch(error => {return;});
				cleared = true;
				collector.stop();
			} else {
				interaction.channel.messages.fetch({
					limit: 100,
				}).then(async (messages) => {
					messages = messages.filter(m => m.author.id === userToDelete.id);
					messages = messages.firstKey(Math.min(messageNumber, messages.size + (userToDelete.bot) * 1));
					await interaction.channel.bulkDelete(messages).catch(error => {return;});
					cleared = userToDelete.bot;
					collector.stop();
				});
			}
		});

		collector.on("end", collected => {
			if (!cleared) {
				message.delete();
			}
		});

		try {
			await message.react("✅");
			await message.react("❎");
			setTimeout(() => {botFinished = true;}, 100);
		} catch (error) {}
	},
};