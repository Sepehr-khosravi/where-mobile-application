/**
 * components/Avatar.tsx
 *
 * Circular avatar. Shows image if avatarUrl is set, otherwise
 * initials on a colored background.
 */

import { Image, StyleSheet, Text, View } from 'react-native';

interface AvatarProps {
  username: string;
  avatarUrl?: string;
  avatarColor: string;
  size?: number;
}

export function Avatar({ username, avatarUrl, avatarColor, size = 48 }: AvatarProps) {
  const initials = username.slice(0, 2).toUpperCase();
  const dimensionStyle = { width: size, height: size, borderRadius: size / 2 };

  if (avatarUrl) {
    return <Image source={{ uri: avatarUrl }} style={[styles.image, dimensionStyle]} />;
  }

  return (
    <View style={[styles.fallback, dimensionStyle, { backgroundColor: avatarColor }]}>
      <Text style={[styles.initials, { fontSize: size * 0.36 }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    resizeMode: 'cover',
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
