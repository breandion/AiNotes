import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  BackHandler,
  Platform,
  AppState,
  Keyboard, KeyboardAvoidingView 
} from 'react-native';
import { Plus, Search } from 'lucide-react-native';
import { notesStore } from '@/store/notesStore';
import { Folder, Note } from '@/types';
import FolderCard from '@/components/FolderCard';
import NoteCard from '@/components/NoteCard';
import CreateFolderModal from '@/components/CreateFolderModal';
import NotionHeader from '@/components/NotionHeader';
import UserProfileSheet from '@/components/UserProfileSheet';

type ViewMode = 'folders' | 'notes' | 'note-detail';

export default function NotesTab() {
  const [viewMode, setViewMode] = useState<ViewMode>('folders');
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Local state for note editing to prevent lag
  const [localNoteTitle, setLocalNoteTitle] = useState('');
  const [localNoteContent, setLocalNoteContent] = useState('');
  const titleUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const contentUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [keyboardVisible, setKeyboardVisible] = useState(false);

useEffect(() => {
  const showSubscription = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
  const hideSubscription = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));

  return () => {
    showSubscription.remove();
    hideSubscription.remove();
  };
}, []);

  const KeyboardToolbar = () => (
  <View style={styles.keyboardToolbar}>
    <TouchableOpacity>
      <Text style={styles.toolbarButton}>Undo</Text>
    </TouchableOpacity>
    <TouchableOpacity>
      <Text style={styles.toolbarButton}>Redo</Text>
    </TouchableOpacity>
    <TouchableOpacity>
      <Text style={styles.toolbarButton}>AI ✨</Text>
    </TouchableOpacity>
  </View>
);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Handle app state changes to force save when app goes to background
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        notesStore.forceSaveAll();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  // Update local state when selected note changes
  useEffect(() => {
    if (selectedNote) {
      setLocalNoteTitle(selectedNote.title);
      setLocalNoteContent(selectedNote.content);
    }
  }, [selectedNote?.id]); // Only trigger when note ID changes, not on every update

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const loadedFolders = await notesStore.getFolders();
      setFolders(loadedFolders);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Android back button handler
  useEffect(() => {
    if (Platform.OS === 'android') {
      const backAction = () => {
        if (viewMode === 'note-detail') {
          handleBackToNotes();
          return true; // Prevent default back action
        } else if (viewMode === 'notes') {
          handleBackToFolders();
          return true; // Prevent default back action
        }
        return false; // Allow default back action (exit app)
      };

      const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

      return () => backHandler.remove();
    }
  }, [viewMode]);

  const handleFolderPress = async (folder: Folder) => {
    setSelectedFolder(folder);
    try {
      const folderNotes = await notesStore.getNotesByFolder(folder.id);
      setNotes(folderNotes);
      setViewMode('notes');
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const handleNotePress = (note: Note) => {
    setSelectedNote(note);
    setViewMode('note-detail');
  };

  const handleBackToFolders = () => {
    setViewMode('folders');
    setSelectedFolder(null);
    setSearchQuery('');
  };

  const handleBackToNotes = async () => {
    // Force save any pending changes before going back
    await notesStore.forceSaveAll();
    
    setViewMode('notes');
    setSelectedNote(null);
    
    // Refresh notes list to show updated data
    if (selectedFolder) {
      const updatedNotes = await notesStore.getNotesByFolder(selectedFolder.id);
      setNotes(updatedNotes);
    }
  };

  const handleCreateFolder = async (name: string, color: string) => {
    try {
      await notesStore.createFolder(name, color);
      const updatedFolders = await notesStore.getFolders();
      setFolders(updatedFolders);
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };

  const handleCreateNote = async () => {
    if (selectedFolder) {
      try {
        const newNote = await notesStore.createNote(
          'New Note',
          'Start writing your note here...',
          selectedFolder.id
        );
        const updatedNotes = await notesStore.getNotesByFolder(selectedFolder.id);
        setNotes(updatedNotes);
        setSelectedNote(newNote);
        setViewMode('note-detail');
      } catch (error) {
        console.error('Error creating note:', error);
      }
    }
  };

  const handleUpdateNoteContent = (content: string) => {
    if (!selectedNote) return;

    // Update local state immediately for responsive UI
    setLocalNoteContent(content);

    // Clear existing timeout
    if (contentUpdateTimeoutRef.current) {
      clearTimeout(contentUpdateTimeoutRef.current);
    }

    // Use optimistic update for immediate UI response
    const updatedNote = notesStore.updateNoteOptimistic(selectedNote.id, { content });
    if (updatedNote) {
      setSelectedNote(updatedNote);
    }
  };

  const handleUpdateNoteTitle = (newTitle: string) => {
    if (!selectedNote) return;

    // Update local state immediately for responsive UI
    setLocalNoteTitle(newTitle);

    // Clear existing timeout
    if (titleUpdateTimeoutRef.current) {
      clearTimeout(titleUpdateTimeoutRef.current);
    }

    // Use optimistic update for immediate UI response
    const updatedNote = notesStore.updateNoteOptimistic(selectedNote.id, { title: newTitle });
    if (updatedNote) {
      setSelectedNote(updatedNote);
    }
  };

  const handleLogout = () => {
    setShowUserProfile(false);
    // Implement logout logic here
    console.log('Logout pressed');
  };

  const handleSettings = () => {
    setShowUserProfile(false);
    // Navigate to settings
    console.log('Settings pressed');
  };

  const renderFoldersView = () => (
    <View style={styles.container}>
      <NotionHeader
        showUser
        onUserPress={() => setShowUserProfile(true)}
        subtitle="Personal workspace"
        rightAction={
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowCreateFolder(true)}
          >
            <Plus color="#ffffff" size={18} />
          </TouchableOpacity>
        }
      />

      <View style={styles.searchContainer}>
        <Search color="#6b7280" size={18} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search notes..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Folders</Text>
          <Text style={styles.sectionCount}>{folders.length}</Text>
        </View>
        
        {isLoading ? (
          <View style={styles.loadingState}>
            <Text style={styles.loadingText}>Loading folders...</Text>
          </View>
        ) : (
          folders.map((folder) => (
            <FolderCard
              key={folder.id}
              folder={folder}
              noteCount={0} 
              onPress={() => handleFolderPress(folder)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );

  const renderNotesView = () => (
    <View style={styles.container}>
      <NotionHeader
        title={selectedFolder?.name}
        subtitle={`${notes.length} notes`}
        showBack
        onBack={handleBackToFolders}
        rightAction={
          <TouchableOpacity style={styles.addButton} onPress={handleCreateNote}>
            <Plus color="#ffffff" size={18} />
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {notes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            onPress={() => handleNotePress(note)}
          />
        ))}
        {notes.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No notes yet</Text>
            <Text style={styles.emptySubtext}>
              Tap the + button to create your first note
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );

  const renderNoteDetailView = () => (
    <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
    <View style={styles.container}>
      <NotionHeader
        title={localNoteTitle || 'Untitled'}
        showBack
        onBack={handleBackToNotes}
      />

      <View style={styles.noteEditor}>
        <TextInput
          style={styles.titleInput}
          value={localNoteTitle}
          onChangeText={handleUpdateNoteTitle}
          placeholder="Title"
          placeholderTextColor="#888"          
        />
        <TextInput
          style={styles.noteInput}
          value={localNoteContent}
          onChangeText={handleUpdateNoteContent}
          multiline
          placeholder="Start writing..."
          textAlignVertical="top"
        />
      </View>
    </View>
      </KeyboardAvoidingView>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {viewMode === 'folders' && renderFoldersView()}
      {viewMode === 'notes' && renderNotesView()}
      {viewMode === 'note-detail' && renderNoteDetailView()}

      <CreateFolderModal
        visible={showCreateFolder}
        onClose={() => setShowCreateFolder(false)}
        onCreate={handleCreateFolder}
      />

      <UserProfileSheet
        visible={showUserProfile}
        onClose={() => setShowUserProfile(false)}
        onLogout={handleLogout}
        onSettings={handleSettings}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  keyboardToolbar: {
  flexDirection: 'row',
  justifyContent: 'space-around',
  backgroundColor: '#f1f5f9',
  padding: 10,
  borderTopWidth: 1,
  borderColor: '#e5e7eb',
},

toolbarButton: {
  fontSize: 14,
  fontFamily: 'Inter-Medium',
  color: '#3b82f6',
},
  titleInput: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
  },
  addButton: {
    backgroundColor: '#3b82f6',
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#111827',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionCount: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#9ca3af',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#6b7280',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9ca3af',
    textAlign: 'center',
  },
  loadingState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
  },
  noteEditor: {
    flex: 1,
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  noteInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
    lineHeight: 24,
  },
});