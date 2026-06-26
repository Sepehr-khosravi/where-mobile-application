/**
 * app/onboarding.tsx
 *
 * 3-step swipeable onboarding: Welcome -> Rules -> Start.
 * Shown exactly once ever (see contexts/AuthContext.tsx +
 * services/authStorage.ts's hasSeenOnboarding flag).
 *
 * After "Start", routes to Register (per your answer: new users
 * land on Register, not Login).
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../theme/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Step {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  {
    key: 'welcome',
    icon: 'sparkles-outline',
    title: 'Welcome',
    description:
      "Find people, stay connected, and see what's happening with the people who matter to you.",
  },
  {
    key: 'rules',
    icon: 'shield-checkmark-outline',
    title: 'A few ground rules',
    description:
      "Don't accept invites from people you don't actually know. Keep your circle real, and report anything that feels off.",
  },
  {
    key: 'start',
    icon: 'rocket-outline',
    title: "You're all set",
    description: "Let's create your account and get you connected.",
  },
];

export default function OnboardingScreen() {
  const { colors, spacing, typography, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { completeOnboarding } = useAuth();

  const listRef = useRef<FlatList<Step>>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const isLastStep = activeIndex === STEPS.length - 1;

  const goToFinish = async () => {
    await completeOnboarding();
    router.push('/(auth)/register');
  };

  const goNext = () => {
    if (isLastStep) {
      goToFinish();
      return;
    }
    listRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (index !== activeIndex) setActiveIndex(index);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {!isLastStep && (
        <Pressable
          onPress={goToFinish}
          style={{
            position: 'absolute',
            top: insets.top + spacing.sm,
            right: spacing.lg,
            zIndex: 1,
            padding: spacing.xs,
          }}
          hitSlop={8}
        >
          <Text style={{ color: colors.textMuted, fontSize: typography.size.sm, fontWeight: '600' }}>
            Skip
          </Text>
        </Pressable>
      )}

      <FlatList
        ref={listRef}
        data={STEPS}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width: SCREEN_WIDTH, paddingHorizontal: spacing.xl }]}>
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: colors.primaryLight, width: 96, height: 96, borderRadius: 48 },
              ]}
            >
              <Ionicons name={item.icon} size={40} color={colors.primary} />
            </View>
            <Text
              style={{
                color: colors.text,
                fontSize: typography.size.xxl,
                fontWeight: '700',
                marginTop: spacing.xl,
                textAlign: 'center',
              }}
            >
              {item.title}
            </Text>
            <Text
              style={{
                color: colors.textMuted,
                fontSize: typography.size.md,
                marginTop: spacing.md,
                textAlign: 'center',
                lineHeight: 22,
                maxWidth: 320,
              }}
            >
              {item.description}
            </Text>
          </View>
        )}
      />

      <View style={{ paddingHorizontal: spacing.xl, paddingBottom: insets.bottom + spacing.lg }}>
        <View style={[styles.dots, { marginBottom: spacing.xl }]}>
          {STEPS.map((step, index) => (
            <View
              key={step.key}
              style={[
                styles.dot,
                {
                  backgroundColor: index === activeIndex ? colors.primary : colors.border,
                  width: index === activeIndex ? 20 : 8,
                },
              ]}
            />
          ))}
        </View>

        <Pressable
          onPress={goNext}
          style={({ pressed }) => [
            styles.nextButton,
            {
              backgroundColor: colors.primary,
              borderRadius: radius.lg,
              paddingVertical: spacing.md,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Text style={{ color: colors.primaryText, fontSize: typography.size.md, fontWeight: '700' }}>
            {isLastStep ? 'Get started' : 'Next'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  nextButton: {
    alignItems: 'center',
  },
});
