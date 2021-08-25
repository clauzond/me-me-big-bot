const { SlashCommandBuilder } = require("@discordjs/builders");
const string_to_emoji = require("../my_modules/message.js");

// Export data in Node.js so it can be required
// client can be accessed with interaction.client
module.exports = {
	// data field (description of the command)
	data: new SlashCommandBuilder()
		.setName("emoji")
		.setDescription("i will convert your message to emotes 🥵")
		.addStringOption(option => option.setName("message")
			.setDescription("what i will convert 😏")
			.setRequired(true)),
	// execute field (function associated to command)
	async execute(interaction) {
		const response = string_to_emoji(interaction.options.getString("message"));
		await interaction.reply(response);
	},
};