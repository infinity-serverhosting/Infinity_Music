import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { useQueue, QueryType } from 'discord-player';

export default {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Spielt einen Song ab (YouTube, Spotify, Apple Music)')
    .addStringOption(option =>
      option.setName('song')
        .setDescription('Song-Name, URL oder Suchbegriff')
        .setRequired(true)
    ),
  
  async execute(interaction, client) {
    await interaction.deferReply();
    
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      return interaction.editReply('❌ Du musst in einem Voice Channel sein!');
    }

    const permissions = voiceChannel.permissionsFor(interaction.client.user);
    if (!permissions.has('Connect') || !permissions.has('Speak')) {
      return interaction.editReply('❌ Ich brauche Berechtigungen zum Beitreten und Sprechen!');
    }

    const song = interaction.options.getString('song');
    
    try {
      console.log(`[PLAY] Searching for: ${song}`);
      const searchResult = await client.player.search(song, {
        requestedBy: interaction.user,
        searchEngine: QueryType.AUTO
      });

      if (!searchResult || !searchResult.tracks.length) {
        console.log('[PLAY] No results found');
        return interaction.editReply('❌ Keine Ergebnisse gefunden!');
      }

      console.log(`[PLAY] Found ${searchResult.tracks.length} tracks`);
      const queue = client.player.nodes.create(interaction.guild, {
        metadata: {
          channel: interaction.channel,
          client: interaction.guild.members.me,
          requestedBy: interaction.user
        },
        leaveOnEnd: false,
        leaveOnStop: false,
        leaveOnEmpty: false,
        leaveOnEmptyCooldown: 300000,
        selfDeaf: true,
        volume: 80,
        bufferingTimeout: 3000
      });

      try {
        console.log('[PLAY] Connecting to voice channel...');
        if (!queue.connection) await queue.connect(voiceChannel);
        console.log('[PLAY] Connected successfully');
      } catch (err) {
        console.error('[PLAY] Connection error:', err);
        client.player.nodes.delete(interaction.guild.id);
        return interaction.editReply('❌ Konnte nicht dem Voice Channel beitreten!');
      }

      searchResult.playlist ? queue.addTrack(searchResult.tracks) : queue.addTrack(searchResult.tracks[0]);
      console.log('[PLAY] Track added to queue');
      
      if (!queue.node.isPlaying()) {
        console.log('[PLAY] Starting playback...');
        await queue.node.play();
        console.log('[PLAY] Playback started');
      }

      const track = searchResult.tracks[0];
      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('🎵 Wird abgespielt')
        .setDescription(`**[${track.title}](${track.url})**`)
        .addFields(
          { name: 'Dauer', value: track.duration, inline: true },
          { name: 'Angefragt von', value: interaction.user.tag, inline: true }
        )
        .setThumbnail(track.thumbnail);

      if (track.author) {
        embed.addFields({ name: 'Artist', value: track.author, inline: true });
      }

      return interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Play error:', error);
      return interaction.editReply(`❌ Fehler beim Abspielen: ${error.message}`);
    }
  }
};
