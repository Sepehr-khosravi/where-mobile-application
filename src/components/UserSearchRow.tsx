/**
 * components/UserSearchRow.tsx
 */

import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { RelationStatus, User } from '../types/user';
import { Avatar } from './Avatar';

interface UserSearchRowProps {
  user: User;
  status: RelationStatus;
  onInvite: () => void;
  isSending?: boolean;
}

export function UserSearchRow({ user, status, onInvite, isSending }: UserSearchRowProps) {
  const { colors, spacing, radius, typography } = useTheme();

  const renderAction = () => {
    if (isSending) {
      return <ActivityIndicator size="small" color={colors.primary} />;
    }
    if (status === 'friend') {
      return (
        <View style={styles.actionRow}>
          <Ionicons name="checkmark-circle" size={16} color={colors.success} />
          <Text style={{ color: colors.success, fontSize: typography.size.sm, marginLeft: 4 }}>
            Friends
          </Text>
        </View>
      );
    }
    if (status === 'pending') {
      return (
        <Text style={{ color: colors.warning, fontSize: typography.size.sm }}>Invite sent</Text>
      );
    }
    return (
      <Pressable
        onPress={onInvite}
        style={({ pressed }) => [
          styles.inviteBtn,
          {
            backgroundColor: colors.primary,
            borderRadius: radius.full,
            paddingVertical: spacing.xs,
            paddingHorizontal: spacing.md,
            opacity: pressed ? 0.8 : 1,
          },
        ]}
      >
        <Text style={{ color: colors.primaryText, fontSize: typography.size.sm, fontWeight: '600' }}>
          Invite
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={[styles.row, { paddingVertical: spacing.sm + 2 }]}>
      <Avatar username={user.username} avatarColor={user.avatarColor} size={46} />
      <View style={{ marginLeft: spacing.md, flex: 1 }}>
        <Text style={{ color: colors.text, fontSize: typography.size.md, fontWeight: '600' }}>
          {user.username}
        </Text>
        <Text style={{ color: colors.textMuted, fontSize: typography.size.xs, marginTop: 2 }}>
          {user.email}
        </Text>
      </View>
      {renderAction()}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inviteBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
