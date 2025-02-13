// Handles all localStorage operations
export class NoteStorage {
    static save(id, content) {
        const noteData = {
            content,
            timestamp: Date.now()
        };
        localStorage.setItem(`note_${id}`, JSON.stringify(noteData));
    }

    static load(id) {
        const data = localStorage.getItem(`note_${id}`);
        if (!data) return null;
        try {
            return JSON.parse(data);
        } catch {
            return { content: data, timestamp: 0 }; // Handle old format
        }
    }

    static getAllNotes() {
        return Object.keys(localStorage)
            .filter(key => key.startsWith("note_"))
            .map(key => {
                const id = key.slice(5);
                const data = this.load(id);
                return {
                    id,
                    timestamp: data.timestamp,
                    content: data.content || ''
                };
            })
            .sort((a, b) => b.timestamp - a.timestamp);
    }

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