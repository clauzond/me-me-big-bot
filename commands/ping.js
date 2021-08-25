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
	},
};