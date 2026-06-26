/**
 * app/my-location.tsx
 *
 * Test screen for the real-GPS feature: shows YOUR actual device
 * location on the map, live, using useMyLiveLocation(). Also shows
 * how far you've drifted since the last "reported" point, so you can
 * visually watch the 100m threshold logic working as you walk/drive.
 *
 * This is a throwaway test screen, not part of the main tab flow —
 * navigate here manually for now, e.g. router.push('/my-location').
 */

import { Stack, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMyLiveLocation } from '../hooks/useMyLiveLocation';
import { useTheme } from '../theme/ThemeContext';

export default function MyLocationScreen() {
  const { colors, spacing, typography, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const hasCenteredOnce = useRef(false);

  const { location, permissionStatus, errorMessage, totalDistanceSinceLastReport } =
    useMyLiveLocation();

  // Same "don't animate on the very first fix" rule as app/user/[id].tsx —
  // initialRegion handles first placement, animateToRegion handles
  // every fix after that. See that file for the full explanation of
  // why skipping this causes a blank map on Android.
  useEffect(() => {
    if (!location) return;
    if (!hasCenteredOnce.current) {
      hasCenteredOnce.current = true;
      return;
    }
    mapRef.current?.animateToRegion(
      {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      500
    );
  }, [location?.latitude, location?.longitude]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View
        style={{
          paddingTop: insets.top + spacing.sm,
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.md,
        }}
      >
        <Text style={{ color: colors.text, fontSize: typography.size.xl, fontWeight: '700' }}>
          My Live Location
        </Text>
        <Text style={{ color: colors.textMuted, fontSize: typography.size.sm, marginTop: 2 }}>
          Test screen — your real GPS, reports only every 100m moved
        </Text>
      </View>

      {errorMessage ? (
        <View style={[styles.centerMessage, { paddingHorizontal: spacing.xl }]}>
          <Text style={{ color: colors.danger, textAlign: 'center', fontSize: typography.size.sm }}>
            {errorMessage}
          </Text>
          {permissionStatus === 'denied' && (
            <Text style={{ color: colors.textMuted, textAlign: 'center', fontSize: typography.size.xs, marginTop: spacing.sm }}>
              Enable location access for this app in your device settings, then come back.
            </Text>
          )}
        </View>
      ) : !location ? (
        <View style={styles.centerMessage}>
          <Text style={{ color: colors.textMuted, fontSize: typography.size.sm }}>
            Getting your location…
          </Text>
        </View>
      ) : (
        <>
          <View style={[styles.mapWrap, { borderRadius: radius.lg }]}>
            <MapView
              ref={mapRef}
              provider={PROVIDER_GOOGLE}
              style={StyleSheet.absoluteFill}
              showsUserLocation
              initialRegion={{
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker coordinate={{ latitude: location.latitude, longitude: location.longitude }}>
                <View style={[styles.markerDot, { backgroundColor: colors.primary, borderColor: colors.background }]} />
              </Marker>

              {location.accuracy != null && (
                <Circle
                  center={{ latitude: location.latitude, longitude: location.longitude }}
                  radius={location.accuracy}
                  strokeColor={colors.primary}
                  fillColor={`${colors.primary}22`}
                />
              )}
            </MapView>
          </View>

          <View
            style={{
              paddingHorizontal: spacing.lg,
              paddingBottom: insets.bottom + spacing.lg,
              paddingTop: spacing.sm,
            }}
          >
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: radius.md,
                padding: spacing.md,
              }}
            >
              <Row label="Latitude" value={location.latitude.toFixed(6)} colors={colors} typography={typography} />
              <Row label="Longitude" value={location.longitude.toFixed(6)} colors={colors} typography={typography} />
              <Row
                label="GPS accuracy"
                value={location.accuracy != null ? `±${Math.round(location.accuracy)}m` : 'unknown'}
                colors={colors}
                typography={typography}
              />
              <Row
                label="Since last report"
                value={`${Math.round(totalDistanceSinceLastReport)}m / 100m`}
                colors={colors}
                typography={typography}
                highlight={totalDistanceSinceLastReport >= 100}
              />
            </View>
          </View>
        </>
      )}
    </View>
  );
}

function Row({
  label,
  value,
  colors,
  typography,
  highlight,
}: {
  label: string;
  value: string;
  colors: ReturnType<typeof useTheme>['colors'];
  typography: ReturnType<typeof useTheme>['typography'];
  highlight?: boolean;
}) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
      <Text style={{ color: colors.textMuted, fontSize: typography.size.sm }}>{label}</Text>
      <Text
        style={{
          color: highlight ? colors.success : colors.text,
          fontSize: typography.size.sm,
          fontWeight: '600',
        }}
      >
        {value}
      </Text>
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
    overflow: 'hidden',
  },
  centerMessage: {
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
});
