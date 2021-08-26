const { SlashCommandBuilder } = require("@discordjs/builders");

const playerTurn = "yellow";
let yellowUser, redUser;

const getPlayer = () => {
	return (playerTurn == "yellow" ? yellowUser : redUser);
};

const removeUserReactions = async (message, userId) => {
	const userReactions = message.reactions.cache.filter(reaction => reaction.users.cache.has(userId));

	try {
		for (const reaction of userReactions.values()) {
			await reaction.users.remove(userId);
		}
	} catch (error) {
		console.error("Failed to remove reactions.");
	}
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
		const numbersEmoji = ["0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"];

		yellowUser = interaction.user;
		redUser = interaction.options.getUser("user");

		// TODO: start the game, modify message

		// collect emotes 
		let bot_finished = false;
		const filter = (reaction, user) => {
			return true;
		};
		const collector = message.createReactionCollector({ filter, time: 60000 });

		// game loop with reactions
		collector.on("collect", (reaction, user) => {
			if (user.bot) return;

			// remove the reaction
			reaction.users.remove(user.id);

			// bot has finished placing all emotes
			if (!bot_finished) return;

			// verify if emote is correct
			if (!numbersEmoji.includes(reaction.emoji.name)) return;
			
			// verify if user can play
			if (user.id != getPlayer().id) return;

		});

		collector.on("end", collected => {
			console.log("end of game !");
		});

		for (let i = 1; i < 7; i++) {
			await message.react(numbersEmoji[i]);
		}
		bot_finished = true;

	},
};