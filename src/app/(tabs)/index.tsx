// app/(tabs)/index.tsx

import { useRouter } from 'expo-router';
import { useBottomTabBarHeight } from 'expo-router/js-tabs';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyRelations } from '../../components/EmptyRelations';
import { RelationRow } from '../../components/RelationRow';
import { SearchBarTrigger } from '../../components/SearchBarTrigger';
import { getRelations } from '../../services/relations';
import { useTheme } from '../../theme/ThemeContext';
import { Relation as UIRelation } from '../../types/user';

// Stable colors for avatars
const AVATAR_COLORS = ['#7C6CF0', '#5B4BC4', '#2BC48A', '#EF9F27', '#E24B4A'];
function colorForId(id: number): string {
  return AVATAR_COLORS[id % AVATAR_COLORS.length];
}

export default function HomeScreen() {
  const { colors, spacing, typography } = useTheme();
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();

  const [relations, setRelations] = useState<UIRelation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const load = useCallback(async () => {
    const { relations: rawRelations } = await getRelations();
  
    const mapped: UIRelation[] = rawRelations.map((r) => ({
      lastActive: (new Date(r.createdAt)).toLocaleDateString(),   
      status: 'friend',
      user: {
        id: String(r.friend.id),
        username: r.friend.username,
        email: r.friend.email,
        avatarColor: colorForId(r.friend.id),
        avatarUrl: undefined,
      },
    }));
  
    setRelations(mapped);
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const openSearch = () => router.push('/search');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={{
          paddingHorizontal: spacing.lg,
          paddingTop: insets.top + spacing.xs,
          paddingBottom: spacing.md,
        }}
      >
        <Text
          style={{
            color: colors.text,
            fontSize: typography.size.xl,
            fontWeight: '700',
            marginBottom: spacing.md,
          }}
        >
          Relations
        </Text>
        <SearchBarTrigger onPress={openSearch} />
      </View>

      {!loading && relations.length === 0 ? (
        <EmptyRelations onFindPeople={openSearch} />
      ) : (
        <FlatList
          data={relations}
          keyExtractor={(item) => item.user.id}
          contentContainerStyle={{
            paddingHorizontal: spacing.lg,
            paddingBottom: tabBarHeight + spacing.xl,
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          ItemSeparatorComponent={() => (
            <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.border }} />
          )}
          renderItem={({ item }) => (
            <RelationRow
              relation={item}
              onPress={() => router.push(`/user/${item.user.id}`)}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});