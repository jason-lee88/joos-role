require("dotenv").config();
const {
  Client,
  Events,
  GatewayIntentBits,
  SlashCommandBuilder,
  REST,
  Routes,
  Collection,
} = require("discord.js");

const token = process.env.BOT_TOKEN;
const clientId = process.env.CLIENT_ID;
const channelId = process.env.CHANNEL_ID;

// Command saying I'm Juice :)
const juiceCommand = {
  data: new SlashCommandBuilder().setName("juice").setDescription("Juice!"),
  async execute(interaction) {
    await interaction.reply("I'm Juice :)");
  },
};

// Register commands
const rest = new REST({ version: "10" }).setToken(token);

(async () => {
  try {
    console.log("Started refreshing juice command!");

    const commands = [];
    commands.push(juiceCommand.data);

    await rest.put(Routes.applicationCommands(clientId), {
      body: commands,
    });

    console.log("Successfully reloaded juice command!");
  } catch (error) {
    console.error(error);
  }
})();

// Set up bot client, event handlers, & log in with token
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
client.commands.set(juiceCommand.data.name, juiceCommand);

client.once(Events.ClientReady, async (c) => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.login(token);

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand) {
    await interaction.reply("Not a chat input command!");
    return;
  }

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    await interaction.reply("No command was found!");
    return;
  }

  if (interaction.channel.id !== channelId) {
    const channel = await interaction.guild.channels.fetch(`${channelId}`);
    const channelName = channel ? channel.name : "NO_CHANNEL_FOUND";
    await interaction.reply(`Must be run in ${channelName}`);
  }

  try {
    command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply("There was an error while executing this command!");
  }
});
