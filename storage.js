/**
 * Provides persistent storage operations for notes using localStorage.
 * Handles saving, loading, and managing notes in the browser's local storage.
 */
export class NoteStorage {
    /**
     * Saves a note with the given ID and content to localStorage.
     * Adds a timestamp to track when the note was last modified.
     * Only saves notes that contain non-whitespace characters.
     * @param {string} id - The unique identifier for the note.
     * @param {string} content - The content of the note to save.
     * @returns {boolean} True if the note was saved, false if it was empty or whitespace-only.
     */
    static save(id, content) {
        // Check if content is empty or contains only whitespace
        if (!content || !content.trim()) {
            return false;
        }

        const noteData = {
            content,
            timestamp: Date.now()
        };
        localStorage.setItem(`note_${id}`, JSON.stringify(noteData));
        return true;
    }

    /**
     * Loads a note from localStorage by its ID.
     * Includes backwards compatibility for old format notes.
     * @param {string} id - The unique identifier of the note to load.
     * @returns {Object|null} The note data object if found, null otherwise.
     */
    static load(id) {
        const data = localStorage.getItem(`note_${id}`);
        if (!data) return null;
        try {
            return JSON.parse(data);
        } catch {
            // Handle legacy format where notes were stored as plain strings
            return { content: data, timestamp: 0 }; // Handle old format
        }
    }

    /**
     * Retrieves all notes from localStorage, sorted by timestamp (newest first).
     * @returns {Array} An array of note objects, each containing id, timestamp, and content.
     */
    static getAllNotes() {
        return Object.keys(localStorage)
            .filter(key => key.startsWith("note_"))
            .map(key => {
                const id = key.slice(5); // Remove 'note_' prefix
                const data = this.load(id);
                return {
                    id,
                    timestamp: data.timestamp,
                    content: data.content || ''
                };
            })
            .sort((a, b) => b.timestamp - a.timestamp);
    }

    /**
     * Removes the oldest note from localStorage to free up space.
     * Excludes the current note from consideration for removal.
     * @param {string} currentId - The ID of the current note to preserve.
     * @returns {boolean} True if a note was removed, false if no notes were available to remove.
     */
    static removeOldestNote(currentId) {
        const notes = this.getAllNotes()
            .filter(note => note.id !== currentId)
            .sort((a, b) => a.timestamp - b.timestamp);
        
        if (notes.length > 0) {
            localStorage.removeItem(`note_${notes[0].id}`);
            return true;
        }
        return false;
    }
} 