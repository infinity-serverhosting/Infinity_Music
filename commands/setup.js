import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { loadSettings, saveSettings } from '../utils/settings.js';

export default {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Richtet den Bot ein (nur für Admins)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(subcommand =>
      subcommand
        .setName('info')
        .setDescription('Zeigt aktuelle Bot-Einstellungen')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('247')
        .setDescription('Aktiviert/Deaktiviert 24/7 Modus für diesen Channel')
        .addBooleanOption(option =>
          option.setName('enable')
            .setDescription('24/7 Modus aktivieren oder deaktivieren')
            .setRequired(true)
        )
    ),
  
  async execute(interaction, client) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'info') {
      const settings = loadSettings();
      
      const embed = new EmbedBuilder()
        .setColor('#0099FF')
        .setTitle('⚙️ Bot-Einstellungen')
        .addFields(
          { name: 'Bot-Name', value: settings.botName || 'Music Bot', inline: true },
          { name: 'Setup abgeschlossen', value: settings.setupComplete ? '✅ Ja' : '❌ Nein', inline: true },
          { name: '24/7 Channels', value: Object.keys(settings.channels).length > 0 ? 'Aktiv' : 'Keine', inline: true }
        )
        .setFooter({ text: 'Nutze /name um den Bot-Namen zu ändern' });

      if (Object.keys(settings.channels).length > 0) {
        const channelsList = [];
        for (const [guildId, channels] of Object.entries(settings.channels)) {
          for (const channelId of channels) {
            const channel = client.channels.cache.get(channelId);
            if (channel) {
              channelsList.push(`<#${channelId}>`);
            }
          }
        }
        if (channelsList.length > 0) {
          embed.addFields({ name: '24/7 Voice Channels', value: channelsList.join(', ') });
        }
      }

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (subcommand === '247') {
      const enable = interaction.options.getBoolean('enable');
      const voiceChannel = interaction.member.voice.channel;

      if (!voiceChannel) {
        return interaction.reply({ 
          content: '❌ Du musst in einem Voice Channel sein!', 
          ephemeral: true 
        });
      }

      const settings = loadSettings();
      const guildId = interaction.guild.id;
      const channelId = voiceChannel.id;

      if (enable) {
        if (!settings.channels[guildId]) {
          settings.channels[guildId] = [];
        }
        if (!settings.channels[guildId].includes(channelId)) {
          settings.channels[guildId].push(channelId);
        }
        
        const hasAnyChannels = Object.keys(settings.channels).some(
          gid => settings.channels[gid] && settings.channels[gid].length > 0
        );
        settings.setupComplete = hasAnyChannels;
        saveSettings(settings);

        const { joinVoiceChannel } = await import('@discordjs/voice');
        try {
          joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: interaction.guild.id,
            adapterCreator: interaction.guild.voiceAdapterCreator,
            selfDeaf: true
          });
        } catch (error) {
          console.error('Error joining voice channel:', error);
        }

        const embed = new EmbedBuilder()
          .setColor('#00FF00')
          .setDescription(`✅ 24/7 Modus aktiviert für <#${channelId}>\n\nDer Bot bleibt dauerhaft in diesem Channel.`);

        return interaction.reply({ embeds: [embed] });
      } else {
        if (settings.channels[guildId]) {
          settings.channels[guildId] = settings.channels[guildId].filter(id => id !== channelId);
          if (settings.channels[guildId].length === 0) {
            delete settings.channels[guildId];
          }
        }
        
        const hasAnyChannels = Object.keys(settings.channels).some(
          gid => settings.channels[gid] && settings.channels[gid].length > 0
        );
        settings.setupComplete = hasAnyChannels;
        saveSettings(settings);

        const embed = new EmbedBuilder()
          .setColor('#FF0000')
          .setDescription(`⏹️ 24/7 Modus deaktiviert für <#${channelId}>`);

        return interaction.reply({ embeds: [embed] });
      }
    }
  }
};
