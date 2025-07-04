import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { 
  Undo2, 
  Redo2, 
  Bold, 
  Italic, 
  List, 
  Sparkles,
  ChevronDown,
  Type
} from 'lucide-react-native';

interface KeyboardToolbarProps {
  onUndo?: () => void;
  onRedo?: () => void;
  onBold?: () => void;
  onItalic?: () => void;
  onList?: () => void;
  onAI?: () => void;
  onDismiss?: () => void;
}

export default function KeyboardToolbar({
  onUndo,
  onRedo,
  onBold,
  onItalic,
  onList,
  onAI,
  onDismiss,
}: KeyboardToolbarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <View style={styles.leftSection}>
          <TouchableOpacity style={styles.toolButton} onPress={onUndo}>
            <Undo2 color="#6b7280" size={18} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.toolButton} onPress={onRedo}>
            <Redo2 color="#6b7280" size={18} />
          </TouchableOpacity>
          
          <View style={styles.separator} />
          
          <TouchableOpacity style={styles.toolButton} onPress={onBold}>
            <Bold color="#6b7280" size={18} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.toolButton} onPress={onItalic}>
            <Italic color="#6b7280" size={18} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.toolButton} onPress={onList}>
            <List color="#6b7280" size={18} />
          </TouchableOpacity>
          
          <View style={styles.separator} />
          
          <TouchableOpacity style={styles.aiButton} onPress={onAI}>
            <Sparkles color="#3b82f6" size={16} />
            <Text style={styles.aiButtonText}>AI</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.rightSection}>
          <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
            <ChevronDown color="#6b7280" size={20} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8fafc',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 44,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toolButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 4,
  },
  aiButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#3b82f6',
    marginLeft: 4,
  },
  dismissButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  separator: {
    width: 1,
    height: 20,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 8,
  },
});