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
			await interaction.reply({ content: "You have to enter a number greater than 0 !", ephemeral: true });
			return;
		}

		let replyString;
		const s = (interaction.options.getInteger("number") > 1) ? "s" : "";
		if (userToDelete) {
			replyString = `Are you sure you want to delete ${interaction.options.getInteger("number")} message${s} from ${userToDelete} in this channel ?`;
		} else {
			replyString = `Are you sure you want to delete ${interaction.options.getInteger("number")} message${s} in this channel ?`;
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
			reaction.users.remove(user.id);

			if (user.id != zahxId) return;

			if (reaction.emoji.name == "❎") collector.stop();

			if (reaction.emoji.name != "✅") return;

			await until(_ => botFinished == true);
			await message.edit("Goodbye Mr.Freeman");
			if (!userToDelete) {
				await interaction.channel.bulkDelete(messageNumber);
				cleared = true;
				collector.stop();
			} else {
				interaction.channel.messages.fetch({
					limit: 100,
				}).then(async (messages) => {
					const filterBy = userToDelete.id;
					messages = messages.filter(m => m.author.id === filterBy).firstKey(messageNumber);
					await interaction.channel.bulkDelete(messages);
					if (userToDelete.bot) {
						cleared = true;
					}
					collector.stop();
				});
			}
		});

		collector.on("end", async collected => {
			if (!cleared) {
				message.delete();
			}
		});

		await message.react("✅");
		await message.react("❎");
		setTimeout(() => {botFinished = true;}, 100);
	},
};