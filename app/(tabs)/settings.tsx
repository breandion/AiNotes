import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Switch,
} from 'react-native';
import { User, Bell, Shield, Palette, CircleHelp as HelpCircle, Info, ChevronRight, Moon, Sun, Smartphone } from 'lucide-react-native';
import NotionHeader from '@/components/NotionHeader';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

interface SettingItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}

function SettingItem({ icon, title, subtitle, onPress, rightElement }: SettingItemProps) {
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme];
  const styles = createStyles(colors);

  return (
    <TouchableOpacity style={styles.settingItem} onPress={onPress} disabled={!onPress}>
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          {icon}
        </View>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightElement || <ChevronRight color={colors.border} size={18} />}
    </TouchableOpacity>
  );
}

export default function SettingsTab() {
  const { colorScheme, userPreference, setColorScheme } = useColorScheme();
  const colors = Colors[colorScheme];
  const styles = createStyles(colors);

  const getThemeIcon = () => {
    switch (userPreference) {
      case 'light':
        return <Sun color={colors.textSecondary} size={20} />;
      case 'dark':
        return <Moon color={colors.textSecondary} size={20} />;
      default:
        return <Smartphone color={colors.textSecondary} size={20} />;
    }
  };

  const getThemeSubtitle = () => {
    switch (userPreference) {
      case 'light':
        return 'Always use light theme';
      case 'dark':
        return 'Always use dark theme';
      default:
        return 'Follow system setting';
    }
  };

  const handleThemePress = () => {
    // Cycle through theme options
    const nextTheme = userPreference === 'auto' ? 'light' : 
                     userPreference === 'light' ? 'dark' : 'auto';
    setColorScheme(nextTheme);
  };

  return (
    <SafeAreaView style={styles.container}>
      <NotionHeader
        title="Settings"
        subtitle="Manage your preferences"
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon={<User color={colors.textSecondary} size={20} />}
              title="Profile"
              subtitle="Manage your account information"
              onPress={() => {}}
            />
            <SettingItem
              icon={<Bell color={colors.textSecondary} size={20} />}
              title="Notifications"
              subtitle="Push notifications and alerts"
              onPress={() => {}}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon={getThemeIcon()}
              title="Appearance"
              subtitle={getThemeSubtitle()}
              onPress={handleThemePress}
            />
            <SettingItem
              icon={<Shield color={colors.textSecondary} size={20} />}
              title="Privacy & Security"
              subtitle="Data protection settings"
              onPress={() => {}}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon={<HelpCircle color={colors.textSecondary} size={20} />}
              title="Help & Support"
              subtitle="Get help and contact us"
              onPress={() => {}}
            />
            <SettingItem
              icon={<Info color={colors.textSecondary} size={20} />}
              title="About"
              subtitle="Version 1.0.0"
              onPress={() => {}}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Made with ❤️ for productivity
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: typeof Colors.light) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  sectionContent: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.borderLight,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: colors.text,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
    lineHeight: 18,
  },
  footer: {
    padding: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: colors.textTertiary,
  },
});