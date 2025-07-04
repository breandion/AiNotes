import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
} from 'react-native';
import { ArrowLeft, MoveHorizontal as MoreHorizontal } from 'lucide-react-native';

interface NotionHeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  showUser?: boolean;
  onUserPress?: () => void;
  rightAction?: React.ReactNode;
  subtitle?: string;
  showBackWithTitle?: string;
}

export default function NotionHeader({
  title,
  showBack = false,
  onBack,
  showUser = false,
  onUserPress,
  rightAction,
  subtitle,
  showBackWithTitle
}: NotionHeaderProps) {
  const user = {
    name: 'Alex Johnson',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&fit=crop',
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.left}>

          {showBack && (
            showBackWithTitle ? (
              <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <ArrowLeft color="#6b7280" size={20} />
              <Text>{showBackWithTitle}</Text>
            </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <ArrowLeft color="#6b7280" size={20} />
            </TouchableOpacity>
            )
          )}
          
          {showUser && (
            <TouchableOpacity style={styles.userButton} onPress={onUserPress}>
              <Image source={{ uri: user.avatar }} style={styles.userAvatar} />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.name}</Text>
                {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
              </View>
            </TouchableOpacity>
          )}
          
          {!showUser && title && (
            <View style={styles.titleContainer}>
              <Text style={styles.title} numberOfLines={1}>
                {title}
              </Text>
              {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>
          )}
        </View>

        <View style={styles.right}>
          {rightAction || (
            <TouchableOpacity style={styles.moreButton}>
              <MoreHorizontal color="#6b7280" size={20} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 56,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  userButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingVertical: 4,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    lineHeight: 20,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    lineHeight: 20,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    marginTop: 1,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  moreButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
});