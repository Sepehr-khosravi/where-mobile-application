/**
 * components/RelationRow.tsx
 */

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Relation } from '../types/user';
import { Avatar } from './Avatar';

interface RelationRowProps {
  relation: Relation;
  onPress?: () => void;
}

export function RelationRow({ relation, onPress }: RelationRowProps) {
  const { colors, spacing, typography } = useTheme();
  const { user, status, lastActive } = relation;

  const statusLabel =
    status === 'pending_sent'
      ? 'Invite sent'
      : status === 'pending_received'
      ? 'Wants to connect'
      : lastActive ?? '';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { paddingVertical: spacing.sm + 2, opacity: pressed ? 0.6 : 1 },
      ]}
    >
      <Avatar username={user.username} avatarColor={user.avatarColor} size={50} />
      <View style={{ marginLeft: spacing.md, flex: 1 }}>
        <Text style={{ color: colors.text, fontSize: typography.size.md, fontWeight: '600' }}>
          {user.username}
        </Text>
        {!!statusLabel && (
          <Text
            style={{
              color: status === 'pending_sent' ? colors.warning : colors.textMuted,
              fontSize: typography.size.sm,
              marginTop: 2,
            }}
          >
            {statusLabel}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
