import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { createAudioPlayer, createAudioResource, joinVoiceChannel, AudioPlayerStatus, StreamType, demuxProbe } from '@discordjs/voice';
import https from 'https';
import http from 'http';

const RADIO_STATIONS = {
  '1live': { name: '1LIVE', url: 'https://wdr-1live-live.icecastssl.wdr.de/wdr/1live/live/mp3/128/stream.mp3' },
  'swr3': { name: 'SWR3', url: 'https://liveradio.swr.de/sw282p3/swr3/play.mp3' },
  'bayern3': { name: 'Bayern 3', url: 'https://dispatcher.rndfnk.com/br/br3/live/mp3/low' },
  'ndr2': { name: 'NDR 2', url: 'https://icecast.ndr.de/ndr/ndr2/niedersachsen/mp3/128/stream.mp3' },
  'bigfm': { name: 'bigFM', url: 'https://streams.bigfm.de/bigfm-deutschland-128-mp3' },
  'energy': { name: 'Energy', url: 'https://edge67.streamonkey.net/energy-germany/stream/mp3' },
  'antenne': { name: 'Antenne Bayern', url: 'https://mp3channels.webradio.antenne.de/antenne' },
  'ffn': { name: 'radio ffn', url: 'https://stream.ffn.de/radioffn/mp3-192' }
};

export const radioPlayers = new Map();

async function createRadioStream(url, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    if (maxRedirects === 0) {
      reject(new Error('Too many redirects'));
      return;
    }

    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (response) => {
      if (response.statusCode === 200) {
        resolve(response);
      } else if (response.statusCode === 301 || response.statusCode === 302 || response.statusCode === 307) {
        const redirectUrl = response.headers.location;
        if (!redirectUrl) {
          reject(new Error(`Redirect without location header`));
          return;
        }
        
        response.destroy();
        createRadioStream(redirectUrl, maxRedirects - 1)
          .then(resolve)
          .catch(reject);
      } else {
        reject(new Error(`HTTP ${response.statusCode}`));
      }
    }).on('error', reject);
  });
}

export default {
  data: new SlashCommandBuilder()
    .setName('radio')
    .setDescription('Spielt einen Radio-Stream ab')
    .addStringOption(option =>
      option.setName('sender')
        .setDescription('Wähle einen Radio-Sender')
        .setRequired(true)
        .addChoices(
          { name: '1LIVE', value: '1live' },
          { name: 'SWR3', value: 'swr3' },
          { name: 'Bayern 3', value: 'bayern3' },
          { name: 'NDR 2', value: 'ndr2' },
          { name: 'bigFM', value: 'bigfm' },
          { name: 'Energy', value: 'energy' },
          { name: 'Antenne Bayern', value: 'antenne' },
          { name: 'radio ffn', value: 'ffn' }
        )
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

    const stationKey = interaction.options.getString('sender');
    const station = RADIO_STATIONS[stationKey];

    if (!station) {
      return interaction.editReply('❌ Radio-Sender nicht gefunden!');
    }

    try {
      console.log(`[RADIO] Starting ${station.name} for ${interaction.guild.name}`);
      
      const existingQueue = client.player.nodes.get(interaction.guild.id);
      if (existingQueue) {
        console.log('[RADIO] Stopping existing music queue');
        existingQueue.delete();
      }

      const existingRadio = radioPlayers.get(interaction.guild.id);
      if (existingRadio) {
        console.log('[RADIO] Stopping existing radio player');
        existingRadio.player.stop();
        existingRadio.connection.destroy();
        radioPlayers.delete(interaction.guild.id);
      }

      console.log('[RADIO] Creating voice connection...');
      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: interaction.guild.id,
        adapterCreator: interaction.guild.voiceAdapterCreator,
        selfDeaf: true
      });

      console.log('[RADIO] Fetching stream...');
      const stream = await createRadioStream(station.url);
      console.log('[RADIO] Probing stream...');
      const { stream: probedStream, type } = await demuxProbe(stream);
      console.log(`[RADIO] Stream type: ${type}`);

      const player = createAudioPlayer();
      const resource = createAudioResource(probedStream, {
        inputType: type,
        inlineVolume: true
      });

      resource.volume?.setVolume(0.8);

      console.log('[RADIO] Starting playback...');
      player.play(resource);
      connection.subscribe(player);
      console.log('[RADIO] Playback started successfully');

      const radioData = { player, connection, station: station.name, url: station.url };
      radioPlayers.set(interaction.guild.id, radioData);

      player.on(AudioPlayerStatus.Idle, async () => {
        const currentRadio = radioPlayers.get(interaction.guild.id);
        if (!currentRadio || currentRadio.player !== player) {
          return;
        }
        
        try {
          const retryStream = await createRadioStream(currentRadio.url);
          const { stream: retryProbedStream, type: retryType } = await demuxProbe(retryStream);
          const retryResource = createAudioResource(retryProbedStream, {
            inputType: retryType,
            inlineVolume: true
          });
          retryResource.volume?.setVolume(0.8);
          
          const stillCurrent = radioPlayers.get(interaction.guild.id);
          if (stillCurrent && stillCurrent.player === player) {
            player.play(retryResource);
          }
        } catch (err) {
          console.error('Radio retry error:', err);
        }
      });

      player.on('error', error => {
        console.error('Radio player error:', error);
      });

      const embed = new EmbedBuilder()
        .setColor('#FF00FF')
        .setTitle('📻 Radio Stream')
        .setDescription(`**${station.name}** wird jetzt abgespielt!`)
        .addFields(
          { name: 'Angefragt von', value: interaction.user.tag, inline: true }
        );

      return interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Radio error:', error);
      return interaction.editReply(`❌ Fehler beim Abspielen des Radio-Streams: ${error.message}`);
    }
  }
};
