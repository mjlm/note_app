import { NoteStorage } from './storage.js';

/**
 * Represents the main note-taking application that manages the UI and note operations.
 */
class NoteApp {
    /**
     * Initializes a new instance of the NoteApp class and sets up the application.
     */
    constructor() {
        this.initializeElements();
        this.noteId = this.initializeNoteId();
        this.setupEventListeners();
        this.loadInitialNote();
    }

    /**
     * Initializes references to DOM elements used throughout the application.
     */
    initializeElements() {
        this.textarea = document.getElementById("notepad");
        this.noteIdElement = document.getElementById("note-id");
        this.saveIndicator = document.getElementById("save-indicator");
        this.statsElement = document.getElementById("stats");
        this.notesTable = document.getElementById("notes-table");
    }

    /**
     * Initializes the note ID either from the URL hash or generates a new one.
     * Returns the initialized note ID.
     */
    initializeNoteId() {
        // Generate a shorter UUID (first 5 chars) if no hash is present in URL
        const id = window.location.hash.slice(1) || window.crypto.randomUUID().slice(0, 5);
        if (!window.location.hash) {
            window.location.hash = id;
        }
        this.noteIdElement.textContent = id;
        return id;
    }

    /**
     * Sets up event listeners for user interactions and window events.
     */
    setupEventListeners() {
        this.textarea.addEventListener("input", () => this.handleInput());
        window.addEventListener("beforeunload", () => this.saveNote());
        window.addEventListener("hashchange", () => this.loadNoteFromHash());
        
        document.getElementById("show-all-notes").addEventListener("click", 
            e => {
                e.preventDefault();
                this.showNotesTable();
            }
        );
        
        document.getElementById("close-table").addEventListener("click", 
            () => this.notesTable.classList.remove("visible")
        );
    }

    /**
     * Updates the statistics display with current note metrics (lines, words, chars).
     */
    updateStats() {
        const text = this.textarea.value;
        const lines = text.split("\n").length;
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        const chars = text.length;
        this.statsElement.textContent = `lines: ${lines}, words: ${words}, chars: ${chars}, `;
    }

    /**
     * Displays a temporary save indicator message that fades after 500ms.
     */
    showSaveIndicator(message = "Saved.") {
        this.saveIndicator.textContent = message;
        this.saveIndicator.classList.add("visible");
        setTimeout(() => this.saveIndicator.classList.remove("visible"), 500);
    }

    /**
     * Updates the document title based on the first line of the note.
     */
    updateTitle() {
        const firstLine = this.textarea.value.split("\n")[0];
        document.title = firstLine.substring(0, 20) || "New Note";
    }

    /**
     * Saves the current note content to storage.
     * Handles storage quota errors by attempting to remove old notes if needed.
     * Returns true if save was successful, false otherwise.
     */
    saveNote() {
        try {
            NoteStorage.save(this.noteId, this.textarea.value);
            return true;
        } catch (e) {
            // If we're out of storage space, try to make room by removing the oldest note
            if (e.name === "QuotaExceededError" && NoteStorage.removeOldestNote(this.noteId)) {
                return this.saveNote(); // Retry save after making space
            }
            this.showSaveIndicator("Save failed!");
            return false;
        }
    }

    /**
     * Handles input changes in the textarea, updating title and saving content.
     */
    handleInput() {
        this.updateTitle();
        if (this.saveNote()) {
            this.updateStats();
            this.showSaveIndicator();
        }
    }

    /**
     * Loads a note when the URL hash changes, updating the UI with the new note's content.
     */
    loadNoteFromHash() {
        const newNoteId = window.location.hash.slice(1);
        if (newNoteId && newNoteId !== this.noteId) {
            this.noteId = newNoteId;
            this.noteIdElement.textContent = this.noteId;
            
            const savedData = NoteStorage.load(this.noteId);
            this.textarea.value = savedData?.content || '';
            this.updateTitle();
            this.updateStats();
            // Hide the notes table when switching to a new note
            this.notesTable.classList.remove("visible");
        }
    }

    /**
     * Displays a table showing all saved notes with their IDs, timestamps, and previews.
     */
    showNotesTable() {
        const tbody = document.getElementById("notes-list");
        tbody.innerHTML = "";
        
        const notes = NoteStorage.getAllNotes();
        notes.forEach(note => {
            const tr = document.createElement("tr");
            const content = note.content || "";
            // Create a row for each note with ID, timestamp, and truncated content
            tr.innerHTML = `
                <td><a href="#${note.id}" style="color: inherit;">${note.id}</a></td>
                <td>${new Date(note.timestamp).toLocaleString()}</td>
                <td>${content.replace(/\n/g, " ").substring(0, 100)}${content.length > 100 ? "..." : ""}</td>
            `;
            tbody.appendChild(tr);
        });
        
        this.notesTable.classList.add("visible");
    }

    /**
     * Gets URL parameters from the current location.
     * @returns {URLSearchParams} The URL search parameters
     */
    getUrlParams() {
        return new URLSearchParams(window.location.search);
    }

    /**
     * Loads the initial note content when the application starts.
     */
    loadInitialNote() {
        const savedData = NoteStorage.load(this.noteId);
        const params = this.getUrlParams();
        const noteContent = params.get('note');

        if (noteContent) {
            // If we have content in URL param, use it and save as new note
            this.textarea.value = decodeURIComponent(noteContent);
            this.saveNote();
            // Position cursor at the end of the content
            this.textarea.focus();
            this.textarea.setSelectionRange(this.textarea.value.length, this.textarea.value.length);
            // Clear the URL parameter while preserving the hash
            const newUrl = window.location.pathname + window.location.hash;
            window.history.replaceState({}, '', newUrl);
        } else if (savedData) {
            this.textarea.value = savedData.content || '';
        }
        this.updateTitle();
        this.updateStats();
    }
}

// Initialize the app
new NoteApp(); 