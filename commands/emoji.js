const { SlashCommandBuilder } = require("@discordjs/builders");
const { stringToEmoji } = require("../my_modules/message.js");

// Export data in Node.js so it can be required
// client can be accessed with interaction.client
module.exports = {
	emoji: "🥵",
	// data field (description of the command)
	data: new SlashCommandBuilder()
		.setName("emoji")
		.setDescription("i will convert your message to emotes 🥵")
		.addStringOption(option => option.setName("message")
			.setDescription("what i will convert 😏")
			.setRequired(true)),
	// execute field (function associated to command)
	async execute(interaction) {
		const response = stringToEmoji(interaction.options.getString("message"));
		await interaction.reply(response);
	},
};