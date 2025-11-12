# Discord Music Bot

## Übersicht
Ein 24/7 Discord Music Bot mit Multi-Channel Support. Der Bot kann Musik von YouTube abspielen (mit Support für Spotify/Apple Music Links), Radio-Streams abspielen und in mehreren Voice Channels gleichzeitig aktiv sein.

## Features
- **Slash Commands**: Alle Commands nutzen Discord's Slash Command System (/)
- **Multi-Source Music**: YouTube direkt, Spotify/Apple Music Links (konvertiert zu YouTube)
- **Radio Streaming**: Vordefinierte Radio-Sender abspielen
- **24/7 Modus**: Bot bleibt dauerhaft im Voice Channel, auto-join beim Start, automatischer Reconnect
- **Multi-Server Support**: Bot kann auf mehreren Discord-Servern gleichzeitig laufen (1 Voice Channel pro Server)
- **Setup via Commands**: Konfiguration über /setup statt Config-Dateien
- **Dynamischer Name**: Bot-Name änderbar über /name Command

## Projekt-Struktur
```
.
├── index.js              # Haupt-Bot-Datei
├── commands/             # Slash Command Definitionen
│   ├── play.js
│   ├── stop.js
│   ├── skip.js
│   ├── queue.js
│   ├── radio.js
│   ├── setup.js
│   └── name.js
├── utils/
│   ├── player.js         # Music Player Logic
│   └── settings.js       # Settings Management
├── package.json
├── settings.json         # Bot Einstellungen (wird generiert)
└── README.md
```

## Commands
- `/setup` - Bot einrichten und Token konfigurieren
- `/play <song>` - Musik abspielen (YouTube, Spotify, Apple Music Links)
- `/radio <sender>` - Radio-Stream abspielen
- `/stop` - Musik stoppen und Bot aus Voice Channel entfernen
- `/skip` - Aktuellen Song überspringen
- `/queue` - Warteschlange anzeigen
- `/name <neuer_name>` - Bot-Namen ändern

## Benötigte Secrets
- `DISCORD_TOKEN` - Discord Bot Token (von Discord Developer Portal)
- `DISCORD_CLIENT_ID` - Discord Application Client ID

## Installation & Setup
1. Bot Token von Discord Developer Portal holen
2. Token als Secret `DISCORD_TOKEN` hinzufügen
3. Client ID als Secret `DISCORD_CLIENT_ID` hinzufügen
4. Bot starten mit `npm start`

## Setup-Status
- ✅ Projekt importiert und Abhängigkeiten installiert
- ✅ Workflow konfiguriert
- ⏳ Warte auf Discord Bot Secrets (DISCORD_TOKEN, DISCORD_CLIENT_ID)

## Letzte Änderungen
- **2025-11-12**: GitHub Import in Replit abgeschlossen
- **2025-11-12**: npm Abhängigkeiten installiert
- **2025-11-12**: .gitignore für Node.js erstellt
- **2025-11-12**: Workflow "Discord Music Bot" konfiguriert
- **2025-11-12**: Projekt initialisiert mit Discord.js v14 und discord-player
- **2025-11-12**: Slash Commands System implementiert
- **2025-11-12**: 24/7 Auto-Join und Reconnect-Logik implementiert
- **2025-11-12**: Multi-Server Support mit YouTube/Spotify/Apple Music Extraction hinzugefügt

## Technologie-Stack
- **Runtime**: Node.js 20
- **Discord Framework**: Discord.js v14
- **Voice & Audio**: @discordjs/voice, @discordjs/opus
- **Music Player**: discord-player v6
- **Audio Extraction**: play-dl (YouTube), ffmpeg-static
- **Voice Encryption**: sodium-native
