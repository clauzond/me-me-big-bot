const { SlashCommandBuilder } = require("@discordjs/builders");

const playerTurn = "yellow";
let yellowUser, redUser;

const getPlayerId = () => {
	return (playerTurn == "yellow" ? yellowUser.id : redUser.id);
};

// Export data in Node.js so it can be required
// client can be accessed with interaction.client
module.exports = {
	// data field (description of the command)
	data: new SlashCommandBuilder()
		.setName("challenge")
		.setDescription("Challenge someone's honor in a connect four battle")
		.addUserOption(option => option.setName("user")
			.setDescription("The person you shall beat")
			.setRequired(true)),
	// execute field (function associated to command)
	async execute(interaction) {
		await interaction.reply("I am currently testing this !");
		const message = await interaction.fetchReply();
		const numbersEmoji = ["0⃣", "1⃣", "2⃣", "3⃣", "4⃣", "5⃣", "6⃣", "7⃣", "8⃣", "9⃣"];

		await message.react("👍");
		await message.react("👎");

		yellowUser = interaction.user;
		redUser = interaction.options.getUser("user");

		const filter = (reaction, user) => {
			console.log("filtering");
			return (["👍", "👎"].includes(reaction.emoji.name) || (user.id === getPlayerId()));
		};

		message.awaitReactions({ filter, max: 2, time: 10000, errors: ["time"] })
			.then(collected => {
				console.log("collect");
			}).catch(collected => {
				console.log("nope !");
				return;
			});

		message.react("😀");
	},
};