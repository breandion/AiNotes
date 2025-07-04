import { Note, Folder } from '@/types';

const FOLDERS_KEY = 'folders';
const NOTES_KEY = 'notes';

// Check if we're in a client-side environment
const isClient = typeof window !== 'undefined';

class NotesStore {
  private folders: Folder[] = [];
  private notes: Note[] = [];
  private isLoaded = false;
  private loadPromise: Promise<void> | null = null;
  private saveTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private pendingUpdates: Map<string, Partial<Note>> = new Map();
  private AsyncStorage: any = null;

  constructor() {
    // Only start loading data if we're on the client side
    if (isClient) {
      this.loadPromise = this.loadData();
    } else {
      // On server side, mark as loaded immediately
      this.isLoaded = true;
      this.loadPromise = Promise.resolve();
    }
  }

  private async getAsyncStorage() {
    if (!this.AsyncStorage && isClient) {
      const AsyncStorageModule = await import('@react-native-async-storage/async-storage');
      this.AsyncStorage = AsyncStorageModule.default;
    }
    return this.AsyncStorage;
  }

  private async loadData(): Promise<void> {
    if (!isClient) {
      this.isLoaded = true;
      return;
    }

    try {
      const AsyncStorage = await this.getAsyncStorage();
      if (!AsyncStorage) {
        this.isLoaded = true;
        return;
      }

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
    if (!isClient) {
      return;
    }

    try {
      const AsyncStorage = await this.getAsyncStorage();
      if (!AsyncStorage) {
        return;
      }

      await Promise.all([
        AsyncStorage.setItem(FOLDERS_KEY, JSON.stringify(this.folders)),
        AsyncStorage.setItem(NOTES_KEY, JSON.stringify(this.notes))
      ]);
    } catch (error) {
      console.error('Error saving data to AsyncStorage:', error);
    }
  }

  private debouncedSave(noteId: string, delay: number = 1000): void {
    // Clear existing timeout for this note
    const existingTimeout = this.saveTimeouts.get(noteId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Set new timeout
    const timeout = setTimeout(async () => {
      await this.saveData();
      this.saveTimeouts.delete(noteId);
      this.pendingUpdates.delete(noteId);
    }, delay);

    this.saveTimeouts.set(noteId, timeout);
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

  // Optimistic update with debounced saving
  updateNoteOptimistic(noteId: string, updates: Partial<Note>): Note | undefined {
    const noteIndex = this.notes.findIndex(note => note.id === noteId);
    if (noteIndex !== -1) {
      // Apply optimistic update immediately
      this.notes[noteIndex] = {
        ...this.notes[noteIndex],
        ...updates,
        updatedAt: new Date(),
      };

      // Store pending update
      const existingUpdate = this.pendingUpdates.get(noteId) || {};
      this.pendingUpdates.set(noteId, { ...existingUpdate, ...updates });

      // Debounce the save operation
      this.debouncedSave(noteId);

      return this.notes[noteIndex];
    }
    return undefined;
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
    
    // Clear any pending saves for this note
    const existingTimeout = this.saveTimeouts.get(noteId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      this.saveTimeouts.delete(noteId);
    }
    this.pendingUpdates.delete(noteId);

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

  // Force save all pending updates (useful when app goes to background)
  async forceSaveAll(): Promise<void> {
    if (!isClient) {
      return;
    }

    // Clear all timeouts and save immediately
    for (const timeout of this.saveTimeouts.values()) {
      clearTimeout(timeout);
    }
    this.saveTimeouts.clear();
    this.pendingUpdates.clear();
    await this.saveData();
  }
}

export const notesStore = new NotesStore();