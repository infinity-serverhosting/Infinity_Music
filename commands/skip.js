import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { useQueue } from 'discord-player';

export default {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Überspringt den aktuellen Song'),
  
  async execute(interaction, client) {
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      return interaction.reply({ 
        content: '❌ Du musst in einem Voice Channel sein!', 
        ephemeral: true 
      });
    }

    const queue = useQueue(interaction.guild.id);
    if (!queue || !queue.currentTrack) {
      return interaction.reply({ 
        content: '❌ Es läuft gerade keine Musik!', 
        ephemeral: true 
      });
    }

    const currentTrack = queue.currentTrack;
    queue.node.skip();

    const embed = new EmbedBuilder()
      .setColor('#FFA500')
      .setDescription(`⏭️ Übersprungen: **${currentTrack.title}**`);

    return interaction.reply({ embeds: [embed] });
  }
};
