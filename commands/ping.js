const { SlashCommandBuilder } = require("@discordjs/builders");

// Export data in Node.js so it can be required
// client can be accessed with interaction.client
module.exports = {
	// data field (description of the command)
	data: new SlashCommandBuilder()
		.setName("ping")
		.setDescription("Replies with Pong!"),
	// execute field (function associated to command)
	async execute(interaction) {
		await interaction.reply("Pong!");
		// `m` is a message object that will be passed through the filter function
		const filter = (reaction, user) => {
			return true;
		};

		const message = await interaction.fetchReply();

		message.react("😀");

		const collector = await message.createReactionCollector({ filter, time: 60000 });

		collector.on("collect", (reaction, user) => {
			console.log(`Collected ${reaction.emoji.name} from ${user.tag}`);
		});

		collector.on("end", collected => {
			console.log(`Collected ${collected.size} items`);
		});

		message.react("😂");
	},
};