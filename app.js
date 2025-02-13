import { NoteStorage } from './storage.js';

class NoteApp {
    constructor() {
        this.initializeElements();
        this.noteId = this.initializeNoteId();
        this.setupEventListeners();
        this.loadInitialNote();
    }

    initializeElements() {
        this.textarea = document.getElementById("notepad");
        this.noteIdElement = document.getElementById("note-id");
        this.saveIndicator = document.getElementById("save-indicator");
        this.statsElement = document.getElementById("stats");
        this.notesTable = document.getElementById("notes-table");
    }

    initializeNoteId() {
        const id = window.location.hash.slice(1) || window.crypto.randomUUID().slice(0, 5);
        if (!window.location.hash) {
            window.location.hash = id;
        }
        this.noteIdElement.textContent = id;
        return id;
    }

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

    updateStats() {
        const text = this.textarea.value;
        const lines = text.split("\n").length;
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        const chars = text.length;
        this.statsElement.textContent = `lines: ${lines}, words: ${words}, chars: ${chars}, `;
    }

    showSaveIndicator(message = "Saved.") {
        this.saveIndicator.textContent = message;
        this.saveIndicator.classList.add("visible");
        setTimeout(() => this.saveIndicator.classList.remove("visible"), 500);
    }

    updateTitle() {
        const firstLine = this.textarea.value.split("\n")[0];
        document.title = firstLine.substring(0, 20) || "New Note";
    }

    saveNote() {
        try {
            NoteStorage.save(this.noteId, this.textarea.value);
            return true;
        } catch (e) {
            if (e.name === "QuotaExceededError" && NoteStorage.removeOldestNote(this.noteId)) {
                return this.saveNote(); // Retry save after making space
            }
            this.showSaveIndicator("Save failed!");
            return false;
        }
    }

    handleInput() {
        this.updateTitle();
        if (this.saveNote()) {
            this.updateStats();
            this.showSaveIndicator();
        }
    }

    loadNoteFromHash() {
        const newNoteId = window.location.hash.slice(1);
        if (newNoteId && newNoteId !== this.noteId) {
            this.noteId = newNoteId;
            this.noteIdElement.textContent = this.noteId;
            
            const savedData = NoteStorage.load(this.noteId);
            this.textarea.value = savedData?.content || '';
            this.updateTitle();
            this.updateStats();
            this.notesTable.classList.remove("visible");
        }
    }

    showNotesTable() {
        const tbody = document.getElementById("notes-list");
        tbody.innerHTML = "";
        
        const notes = NoteStorage.getAllNotes();
        notes.forEach(note => {
            const tr = document.createElement("tr");
            const content = note.content || "";
            tr.innerHTML = `
                <td><a href="#${note.id}" style="color: inherit;">${note.id}</a></td>
                <td>${new Date(note.timestamp).toLocaleString()}</td>
                <td>${content.replace(/\n/g, " ").substring(0, 100)}${content.length > 100 ? "..." : ""}</td>
            `;
            tbody.appendChild(tr);
        });
        
        this.notesTable.classList.add("visible");
    }

    loadInitialNote() {
        const savedData = NoteStorage.load(this.noteId);
        if (savedData) {
            this.textarea.value = savedData.content || '';
            this.updateTitle();
        }
        this.updateStats();
    }
}

// Initialize the app
new NoteApp(); 