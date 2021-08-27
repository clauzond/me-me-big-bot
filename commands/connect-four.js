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
	try {
		timer += 1;
		const t = Date.now();
		await message.edit(displayFunction());
		const dt = Date.now() - t;
		timer += dt / 1000;
		setTimeout(() => clockLoop(message, displayFunction), 1000);
	} catch (error) {}
};

const getTimerString = (writeTime) => {
	return (writeTime) ? `                          ${clocksEmoji[Math.floor(timer) % 4]} (${timePerTurn - Math.floor(timer)})` : "";
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

const getStatusString = (left_emoji, left_user, right_user, right_emoji, writeTime = false, additionalString = "") => {
	return `${left_emoji}  ${left_user} vs ${right_user}  ${right_emoji}${getTimerString(writeTime)}${additionalString}`;
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

const readyCheck = async (message, time) => {
	let leftReady = false, rightReady = false;
	const collector = message.createReactionCollector({ filter, idle: timePerTurn * 1000 });
	collector.on("collect", async (reaction, user) => {
		if (user.bot) return;

		// remove the reaction
		reaction.users.remove(user.id).catch(error => {return;});

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

		await message.edit(getStatusString(leftEmoji, leftUser, rightUser, rightEmoji, true, `\nTime per turn: ${time}s`));

		if (leftReady && rightReady) collector.stop();
	});
	collector.on("end", collection => {
		readyCheckFinished = true;
	});

	try {
		await message.react("🟡");
		await message.react("🔴");
		await message.react("❎");
		await until(_ => readyCheckFinished == true);
	} catch (error) {}

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
			.setRequired(true))
		.addIntegerOption(option => option.setName("time")
			.setDescription("Time per turn")
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

		await interaction.reply(getStatusString(leftEmoji, leftUser, rightUser, rightEmoji, true)).catch(error => {return;});
		const message = await interaction.fetchReply().catch(error => {return;});

		// ready check
		clockLoop(message, () => { return getStatusString(leftEmoji, leftUser, rightUser, rightEmoji, true, `\nTime per turn: ${interaction.options.getInteger("time")}s`); });
		const playersReady = await readyCheck(message, interaction.options.getInteger("time")).catch(error => {return;});
		await message.reactions.removeAll().catch(error => {return;});
		if (!playersReady) {
			await message.delete().catch(error => {return;});
			gameInProgress = false;
			return;
		}
		
		
		// start game
		timePerTurn = interaction.options.getInteger("time");
		newGame();
		await message.edit(getStatusString(leftEmoji, leftUser, rightUser, rightEmoji)
		+ `\nGame will soon start.\nEach player has ${timePerTurn} seconds per turn.\nGLHF`).catch(error => {return;});
		
		// collect emotes 
		let bot_finished = false;
		isTimeout = true;
		const collector = message.createReactionCollector({ filter: filterNumbers, idle: timePerTurn * 1000 });
		
		// game loop with reactions
		collector.on("collect", async (reaction, user) => {
			timer = 0;
			if (user.bot) return;
			
			// remove the reaction
			await reaction.users.remove(user.id).catch(error => {return;});
			
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
				gameInProgress = false;
				collector.stop();
			}
		});
		
		collector.on("end", async collected => {
			try {
				gameInProgress = false;
				await message.reactions.removeAll();
				await message.edit(discordGameString(true, isTimeout));
			} catch (error) {}
		});
		
		for (let i = 1; i < 8; i++) {
			await message.react(numbersEmoji[i]);
		}
		await message.edit(discordGameString()).catch(error => {return;});
		bot_finished = true;
		readyCheckFinished = false;
		clockLoop(message, discordGameString);
	},
};