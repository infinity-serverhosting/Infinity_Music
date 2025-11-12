import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { updateBotName } from '../utils/settings.js';

export default {
  data: new SlashCommandBuilder()
    .setName('name')
    .setDescription('Ändert den Namen des Bots (nur für Admins)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(option =>
      option.setName('neuer_name')
        .setDescription('Der neue Name für den Bot')
        .setRequired(true)
        .setMinLength(2)
        .setMaxLength(32)
    ),
  
  async execute(interaction, client) {
    await interaction.deferReply();
    
    const newName = interaction.options.getString('neuer_name');

    try {
      await client.user.setUsername(newName);
      updateBotName(newName);

      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('✅ Name geändert')
        .setDescription(`Der Bot heißt jetzt: **${newName}**`)
        .setFooter({ text: 'Hinweis: Discord erlaubt nur 2 Namensänderungen pro Stunde' });

      return interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Name change error:', error);
      
      let errorMessage = 'Fehler beim Ändern des Namens.';
      if (error.code === 50035) {
        errorMessage = '❌ Der Name ist ungültig. Bitte verwende 2-32 Zeichen.';
      } else if (error.message.includes('rate limit')) {
        errorMessage = '❌ Zu viele Namensänderungen! Du kannst den Namen nur 2x pro Stunde ändern.';
      }

      return interaction.editReply(errorMessage);
    }
  }
};
