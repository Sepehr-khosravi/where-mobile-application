/**
 * app/(tabs)/profile.tsx
 *
 * Profile: avatar circle with an edit badge overlaid,
 * username + email below, then options list.
 */

import { getUser } from '@/services/api'; // ensure this path is correct
import { getUserId } from '@/services/authStorage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useBottomTabBarHeight } from 'expo-router/js-tabs';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '../../components/Avatar';
import { SettingsRow } from '../../components/SettingsRow';
import { useTheme } from '../../theme/ThemeContext';

import { UserProfile } from '@/types/api';

const AVATAR_SIZE = 112;

export default function ProfileScreen() {
  const { colors, spacing, radius, typography } = useTheme();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user data on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const currentId = await getUserId();
        const response = await getUser(currentId ? currentId : 0);
        setUser(response.profile);
      } catch (err) {
        setError('Failed to load profile');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const openInvites = () => router.push('/invites');

  // Fallback while loading or if error
  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !user) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.danger }}>{error || 'User not found'}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Avatar & User Info */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + spacing.md,
            paddingBottom: spacing.lg,
          },
        ]}
      >
        <View style={styles.avatarWrap}>
          <Avatar
            username={user.username}
            avatarColor={colors.primary}
            size={AVATAR_SIZE}
          />
          <Pressable
            style={({ pressed }) => [
              styles.editBadge,
              {
                backgroundColor: colors.primary,
                borderColor: colors.background,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
            onPress={() => {
              // Handle edit avatar (e.g., open image picker)
              console.log('Edit avatar pressed');
            }}
            hitSlop={8}
          >
            <Ionicons name="camera" size={16} color={colors.primaryText} />
          </Pressable>
        </View>

        <Text
          style={[
            styles.username,
            {
              color: colors.text,
              fontSize: typography.size.xl,
              marginTop: spacing.md,
            },
          ]}
        >
          {user.username}
        </Text>
        <Text
          style={[
            styles.email,
            {
              color: colors.textMuted,
              fontSize: typography.size.sm,
              marginTop: 2,
            },
          ]}
        >
          {user.email}
        </Text>
      </View>

      {/* Settings / Options Cards */}
      <View
        style={[
          styles.optionsCard,
          {
            backgroundColor: colors.surface,
            marginHorizontal: spacing.lg,
            borderRadius: radius.md,
            marginTop: spacing.md,
            overflow: 'hidden',
          },
        ]}
      >
        <SettingsRow
          icon="at-outline"
          label="Username"
          value={user.username}
          showChevron={false}
        />
        <View
          style={[
            styles.divider,
            {
              height: StyleSheet.hairlineWidth,
              backgroundColor: colors.border,
              marginLeft: spacing.lg + 30 + spacing.md,
            },
          ]}
        />

        <SettingsRow
          icon="mail-outline"
          label="Email"
          value={user.email}
          showChevron={false}
        />
        <View
          style={[
            styles.divider,
            {
              height: StyleSheet.hairlineWidth,
              backgroundColor: colors.border,
              marginLeft: spacing.lg + 30 + spacing.md,
            },
          ]}
        />

        {/* Invites button – Pressable wraps the row for navigation */}
        <Pressable
          style={({ pressed }) => ({
            opacity: pressed ? 0.6 : 1,
          })}
          onPress={openInvites}
        >
          <SettingsRow
            icon="mail-outline"
            label="Invites"
            value=""
            showChevron={true}
          />
        </Pressable>
      </View>

      {/* Bottom spacer for tab bar */}
      <View style={{ height: tabBarHeight + spacing.lg }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
  },
  avatarWrap: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  username: {
    fontWeight: '700',
  },
  email: {
    fontWeight: '400',
  },
  optionsCard: {
    overflow: 'hidden',
  },
  divider: {
    // height and background set dynamically
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});