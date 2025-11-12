import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { useQueue } from 'discord-player';
import { radioPlayers } from './radio.js';

export default {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stoppt die Musik und verlässt den Voice Channel'),
  
  async execute(interaction, client) {
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      return interaction.reply({ 
        content: '❌ Du musst in einem Voice Channel sein!', 
        ephemeral: true 
      });
    }

    const queue = useQueue(interaction.guild.id);
    const radioPlayer = radioPlayers.get(interaction.guild.id);

    if (!queue && !radioPlayer) {
      return interaction.reply({ 
        content: '❌ Es läuft gerade keine Musik!', 
        ephemeral: true 
      });
    }

    if (queue) {
      queue.delete();
    }

    if (radioPlayer) {
      radioPlayer.player.stop();
      radioPlayer.connection.destroy();
      radioPlayers.delete(interaction.guild.id);
    }

    const embed = new EmbedBuilder()
      .setColor('#FF0000')
      .setDescription('⏹️ Musik gestoppt und Voice Channel verlassen');

    return interaction.reply({ embeds: [embed] });
  }
};
