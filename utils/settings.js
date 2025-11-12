import { readFileSync, writeFileSync, existsSync } from 'fs';

const SETTINGS_FILE = 'settings.json';

export function loadSettings() {
  try {
    if (existsSync(SETTINGS_FILE)) {
      const data = readFileSync(SETTINGS_FILE, 'utf8');
      const parsed = JSON.parse(data);
      return {
        botName: parsed.botName || 'Music Bot',
        channels: parsed.channels || {},
        setupComplete: parsed.setupComplete || false
      };
    }
  } catch (error) {
    console.error('Fehler beim Laden der Einstellungen:', error);
  }
  
  return {
    botName: 'Music Bot',
    channels: {},
    setupComplete: false
  };
}

export function saveSettings(settings) {
  try {
    writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
    return true;
  } catch (error) {
    console.error('Fehler beim Speichern der Einstellungen:', error);
    return false;
  }
}

export function updateBotName(name) {
  const settings = loadSettings();
  settings.botName = name;
  return saveSettings(settings);
}

export function addChannel(guildId, channelId) {
  const settings = loadSettings();
  if (!settings.channels[guildId]) {
    settings.channels[guildId] = [];
  }
  if (!settings.channels[guildId].includes(channelId)) {
    settings.channels[guildId].push(channelId);
  }
  return saveSettings(settings);
}

export function removeChannel(guildId, channelId) {
  const settings = loadSettings();
  if (settings.channels[guildId]) {
    settings.channels[guildId] = settings.channels[guildId].filter(id => id !== channelId);
    if (settings.channels[guildId].length === 0) {
      delete settings.channels[guildId];
    }
  }
  return saveSettings(settings);
}
