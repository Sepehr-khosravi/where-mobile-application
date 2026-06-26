/**
 * app/user/[id].tsx
 *
 * Any-user profile page: header with avatar/name, then a live map
 * showing their current location.
 *
 * ✅ NOW WIRED TO THE REAL BACKEND — profile via REST (GET /users,
 * client-filtered until a single-user route is confirmed, see
 * services/api.ts), location via the 'friend:watch' / 'location:update'
 * socket events (see services/socket.ts).
 *
 * Navigate here with: router.push(`/user/${userId}`)
 */

import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '../../components/Avatar';
import { useUserLocation } from '../../hooks/useUserLocation';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useTheme } from '../../theme/ThemeContext';

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, spacing, typography, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);

  const { profile, loading: profileLoading } = useUserProfile(id);
  const { location, loading: locationLoading, error: locationErrorObj } = useUserLocation(id);
  const locationError = locationErrorObj?.message ?? null;

  // 🔥 LOG EVERYTHING TO DEBUG
  useEffect(() => {
    console.log(`📱 UserProfileScreen for id: ${id}`);
    console.log('Profile:', profile);
    console.log('Location state:', location);
    console.log('Location loading:', locationLoading);
    console.log('Location error:', locationError);
  }, [id, profile, location, locationLoading, locationError]);

  // Smoothly re-center the map whenever a new location comes in
  const hasCenteredOnce = useRef(false);

  useEffect(() => {
    if (!location) return;

    if (!hasCenteredOnce.current) {
      hasCenteredOnce.current = true;
      console.log('🗺️ Initial map region set to:', location.latitude, location.longitude);
      return;
    }

    if (mapRef.current) {
      console.log('🗺️ Animating map to new location:', location.latitude, location.longitude);
      mapRef.current.animateToRegion(
        {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        },
        500
      );
    }
  }, [location?.latitude, location?.longitude]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View
        style={{
          paddingTop: insets.top + spacing.sm,
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        {profileLoading ? (
          <ActivityIndicator color={colors.primary} />
        ) : profile ? (
          <>
            <Avatar
              username={profile.username}
              avatarColor={colors.primary}
              size={48}
            />
            <View style={{ marginLeft: spacing.md }}>
              <Text style={{ color: colors.text, fontSize: typography.size.lg, fontWeight: '700' }}>
                {profile.username}
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: typography.size.sm }}>
                {profile.email}
              </Text>
            </View>
          </>
        ) : (
          <Text style={{ color: colors.danger }}>Couldn't load this user.</Text>
        )}
      </View>

      <View style={[styles.mapWrap, { borderRadius: radius.lg }]}>
        {locationLoading && !location ? (
          <View style={[styles.mapLoading, { backgroundColor: colors.surface }]}>
            <ActivityIndicator color={colors.primary} />
            <Text style={{ color: colors.textMuted, marginTop: spacing.sm, fontSize: typography.size.sm }}>
              Locating user…
            </Text>
          </View>
        ) : locationError ? (
          <View style={[styles.mapLoading, { backgroundColor: colors.surface, paddingHorizontal: spacing.xl }]}>
            <Text style={{ color: colors.danger, fontSize: typography.size.sm, textAlign: 'center', fontWeight: '600' }}>
              Couldn't get location
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: typography.size.xs, textAlign: 'center', marginTop: spacing.xs }}>
              {locationError}
            </Text>
          </View>
        ) : location ? (
          <>
            <MapView
              ref={mapRef}
              provider={PROVIDER_GOOGLE}
              style={StyleSheet.absoluteFill}
              initialRegion={{
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
              }}
              onMapReady={() => {
                console.log('[map] ready at', location.latitude, location.longitude);
              }}
            >
              <Marker
                coordinate={{ latitude: location.latitude, longitude: location.longitude }}
                title={profile?.username ?? 'User'}
              >
                <View style={[styles.markerDot, { backgroundColor: colors.primary, borderColor: colors.background }]} />
              </Marker>
            </MapView>
            <View
              style={[
                styles.liveBadge,
                { backgroundColor: colors.tabBarTint, borderRadius: radius.full, paddingHorizontal: spacing.sm },
              ]}
            >
              <View style={[styles.liveDot, { backgroundColor: colors.success }]} />
              <Text style={{ color: colors.text, fontSize: typography.size.xs, fontWeight: '600', marginLeft: 4 }}>
                Live
              </Text>
            </View>
          </>
        ) : (
          <View style={[styles.mapLoading, { backgroundColor: colors.surface }]}>
            <Text style={{ color: colors.textMuted, fontSize: typography.size.sm }}>
              No location available for this user yet.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapWrap: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  mapLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 3,
  },
  liveBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});