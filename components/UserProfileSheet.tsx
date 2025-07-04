import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  SafeAreaView,
  Image,
} from 'react-native';
import { X, User, Settings, LogOut, Crown } from 'lucide-react-native';

interface UserProfileSheetProps {
  visible: boolean;
  onClose: () => void;
  onLogout: () => void;
  onSettings: () => void;
}

export default function UserProfileSheet({
  visible,
  onClose,
  onLogout,
  onSettings,
}: UserProfileSheetProps) {
  const user = {
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    plan: 'Pro',
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      presentationStyle="overFullScreen"
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />
        <SafeAreaView style={styles.container}>
          <View style={styles.sheet}>
            <View style={styles.header}>
              <View style={styles.dragHandle} />
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <X color="#6b7280" size={20} />
              </TouchableOpacity>
            </View>

            <View style={styles.content}>
              <View style={styles.profileSection}>
                <View style={styles.avatarContainer}>
                  <Image source={{ uri: user.avatar }} style={styles.avatar} />
                  <View style={styles.planBadge}>
                    <Crown color="#f59e0b" size={12} fill="#f59e0b" />
                    <Text style={styles.planText}>{user.plan}</Text>
                  </View>
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.userEmail}>{user.email}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.menuSection}>
                <TouchableOpacity style={styles.menuItem} onPress={onSettings}>
                  <View style={styles.menuItemLeft}>
                    <View style={[styles.menuIcon, { backgroundColor: '#f3f4f6' }]}>
                      <Settings color="#6b7280" size={18} />
                    </View>
                    <Text style={styles.menuItemText}>Account Settings</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                  <View style={styles.menuItemLeft}>
                    <View style={[styles.menuIcon, { backgroundColor: '#fef3c7' }]}>
                      <Crown color="#f59e0b" size={18} />
                    </View>
                    <Text style={styles.menuItemText}>Upgrade Plan</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={onLogout}>
                  <View style={styles.menuItemLeft}>
                    <View style={[styles.menuIcon, { backgroundColor: '#fee2e2' }]}>
                      <LogOut color="#ef4444" size={18} />
                    </View>
                    <Text style={[styles.menuItemText, { color: '#ef4444' }]}>
                      Sign Out
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  container: {
    backgroundColor: 'transparent',
  },
  sheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: 400,
  },
  header: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
    position: 'relative',
  },
  dragHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 24,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f3f4f6',
  },
  planBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  planText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#f59e0b',
    marginLeft: 2,
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginBottom: 24,
  },
  menuSection: {
    gap: 4,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#111827',
  },
});