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
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native';
import { Plus, Search } from 'lucide-react-native';
import { notesStore } from '@/store/notesStore';
import { Folder, Note } from '@/types';
import FolderCard from '@/components/FolderCard';
import NoteCard from '@/components/NoteCard';
import CreateFolderModal from '@/components/CreateFolderModal';
import NotionHeader from '@/components/NotionHeader';
import UserProfileSheet from '@/components/UserProfileSheet';
import KeyboardToolbar from '@/components/KeyboardToolbar';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

type ViewMode = 'folders' | 'notes' | 'note-detail';

export default function NotesTab() {
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme];
  
  const [viewMode, setViewMode] = useState<ViewMode>('folders');
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [folderNoteCounts, setFolderNoteCounts] = useState<Record<string, number>>({});

  // Local state for note editing to prevent lag
  const [localNoteTitle, setLocalNoteTitle] = useState('');
  const [localNoteContent, setLocalNoteContent] = useState('');
  const titleUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const contentUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const styles = createStyles(colors);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Enhanced keyboard listeners for both platforms
  useEffect(() => {
    let keyboardDidShowListener: any;
    let keyboardDidHideListener: any;
    let keyboardWillShowListener: any;
    let keyboardWillHideListener: any;

    if (Platform.OS === 'ios') {
      // Use will events for iOS for better timing
      keyboardWillShowListener = Keyboard.addListener(
        'keyboardWillShow',
        (e) => {
          setIsKeyboardVisible(true);
          setKeyboardHeight(e.endCoordinates.height);
        }
      );
      
      keyboardWillHideListener = Keyboard.addListener(
        'keyboardWillHide',
        () => {
          setIsKeyboardVisible(false);
          setKeyboardHeight(0);
        }
      );
    } else {
      // Use did events for Android
      keyboardDidShowListener = Keyboard.addListener(
        'keyboardDidShow',
        (e) => {
          setIsKeyboardVisible(true);
          setKeyboardHeight(e.endCoordinates.height);
        }
      );
      
      keyboardDidHideListener = Keyboard.addListener(
        'keyboardDidHide',
        () => {
          setIsKeyboardVisible(false);
          setKeyboardHeight(0);
        }
      );
    }

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
      keyboardWillShowListener?.remove();
      keyboardWillHideListener?.remove();
    };
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

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const loadedFolders = await notesStore.getFolders();
      setFolders(loadedFolders);
      
      // Load note counts for each folder
      const counts: Record<string, number> = {};
      for (const folder of loadedFolders) {
        const folderNotes = await notesStore.getNotesByFolder(folder.id);
        counts[folder.id] = folderNotes.length;
      }
      setFolderNoteCounts(counts);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
      
      // Update note counts
      const counts: Record<string, number> = {};
      for (const folder of updatedFolders) {
        const folderNotes = await notesStore.getNotesByFolder(folder.id);
        counts[folder.id] = folderNotes.length;
      }
      setFolderNoteCounts(counts);
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
        
        // Update folder note count
        setFolderNoteCounts(prev => ({
          ...prev,
          [selectedFolder.id]: updatedNotes.length
        }));
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

  // Keyboard toolbar handlers
  const handleUndo = () => {
    console.log('Undo pressed');
    // Implement undo functionality
  };

  const handleRedo = () => {
    console.log('Redo pressed');
    // Implement redo functionality
  };

  const handleBold = () => {
    console.log('Bold pressed');
    // Implement bold formatting
  };

  const handleItalic = () => {
    console.log('Italic pressed');
    // Implement italic formatting
  };

  const handleList = () => {
    console.log('List pressed');
    // Implement list formatting
  };

  const handleAI = () => {
    console.log('AI pressed');
    // Implement AI assistance
  };

  const handleDismissKeyboard = () => {
    Keyboard.dismiss();
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
        <Search color={colors.textSecondary} size={18} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search notes..."
          placeholderTextColor={colors.textTertiary}
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
              noteCount={folderNoteCounts[folder.id] || 0}
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
    <View style={styles.container}>
      <NotionHeader
        title={localNoteTitle || 'Untitled'}
        showBack
        onBack={handleBackToNotes}
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.noteEditorWrapper}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <View style={styles.noteEditor}>
          <TextInput
            style={styles.titleInput}
            value={localNoteTitle}
            onChangeText={handleUpdateNoteTitle}
            placeholder="Title"
            placeholderTextColor={colors.textTertiary}          
          />
          <TextInput
            style={styles.noteInput}
            value={localNoteContent}
            onChangeText={handleUpdateNoteContent}
            multiline
            placeholder="Start writing..."
            placeholderTextColor={colors.textTertiary}
            textAlignVertical="top"
          />
        </View>      
        {isKeyboardVisible && (
          <View style={[
            styles.keyboardToolbarContainer,
            Platform.OS === 'ios' && { 
              position: 'absolute',
              marginBottom: 0
            },
            Platform.OS === 'android' && {
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
            }
          ]}>
            <KeyboardToolbar
              onUndo={handleUndo}
              onRedo={handleRedo}
              onBold={handleBold}
              onItalic={handleItalic}
              onList={handleList}
              onAI={handleAI}
              onDismiss={handleDismissKeyboard}
            />
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
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

const createStyles = (colors: typeof Colors.light) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  addButton: {
    backgroundColor: colors.primary,
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: colors.text,
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
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionCount: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: colors.textTertiary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: colors.textTertiary,
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
    color: colors.textSecondary,
  },
  noteEditorWrapper: {
    flex: 1,
    position: 'relative',
  },
  noteEditor: {
    flex: 1,
    margin: 10,
    padding: 20,
  },
  titleInput: {
    fontSize: 24,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
    color: colors.text,
  },
  noteInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: colors.text,
    lineHeight: 24,
  },
  keyboardToolbarContainer: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    zIndex: 1000,
  },
});