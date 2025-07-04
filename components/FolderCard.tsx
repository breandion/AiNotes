import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Folder, FileText } from 'lucide-react-native';
import { Folder as FolderType } from '@/types';

interface FolderCardProps {
  folder: FolderType;
  noteCount: number;
  onPress: () => void;
}

export default function FolderCard({ folder, noteCount, onPress }: FolderCardProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: folder.color }]}>
            <Folder color="#ffffff" size={20} />
          </View>
          <View style={styles.folderInfo}>
            <Text style={styles.folderName}>{folder.name}</Text>
            <View style={styles.noteInfo}>
              <FileText color="#9ca3af" size={14} />
              <Text style={styles.noteCount}>{noteCount} notes</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  content: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  folderInfo: {
    flex: 1,
  },
  folderName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 4,
  },
  noteInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noteCount: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    marginLeft: 4,
  },
});