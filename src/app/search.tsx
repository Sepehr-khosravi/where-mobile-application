/**
 * app/search.tsx
 *
 * Presented as a modal (see app/_layout.tsx Stack.Screen options).
 * No tab bar here — full focus on search.
 *
 * ✅ Search hits real POST /users/search.
 * ✅ Current user ID is read from AsyncStorage (store it during login).
 * ✅ inviteStatus from API is used to show friend/pending status.
 */


import { getUserId, USER_ID_KEY } from '@/services/authStorage';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { UserSearchRow } from '../components/UserSearchRow';
import { searchUsers as apiSearchUsers } from '../services/api';
import { sendInvite } from '../services/relations';
import { useTheme } from '../theme/ThemeContext';
import { UserProfileDTO } from '../types/api';
import { RelationStatus } from '../types/user';


const AVATAR_COLORS = ['#7C6CF0', '#5B4BC4', '#2BC48A', '#EF9F27', '#E24B4A'];
function colorForId(id: number): string {
  return AVATAR_COLORS[id % AVATAR_COLORS.length];
}

interface SearchResultUser {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  avatarColor: string;
  rawId: number;
  inviteStatus?: 'PENDING' | 'ACCEPTED' | 'REJECTED' | null;
}

async function getCurrentUserId(): Promise<number | null> {
  try {
    const id = await AsyncStorage.getItem('userId');
    return id ? Number(id) : null;
  } catch {
    return null;
  }
}

export default function SearchScreen() {
  const { colors, spacing, radius, typography } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState<Record<string, true>>({});
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    apiSearchUsers(query)
      .then((page) => {
        if (!cancelled) {
          setResults(
            page.users.map((u: UserProfileDTO) => ({
              id: String(u.id),
              username: u.username,
              email: u.email,
              avatarUrl: undefined,
              avatarColor: colorForId(u.id),
              rawId: u.id,
              inviteStatus: u.inviteStatus ?? null,
            }))
          );
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [query]);

  const handleInvite = async (user: SearchResultUser) => {
    setInviteError(null);
    const userId = await AsyncStorage.getItem(USER_ID_KEY);
    setSendingId(userId);
    try {
      const currentUserId = await getUserId();
      if (!currentUserId) {
        throw new Error('You must be logged in to send an invite.');
      }
      await sendInvite(user.rawId, currentUserId);
      console.log(user.rawId, currentUserId);
      // Mark as sent so the UI changes to 'pending_sent'
      setSentTo((prev) => ({ ...prev, [user.id]: true }));
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : 'Could not send invite.');
    } finally {
      setSendingId(null);
    }
  };


  const statusFor = (user: SearchResultUser): RelationStatus => {
    // If we just sent an invite, show 'pending_sent'
    if (sentTo[user.id]) return 'pending';

    // Otherwise, use the inviteStatus from the API
    console.log(user.inviteStatus)
    switch (user.inviteStatus) {
      case 'ACCEPTED':
        return 'friend';
      case 'PENDING':
        return 'pending'; // they invited us
      case 'REJECTED':
      case null:
      default:
        return 'none';
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: spacing.lg,
          paddingTop: insets.top + spacing.sm,
          paddingBottom: spacing.md,
        }}
      >
        <View
          style={[
            styles.inputWrap,
            {
              backgroundColor: colors.surfaceAlt,
              borderRadius: radius.lg,
              paddingHorizontal: spacing.md,
            },
          ]}
        >
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search by username or email"
            placeholderTextColor={colors.textMuted}
            autoFocus
            style={[
              styles.input,
              { color: colors.text, fontSize: typography.size.md, marginLeft: spacing.sm },
            ]}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </Pressable>
          )}
        </View>

        <Pressable onPress={() => router.back()} style={{ marginLeft: spacing.md }}>
          <Text style={{ color: colors.primary, fontSize: typography.size.md, fontWeight: '600' }}>
            Cancel
          </Text>
        </Pressable>
      </View>

      {!!inviteError && (
        <Text
          style={{
            color: colors.danger,
            fontSize: typography.size.xs,
            paddingHorizontal: spacing.lg,
            marginBottom: spacing.sm,
          }}
        >
          {inviteError}
        </Text>
      )}

      {!loading && query.trim().length > 0 && results.length === 0 && (
        <View style={{ alignItems: 'center', marginTop: spacing.xl }}>
          <Text style={{ color: colors.textMuted, fontSize: typography.size.sm }}>
            No one found for "{query}"
          </Text>
        </View>
      )}

      {!query.trim() && (
        <View style={{ alignItems: 'center', marginTop: spacing.xl, paddingHorizontal: spacing.xl }}>
          <Text style={{ color: colors.textMuted, fontSize: typography.size.sm, textAlign: 'center' }}>
            Start typing a username or email to find people.
          </Text>
        </View>
      )}

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: spacing.lg }}
        keyboardShouldPersistTaps="handled"
        ItemSeparatorComponent={() => (
          <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.border }} />
        )}
        renderItem={({ item }) => (
          <UserSearchRow
            user={item}
            status={statusFor(item)}
            isSending={sendingId === item.id}
            onInvite={() => handleInvite(item)}
          />
        )}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 42,
  },
  input: {
    flex: 1,
  },
});