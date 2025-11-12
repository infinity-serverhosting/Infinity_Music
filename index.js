import { Client, GatewayIntentBits, Collection, REST, Routes, ActivityType } from 'discord.js';
import { Player } from 'discord-player';
import { readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import chalk from 'chalk';
import { loadSettings, saveSettings } from './utils/settings.js';
import { joinVoiceChannel } from '@discordjs/voice';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages
  ]
});

client.commands = new Collection();
client.player = new Player(client, {
  ytdlOptions: {
    quality: 'highestaudio',
    highWaterMark: 1 << 25
  }
});

console.log(chalk.blue('🎵 Discord Music Bot wird gestartet...'));

const commandFiles = readdirSync(join(__dirname, 'commands')).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = await import(`./commands/${file}`);
  client.commands.set(command.default.data.name, command.default);
  console.log(chalk.green(`✓ Command geladen: ${command.default.data.name}`));
}

await client.player.extractors.loadDefault((ext) => ext !== 'YouTubeExtractor');

console.log(chalk.blue('Loading YouTube extractor...'));
try {
  const { YouTubeExtractor } = await import('@discord-player/extractor');
  await client.player.extractors.register(YouTubeExtractor, {});
  console.log(chalk.green('✓ YouTube extractor loaded'));
} catch (error) {
  console.log(chalk.yellow('⚠ YouTube extractor not available, using fallback'));
}

async function join24_7Channels() {
  const settings = loadSettings();
  if (!settings.channels || Object.keys(settings.channels).length === 0) {
    return;
  }

  console.log(chalk.cyan('\n🔄 Verbinde zu 24/7 Channels...'));
  
  for (const [guildId, channelIds] of Object.entries(settings.channels)) {
    const guild = client.guilds.cache.get(guildId);
    if (!guild) continue;

    for (const channelId of channelIds) {
      const channel = guild.channels.cache.get(channelId);
      if (!channel || !channel.isVoiceBased()) continue;

      try {
        joinVoiceChannel({
          channelId: channel.id,
          guildId: guild.id,
          adapterCreator: guild.voiceAdapterCreator,
          selfDeaf: true
        });
        console.log(chalk.green(`✓ Verbunden mit ${channel.name} in ${guild.name}`));
      } catch (error) {
        console.error(chalk.red(`❌ Fehler beim Verbinden mit ${channel.name}:`), error.message);
      }
    }
  }
}

client.once('ready', async () => {
  const settings = loadSettings();
  
  console.log(chalk.green.bold(`\n✓ Bot ist online als ${client.user.tag}`));
  console.log(chalk.cyan(`📊 In ${client.guilds.cache.size} Servern`));
  
  if (settings.botName && settings.botName !== 'Music Bot') {
    try {
      await client.user.setUsername(settings.botName);
      console.log(chalk.yellow(`✓ Bot-Name gesetzt: ${settings.botName}`));
    } catch (error) {
      console.log(chalk.red('⚠ Name konnte nicht geändert werden (Rate Limit)'));
    }
  }
  
  client.user.setActivity('🎵 Musik | /play', { type: ActivityType.Listening });
  
  const token = process.env.DISCORD_TOKEN;
  const clientId = process.env.DISCORD_CLIENT_ID;
  
  if (clientId) {
    try {
      const rest = new REST({ version: '10' }).setToken(token);
      const commands = Array.from(client.commands.values()).map(cmd => cmd.data.toJSON());
      
      console.log(chalk.blue(`\n🔄 Registriere ${commands.length} Slash Commands...`));
      
      await rest.put(
        Routes.applicationCommands(clientId),
        { body: commands }
      );
      
      console.log(chalk.green('✓ Slash Commands erfolgreich registriert!\n'));
    } catch (error) {
      console.error(chalk.red('❌ Fehler beim Registrieren der Commands:'), error);
    }
  } else {
    console.log(chalk.yellow('⚠ DISCORD_CLIENT_ID fehlt - Slash Commands können nicht registriert werden'));
    console.log(chalk.yellow('ℹ Füge DISCORD_CLIENT_ID als Secret hinzu für Slash Commands'));
  }

  await join24_7Channels();
});

client.player.events.on('error', (queue, error) => {
  console.error(chalk.red(`Player error in ${queue.guild.name}:`), error);
});

client.player.events.on('playerError', (queue, error) => {
  console.error(chalk.red(`Player error in ${queue.guild.name}:`), error);
});

client.player.events.on('playerStart', (queue, track) => {
  const settings = loadSettings();
  const guildId = queue.guild.id;
  const isIn24_7Mode = settings.channels && settings.channels[guildId] && settings.channels[guildId].length > 0;
  
  if (isIn24_7Mode) {
    queue.node.setVolume(80);
  }
  
  console.log(chalk.green(`▶️ Jetzt spielend: ${track.title} in ${queue.guild.name}`));
});

client.on('voiceStateUpdate', async (oldState, newState) => {
  if (newState.id === client.user.id && !newState.channelId && oldState.channelId) {
    const settings = loadSettings();
    const guildId = oldState.guild.id;
    
    if (settings.channels && settings.channels[guildId] && settings.channels[guildId].includes(oldState.channelId)) {
      console.log(chalk.yellow(`⚠ Aus 24/7 Channel disconnected, reconnecting...`));
      
      setTimeout(async () => {
        const channel = oldState.guild.channels.cache.get(oldState.channelId);
        if (channel && channel.isVoiceBased()) {
          try {
            joinVoiceChannel({
              channelId: channel.id,
              guildId: oldState.guild.id,
              adapterCreator: oldState.guild.voiceAdapterCreator,
              selfDeaf: true
            });
            console.log(chalk.green(`✓ Wieder verbunden mit ${channel.name}`));
          } catch (error) {
            console.error(chalk.red(`❌ Fehler beim Reconnect:`), error.message);
          }
        }
      }, 3000);
    }
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction, client);
  } catch (error) {
    console.error(chalk.red(`Fehler bei Command ${interaction.commandName}:`), error);
    const replyMethod = interaction.replied || interaction.deferred ? 'followUp' : 'reply';
    await interaction[replyMethod]({
      content: '❌ Ein Fehler ist aufgetreten beim Ausführen dieses Commands!',
      ephemeral: true
    });
  }
});

const token = process.env.DISCORD_TOKEN;

if (!token) {
  console.log(chalk.red('\n❌ DISCORD_TOKEN fehlt!'));
  console.log(chalk.yellow('ℹ Bitte folgende Secrets hinzufügen:'));
  console.log(chalk.yellow('  - DISCORD_TOKEN (von Discord Developer Portal)'));
  console.log(chalk.yellow('  - DISCORD_CLIENT_ID (von Discord Developer Portal)'));
  console.log(chalk.cyan('\n📖 Anleitung:'));
  console.log(chalk.white('1. Gehe zu https://discord.com/developers/applications'));
  console.log(chalk.white('2. Erstelle eine neue Application oder wähle eine bestehende'));
  console.log(chalk.white('3. Gehe zu "Bot" und kopiere den Token'));
  console.log(chalk.white('4. Gehe zu "OAuth2" und kopiere die Client ID'));
  console.log(chalk.white('5. Füge beide als Secrets in Replit hinzu\n'));
  process.exit(1);
} else {
  client.login(token);
}
