const { SlashCommandBuilder } = require("@discordjs/builders");
const { arenaChannels } = require("../config.json");
const { getPlayerTurn, getGameString, getWinner, playMove, newGame } = require("../my_modules/game_event.js");
const { until } = require("../my_modules/until.js");

let leftUser, rightUser, leftColor, rightColor, leftEmoji, rightEmoji;
let isTimeout, gameInProgress = false, readyCheckFinished = false;

const numbersEmoji = ["0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"];
const clocksEmoji = ["🕒", "🕞", "🕤", "🕘"];

const filter = (...args) => { return true; };
const filterNumbers = (reaction) => { return numbersEmoji.includes(reaction.emoji.name); };

let timer = 0;
let timePerTurn = 20;

const clockLoop = async (message, displayFunction) => {
	if (!gameInProgress || readyCheckFinished) return;
	timer += 1;
	const t = Date.now();
	await message.edit(displayFunction());
	const dt = Date.now() - t;
	timer += dt / 1000;
	setTimeout(() => clockLoop(message, displayFunction), 1000);
};

const getTimerString = (writeTime) => {
	return (writeTime) ? `                        ${clocksEmoji[Math.floor(timer) % 4]} (${timePerTurn - Math.floor(timer)})` : "";
};

const getNameFromEmoji = (emoji) => {
	if (emoji == "🟡") return "yellow";
	if (emoji == "🔴") return "red";
	return "";
};

const getUserFromName = (name) => {
	if (leftColor == name) return leftUser;
	if (rightColor == name) return rightUser;
	return undefined;
};

const getPlayer = () => {
	const playerTurn = getPlayerTurn();
	return (playerTurn == "yellow" ? getUserFromName("yellow") : getUserFromName("red"));
};

const getEmojiColumn = (emojiName) => {
	return (numbersEmoji.indexOf(emojiName) - 1);
};

const getStatusString = (left_emoji, left_user, right_user, right_emoji, writeTime = false) => {
	return `${left_emoji}  ${left_user} vs ${right_user}  ${right_emoji}${getTimerString(writeTime)}`;
};

const discordGameString = (showColors = false, timeout = false) => {
	const winner = getWinner();
	const left = (getPlayerTurn() == leftColor || showColors) ? leftEmoji : "⚫";
	const right = (getPlayerTurn() == rightColor || showColors) ? rightEmoji : "⚫";
	let gameString = "";
	gameString += getStatusString(left, leftUser, rightUser, right, true);
	gameString += "\n** **\n";
	gameString += getGameString();

	switch (winner) {
		case "yellow":
			gameString += `🟨  ${getUserFromName("yellow")} won  🟨\n** **`;
			break;
		case "red":
			gameString += `🟥  ${getUserFromName("red")} won  🟥\n** **`;
			break;
		case "tie":
			gameString += "⬜  It's a tie  ⬜\n** **";
			break;
		default:
			if (timeout) {
				gameString += "⬛  Game has timeout  ⬛\n** **";
			} else {
				gameString += "** **";
			}
	}

	return gameString;
};

const readyCheck = async (message) => {
	let leftReady = false, rightReady = false;
	const collector = message.createReactionCollector({ filter, idle: timePerTurn * 1000 });
	collector.on("collect", async (reaction, user) => {
		if (user.bot) return;

		// remove the reaction
		reaction.users.remove(user.id);

		// quit ready check
		if (reaction.emoji.name == "❎") {
			readyCheckFinished = true;
			return;
		}

		// reaction is valid
		if (!["🟡", "🔴"].includes(reaction.emoji.name)) return;

		// left ready (and emoji not chosen)
		if (!leftReady && user.id == leftUser.id && rightEmoji != reaction.emoji.name) {
			leftReady = true;
			leftColor = getNameFromEmoji(reaction.emoji.name);
			leftEmoji = reaction.emoji.name;
		}

		// right ready (and emoji not chosen)
		if (!rightReady && user.id == rightUser.id && leftEmoji != reaction.emoji.name) {
			rightReady = true;
			rightColor = getNameFromEmoji(reaction.emoji.name);
			rightEmoji = reaction.emoji.name;
		}

		message.edit(getStatusString(leftEmoji, leftUser, rightUser, rightEmoji, true));

		if (leftReady && rightReady) collector.stop();
	});
	collector.on("end", collection => {
		readyCheckFinished = true;
	});
	await message.react("🟡");
	await message.react("🔴");
	await message.react("❎");

	await until(_ => readyCheckFinished == true);
	return (leftReady && rightReady);
};

// Export data in Node.js so it can be required
// client can be accessed with interaction.client
module.exports = {
	emoji: "🔴🟡",
	// data field (description of the command)
	data: new SlashCommandBuilder()
		.setName("challenge")
		.setDescription("Challenge someone's honor in a connect four battle 🔴🟡")
		.addUserOption(option => option.setName("user")
			.setDescription("The person you shall beat")
			.setRequired(true)),
	// execute field (function associated to command)
	async execute(interaction) {
		if (!arenaChannels.includes(interaction.channelId)) {
			await interaction.reply({ content: "You can only challenge someone in an arena!", ephemeral: true });
			return;
		}
		if (gameInProgress) {
			await interaction.reply({ content: "A game is in progress, please wait for your turn!", ephemeral: true });
			return;
		}
		gameInProgress = true;
		timer = 0;
		timePerTurn = 120;
		readyCheckFinished = false;
		leftUser = interaction.user, rightUser = interaction.options.getUser("user");
		leftEmoji = "⚫", rightEmoji = "⚫";
		leftColor = "", rightColor = "";

		await interaction.reply(getStatusString(leftEmoji, leftUser, rightUser, rightEmoji, true));
		const message = await interaction.fetchReply();

		// ready check
		clockLoop(message, () => { return getStatusString(leftEmoji, leftUser, rightUser, rightEmoji, true); });
		const playersReady = await readyCheck(message);
		await message.reactions.removeAll();
		if (!playersReady) {
			message.delete();
			gameInProgress = false;
			return;
		}


		// start game
		timePerTurn = 20;
		readyCheckFinished = false;
		newGame();
		message.edit(getStatusString(leftEmoji, leftUser, rightUser, rightEmoji)
			+ `\nGame will soon start.\nEach player has ${timePerTurn} seconds per turn.\nGLHF`);

		// collect emotes 
		let bot_finished = false;
		isTimeout = true;
		const collector = message.createReactionCollector({ filter: filterNumbers, idle: timePerTurn * 1000 });

		// game loop with reactions
		collector.on("collect", (reaction, user) => {
			timer = 0;
			if (user.bot) return;

			// remove the reaction
			reaction.users.remove(user.id);

			// bot has finished placing all emotes
			if (!bot_finished) return;

			// emote is correct
			if (!numbersEmoji.includes(reaction.emoji.name)) return;

			// user can play
			if (user.id != getPlayer().id) return;

			playMove(getEmojiColumn(reaction.emoji.name));
			timer = 0;

			if (getWinner()) {
				isTimeout = false;
				collector.stop();
			}
		});

		collector.on("end", collected => {
			message.reactions.removeAll();
			message.edit(discordGameString(true, isTimeout));
			gameInProgress = false;
		});

		for (let i = 1; i < 8; i++) {
			await message.react(numbersEmoji[i]);
		}
		await message.edit(discordGameString());
		bot_finished = true;
		clockLoop(message, discordGameString);
	},
};