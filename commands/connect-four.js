const { SlashCommandBuilder } = require("@discordjs/builders");

// Export data in Node.js so it can be required
// client can be accessed with interaction.client
module.exports = {
	// data field (description of the command)
	data: new SlashCommandBuilder()
		.setName("challenge")
		.setDescription("Challenge someone's honor in a connect four battle")
		.addUserOption(option => option.setName("user").setDescription("The person you shall beat")),
	// execute field (function associated to command)
	async execute(interaction) {
		await interaction.reply("Not implemented (yet !)");
	},
};