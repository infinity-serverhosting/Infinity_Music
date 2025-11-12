# 🎵 Discord Music Bot

Ein professioneller 24/7 Discord Music Bot mit Multi-Channel Support, der Musik von verschiedenen Quellen abspielen kann.

## ✨ Features

- 🎵 **Multi-Source Music**: YouTube direkt, Spotify/Apple Music Links (werden zu YouTube konvertiert)
- 📻 **Radio Streaming**: Vordefinierte deutsche Radio-Sender
- 🔄 **24/7 Modus**: Bot bleibt dauerhaft im Voice Channel und reconnected automatisch
- 🎯 **Multi-Server Support**: Bot kann auf mehreren Discord-Servern gleichzeitig sein (1 Voice Channel pro Server)
- ⚙️ **Setup via Commands**: Komplette Konfiguration über Slash Commands
- 🏷️ **Dynamischer Name**: Bot-Name änderbar über Command
- 📋 **Queue System**: Warteschlange für Songs
- 💬 **Slash Commands**: Alle Commands nutzen Discord's Slash Command System

## 🚀 Setup

### 1. Discord Bot erstellen

1. Gehe zu [Discord Developer Portal](https://discord.com/developers/applications)
2. Klicke auf "New Application"
3. Gib deinem Bot einen Namen
4. Gehe zu "Bot" im Menü links
5. Klicke auf "Add Bot"
6. Kopiere den **Token** (unter "TOKEN")
7. Gehe zu "OAuth2" → "General"
8. Kopiere die **Application ID** (Client ID)

### 2. Bot zu Discord Server hinzufügen

1. Gehe zu "OAuth2" → "URL Generator"
2. Wähle unter "Scopes": `bot` und `applications.commands`
3. Wähle unter "Bot Permissions":
   - Connect
   - Speak
   - Use Voice Activity
   - Send Messages
   - Embed Links
4. Kopiere die generierte URL und öffne sie im Browser
5. Wähle deinen Server und autorisiere den Bot

### 3. Secrets in Replit hinzufügen

1. Klicke auf das Schloss-Symbol in der linken Sidebar (Secrets)
2. Füge folgende Secrets hinzu:
   - **Key**: `DISCORD_TOKEN` → **Value**: Dein Bot Token
   - **Key**: `DISCORD_CLIENT_ID` → **Value**: Deine Application/Client ID

### 4. Bot starten

Klicke auf den "Run" Button in Replit - der Bot startet automatisch!

## 📖 Commands

| Command | Beschreibung |
|---------|--------------|
| `/play <song>` | Spielt Musik ab (YouTube, Spotify, Apple Music Links oder Suche) |
| `/radio <sender>` | Spielt einen Radio-Stream ab |
| `/stop` | Stoppt die Musik und verlässt den Voice Channel |
| `/skip` | Überspringt den aktuellen Song |
| `/queue` | Zeigt die Warteschlange an |
| `/setup info` | Zeigt Bot-Einstellungen an |
| `/setup 247 <true/false>` | Aktiviert/Deaktiviert 24/7 Modus |
| `/name <neuer_name>` | Ändert den Bot-Namen (Admin only) |

## 📻 Verfügbare Radio-Sender

- 1LIVE
- SWR3
- Bayern 3
- NDR 2
- bigFM
- Energy
- Antenne Bayern
- radio ffn

## 🔧 Technische Details

- **Framework**: Discord.js v14
- **Music Player**: discord-player v6
- **Audio**: @discordjs/voice, FFmpeg
- **Runtime**: Node.js 20

## 💡 Nutzung

1. **Musik abspielen**:
   ```
   /play Imagine Dragons - Believer
   /play https://www.youtube.com/watch?v=...
   /play https://open.spotify.com/track/...
   ```

2. **24/7 Modus aktivieren**:
   - Gehe in einen Voice Channel
   - Nutze `/setup 247 enable:true`
   - Der Bot bleibt jetzt dauerhaft in diesem Channel

3. **Radio hören**:
   ```
   /radio sender:1live
   /radio sender:swr3
   ```

## ⚠️ Wichtige Hinweise

- Der Bot benötigt Berechtigungen zum Beitreten und Sprechen in Voice Channels
- **24/7 Modus**: Bot verbindet sich automatisch beim Start zu konfigurierten Channels und reconnected bei Disconnect
- **Multi-Server Support**: Der Bot kann auf mehreren Discord-Servern gleichzeitig laufen, aber nur in 1 Voice Channel pro Server
- Bot-Namen können nur 2x pro Stunde geändert werden (Discord Limit)
- Für Spotify/Apple Music werden die Songs auf YouTube gesucht und abgespielt

## 🐛 Probleme?

Wenn der Bot nicht funktioniert:
1. Überprüfe, ob beide Secrets korrekt gesetzt sind
2. Stelle sicher, dass der Bot die nötigen Berechtigungen hat
3. Prüfe die Console für Fehlermeldungen

## 📝 Lizenz

MIT License
