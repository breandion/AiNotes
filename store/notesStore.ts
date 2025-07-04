import { Note, Folder } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FOLDERS_KEY = 'folders';
const NOTES_KEY = 'notes';

class NotesStore {
  private folders: Folder[] = [];
  private notes: Note[] = [];
  private isLoaded = false;
  private loadPromise: Promise<void> | null = null;

  constructor() {
    // Start loading data but don't wait for it
    this.loadPromise = this.loadData();
  }

  private async loadData(): Promise<void> {
    try {
      const [storedFolders, storedNotes] = await Promise.all([
        AsyncStorage.getItem(FOLDERS_KEY),
        AsyncStorage.getItem(NOTES_KEY)
      ]);

      if (storedFolders) {
        const parsedFolders = JSON.parse(storedFolders);
        // Convert date strings back to Date objects
        this.folders = parsedFolders.map((folder: any) => ({
          ...folder,
          createdAt: new Date(folder.createdAt)
        }));
      }

      if (storedNotes) {
        const parsedNotes = JSON.parse(storedNotes);
        // Convert date strings back to Date objects
        this.notes = parsedNotes.map((note: any) => ({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt)
        }));
      }

      this.isLoaded = true;
    } catch (error) {
      console.error('Error loading data from AsyncStorage:', error);
      this.isLoaded = true; // Set to true even on error to prevent infinite loading
    }
  }

  private async saveData(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.setItem(FOLDERS_KEY, JSON.stringify(this.folders)),
        AsyncStorage.setItem(NOTES_KEY, JSON.stringify(this.notes))
      ]);
    } catch (error) {
      console.error('Error saving data to AsyncStorage:', error);
    }
  }

  // Ensure data is loaded before returning
  private async ensureLoaded(): Promise<void> {
    if (!this.isLoaded && this.loadPromise) {
      await this.loadPromise;
    }
  }

  async getFolders(): Promise<Folder[]> {
    await this.ensureLoaded();
    return this.folders;
  }

  async getNotesByFolder(folderId: string): Promise<Note[]> {
    await this.ensureLoaded();
    return this.notes.filter(note => note.folderId === folderId);
  }

  async getNote(noteId: string): Promise<Note | undefined> {
    await this.ensureLoaded();
    return this.notes.find(note => note.id === noteId);
  }

  async createFolder(name: string, color: string): Promise<Folder> {
    await this.ensureLoaded();
    const folder: Folder = {
      id: Date.now().toString(),
      name,
      color,
      createdAt: new Date(),
    };
    this.folders.push(folder);
    await this.saveData();
    return folder;
  }

  async createNote(title: string, content: string, folderId: string): Promise<Note> {
    await this.ensureLoaded();
    const note: Note = {
      id: Date.now().toString(),
      title,
      content,
      folderId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.notes.push(note);
    await this.saveData();
    return note;
  }

  async updateNote(noteId: string, updates: Partial<Note>): Promise<Note | undefined> {
    await this.ensureLoaded();
    const noteIndex = this.notes.findIndex(note => note.id === noteId);
    if (noteIndex !== -1) {
      this.notes[noteIndex] = {
        ...this.notes[noteIndex],
        ...updates,
        updatedAt: new Date(),
      };
      await this.saveData();
      return this.notes[noteIndex];
    }
    return undefined;
  }

  async deleteNote(noteId: string): Promise<boolean> {
    await this.ensureLoaded();
    const index = this.notes.findIndex(note => note.id === noteId);
    if (index !== -1) {
      this.notes.splice(index, 1);
      await this.saveData();
      return true;
    }
    return false;
  }

  async searchNotes(query: string): Promise<Note[]> {
    await this.ensureLoaded();
    const lowercaseQuery = query.toLowerCase();
    return this.notes.filter(note =>
      note.title.toLowerCase().includes(lowercaseQuery) ||
      note.content.toLowerCase().includes(lowercaseQuery)
    );
  }
}

export const notesStore = new NotesStore();