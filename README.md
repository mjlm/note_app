# Simple Note Taking App 📝

A lightweight, browser-based note taking app that runs entirely client-side. Each note gets a unique 5-character ID that's stored in the URL, making notes bookmarkable and accessible across browser restarts.

## Features

- 🔄 Automatic saving to localStorage
- 🔗 Persistent across browser restarts via URL-based IDs
- 📊 Real-time word, line, and character counting
- 🧹 Automatic cleanup of old notes when storage is full
- 🎨 Clean, minimalist interface
- 🚀 Quick note creation via URL parameters

## Storage Details

Notes are saved in your browser's localStorage, which means:
- Notes are browser-specific (not shared between browsers/devices)
- When storage is full, least recently edited notes are automatically removed
- Approximately 5MB total storage (browser dependent)
- Each note gets a unique 5-character ID derived from UUID

## Usage

1. Open the page to create a new note
2. Bookmark the URL to save the note for later access
3. Notes are saved automatically while typing
4. Note content is stored locally in your browser only
5. The same URL in different browsers will have different content

### Quick Note Creation

You can create a new note with initial content directly from the URL using the `note` parameter:

```
http://your-app-url/?note=Your note content here
```

This is especially useful when setting up browser search keywords. For example, you can:
1. Create a new search keyword in your browser (e.g., "note")
2. Set it to expand to: `http://your-app-url/?note=%s`
3. Then quickly create notes by typing in your address bar:
   ```
   note This is my new note content
   ```

The note will be created with a new unique ID and your content pre-filled.

## Technical Details

The app is built using vanilla JavaScript with modern ES6 modules and features:
- No external dependencies
- CSS custom properties for theming
- Modular code organization
- LocalStorage for data persistence
- URL hash-based routing
- URL parameter support for quick note creation

## Privacy

All note data stays in your browser's localStorage. No data is ever sent to any server. 