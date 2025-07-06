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
} from 'lucide-react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

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
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme];

  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <View style={styles.leftSection}>
          <TouchableOpacity style={styles.toolButton} onPress={onUndo}>
            <Undo2 color={colors.textSecondary} size={18} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.toolButton} onPress={onRedo}>
            <Redo2 color={colors.textSecondary} size={18} />
          </TouchableOpacity>
          
          <View style={styles.separator} />
          
          <TouchableOpacity style={styles.toolButton} onPress={onBold}>
            <Bold color={colors.textSecondary} size={18} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.toolButton} onPress={onItalic}>
            <Italic color={colors.textSecondary} size={18} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.toolButton} onPress={onList}>
            <List color={colors.textSecondary} size={18} />
          </TouchableOpacity>
          
          <View style={styles.separator} />
          
          <TouchableOpacity style={styles.aiButton} onPress={onAI}>
            <Sparkles color={colors.primary} size={16} />
            <Text style={styles.aiButtonText}>AI</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.rightSection}>
          <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
            <ChevronDown color={colors.textSecondary} size={20} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors: typeof Colors.light) => StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    // Remove platform-specific positioning - let parent handle it
  },
  toolbar: {
    
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
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 4,
  },
  aiButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: colors.primary,
    marginLeft: 4,
  },
  dismissButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  separator: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
    marginHorizontal: 8,
  },
});