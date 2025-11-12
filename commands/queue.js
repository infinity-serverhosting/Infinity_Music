import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { useQueue } from 'discord-player';

export default {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Zeigt die aktuelle Warteschlange an'),
  
  async execute(interaction, client) {
    const queue = useQueue(interaction.guild.id);
    
    if (!queue || !queue.currentTrack) {
      return interaction.reply({ 
        content: '❌ Die Warteschlange ist leer!', 
        ephemeral: true 
      });
    }

    const currentTrack = queue.currentTrack;
    const tracks = queue.tracks.toArray();

    const embed = new EmbedBuilder()
      .setColor('#00FFFF')
      .setTitle('🎵 Warteschlange')
      .setDescription(`**Aktuell:** [${currentTrack.title}](${currentTrack.url})\nDauer: ${currentTrack.duration}`)
      .setThumbnail(currentTrack.thumbnail);

    if (tracks.length > 0) {
      const queueList = tracks.slice(0, 10).map((track, index) => 
        `${index + 1}. [${track.title}](${track.url}) - ${track.duration}`
      ).join('\n');
      
      embed.addFields({ 
        name: `Als Nächstes (${tracks.length} Songs)`, 
        value: queueList + (tracks.length > 10 ? '\n...' : '') 
      });
    }

    embed.setFooter({ 
      text: `Loop: ${queue.repeatMode === 0 ? 'Aus' : queue.repeatMode === 1 ? 'Song' : 'Queue'} | Lautstärke: ${queue.node.volume}%` 
    });

    return interaction.reply({ embeds: [embed] });
  }
};
