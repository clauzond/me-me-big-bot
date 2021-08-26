// Require the necessary discord.js classes
const fs = require("fs");
const { Client, Collection, Intents } = require("discord.js");
const { token, allowedChannels, allowedGuilds, arenaChannels, allowedArenaCommands } = require("./config.json");
const { randomEmoji } = require("./my_modules/random-emoji.js");

// Create a new client instance
// list of intents: https://discord.com/developers/docs/topics/gateway#gateway-intents
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGE_REACTIONS] });

// Get commands (which are registered by deploy-commands.js)
client.commands = new Collection();
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));

// Set items in collection with the key as the command name and the value as the exported module
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}

// list of events: https://discord.js.org/#/docs/main/stable/class/Client
// event-handling guide: https://discordjs.guide/creating-your-bot/event-handling.html#individual-event-files

// When the client is ready, run this code (only once)
client.once("ready", c => {
	console.log(`logged in as: ${c.user.tag}`);
	console.log(`ready to operate ${randomEmoji()}`);
});


// Replying to commands
client.on("interactionCreate", async interaction => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	// command doesn't exist in Collection
	if (!command) return;

	console.log(`${interaction.user.tag} in #${interaction.channel.name} (${interaction.guild.name}) triggered ${interaction.commandName} ${command.emoji}`);

	// command not in correct guild or not in correct channel
	if (arenaChannels.includes(interaction.channelId) && !allowedArenaCommands.includes(interaction.commandName)) {
		await interaction.reply({ content: "YOU SHALL NOT PASS ⚔", ephemeral: true });
		console.log("but not in an arena ⚔");
		return;
	}

	if (!allowedGuilds.includes(interaction.guildId) || !allowedChannels.includes(interaction.channelId)) {
		await interaction.reply({ content: "sowwy but you are in the wrong guild or channel 😰", ephemeral: true });
		console.log("but wrong channel or guild 😂");
		return;
	}

	// execute commands
	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: "oh no something went wrong 😵", ephemeral: true });
	}

});

// Login to Discord with your client's token
client.login(token);