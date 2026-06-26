/**
 * app/user/[id].tsx
 *
 * Full‑screen map with a bottom overlay card.
 * A single "Navigate" button opens the native Android chooser
 * (or the default maps app on iOS) via a geo: URI.
 */

import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { Avatar } from '../../components/Avatar';
import { useUserLocation } from '../../hooks/useUserLocation';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useTheme } from '../../theme/ThemeContext';


// ---------- Leaflet map HTML ----------
const getMapHtml = (lat: number, lng: number, username: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css" />
  <style>
    body, html, #map { height: 100%; margin: 0; padding: 0; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js"></script>
  <script>
    var map = L.map('map').setView([${lat}, ${lng}], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap France'
    }).addTo(map);
    L.marker([${lat}, ${lng}])
      .addTo(map)
      .bindPopup('${username}');
  </script>
</body>
</html>
`;

// ---------- Main Component ----------
export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, spacing, typography, radius } = useTheme();
  const insets = useSafeAreaInsets();

  const { profile, loading: profileLoading } = useUserProfile(id);
  const { location, loading: locationLoading, error: locationErrorObj } = useUserLocation(id);

  // ---- State ----
  const [displayLocation, setDisplayLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [isFallback, setIsFallback] = useState(false);
  const [fallbackMessage, setFallbackMessage] = useState<string | null>(null);
  const [mapKey, setMapKey] = useState(0);
  const [isGettingDeviceLocation, setIsGettingDeviceLocation] = useState(false);

  // ---- Try to get device location as fallback ----
  const getDeviceLocation = async () => {
    setIsGettingDeviceLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setFallbackMessage('Location permission denied – cannot show location.');
        setIsGettingDeviceLocation(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setDisplayLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      setIsFallback(true);
      setFallbackMessage("Friend's location unavailable – showing your current location.");
    } catch (err) {
      setFallbackMessage('Could not get your location either.');
      console.error('Fallback location error:', err);
    } finally {
      setIsGettingDeviceLocation(false);
    }
  };

  // ---- Decide which location to display ----
  useEffect(() => {
    if (location) {
      setDisplayLocation(location);
      setIsFallback(false);
      setFallbackMessage(null);
      return;
    }
    if (locationLoading) return;
    if (!location && !locationLoading && !isGettingDeviceLocation) {
      getDeviceLocation();
    }
  }, [location, locationLoading]);

  // ---- Refresh map when location changes ----
  useEffect(() => {
    if (displayLocation) {
      setMapKey((prev) => prev + 1);
    }
  }, [displayLocation]);

  // ---- Navigate: use native geo URI ----
  const handleNavigate = () => {
    if (!displayLocation) return;
    const { latitude, longitude } = displayLocation;
    if (Platform.OS === 'android') {
      Linking.openURL(`geo:${latitude},${longitude}?q=${latitude},${longitude}`);
    } else {
      // iOS: open Google Maps if installed, else Apple Maps
      const url = `comgooglemaps://?q=${latitude},${longitude}`;
      Linking.openURL(url).catch(() => {
        Linking.openURL(`https://www.google.com/maps?q=${latitude},${longitude}`);
      });
    }
  };

  // ---- Render ----
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* ----- Full‑screen Map ----- */}
      {locationLoading && !displayLocation ? (
        <View style={[styles.fullCenter, { backgroundColor: colors.surface }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.textMuted, marginTop: spacing.sm, fontSize: typography.size.sm }}>
            Locating user…
          </Text>
        </View>
      ) : locationErrorObj?.message && !displayLocation ? (
        <View style={[styles.fullCenter, { backgroundColor: colors.surface, paddingHorizontal: spacing.xl }]}>
          <Text style={{ color: colors.danger, fontSize: typography.size.md, textAlign: 'center', fontWeight: '600' }}>
            Couldn’t get location
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: typography.size.sm, textAlign: 'center', marginTop: spacing.xs }}>
            {locationErrorObj.message}
          </Text>
          <TouchableOpacity
            style={{ marginTop: spacing.md, backgroundColor: colors.primary, padding: spacing.md, borderRadius: radius.md }}
            onPress={getDeviceLocation}
          >
            <Text style={{ color: colors.primaryText }}>Use my location</Text>
          </TouchableOpacity>
        </View>
      ) : displayLocation ? (
        <>
          <WebView
            key={mapKey}
            originWhitelist={['*']}
            source={{ html: getMapHtml(displayLocation.latitude, displayLocation.longitude, profile?.username || 'User') }}
            style={StyleSheet.absoluteFill}
            javaScriptEnabled
            domStorageEnabled
            onLoadEnd={() => console.log('🗺️ Map loaded')}
            onError={(err) => console.error('WebView error:', err)}
          />

          {/* Fallback message overlay (if any) */}
          {fallbackMessage && (
            <View style={[styles.fallbackBanner, { backgroundColor: colors.warning + '30' }]}>
              <Text style={[styles.fallbackText, { color: colors.text }]}>{fallbackMessage}</Text>
            </View>
          )}

          {/* ----- Bottom Overlay Card ----- */}
          <View
            style={[
              styles.bottomCard,
              {
                backgroundColor: colors.surface,
                borderRadius: radius.lg,
                paddingBottom: insets.bottom + spacing.md,
                paddingTop: spacing.md,
                paddingHorizontal: spacing.md,
              },
            ]}
          >
            {/* Profile row */}
            <View style={styles.cardRow}>
              <Ionicons name="arrow-back" size={20} color={colors.primaryText} onPress={()=>{
                router.back();
              }} />
              <Avatar username={profile?.username || 'User'} avatarColor={colors.primary} size={44} />
              <View style={styles.cardText}>
                <Text style={[styles.cardName, { color: colors.text }]}>
                  {profile?.username || 'Unknown'}
                </Text>
                <Text style={[styles.cardEmail, { color: colors.textMuted }]}>
                  {profile?.email || 'No email'}
                </Text>
              </View>
              <View style={styles.statusBadge}>
                <View style={[styles.statusDot, { backgroundColor: isFallback ? colors.warning : colors.success }]} />
                <Text style={[styles.statusLabel, { color: isFallback ? colors.warning : colors.success }]}>
                  {isFallback ? 'Fallback' : 'Live'}
                </Text>
              </View>
            </View>

            {/* Single Navigate button – uses native system chooser on Android */}
            <TouchableOpacity
              style={[styles.navButton, { backgroundColor: colors.primary, borderRadius: radius.md }]}
              onPress={handleNavigate}
              disabled={!displayLocation}
            >
              <Ionicons name="navigate-circle-outline" size={20} color={colors.primaryText} />
              <Text style={[styles.navButtonText, { color: colors.primaryText }]}>Navigate</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={[styles.fullCenter, { backgroundColor: colors.surface }]}>
          <Text style={{ color: colors.textMuted, fontSize: typography.size.sm }}>
            No location available.
          </Text>
        </View>
      )}
    </View>
  );
}

// ---------- Styles ----------
const styles = StyleSheet.create({
  container: { flex: 1 },
  fullCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // Fallback banner
  fallbackBanner: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  fallbackText: { fontSize: 13, textAlign: 'center', fontWeight: '500' },

  // Bottom card – full width, bottom aligned
  bottomCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    height: 190,
    gap: 30,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap : 10 },
  cardText: { flex: 1, marginLeft: 12 },
  cardName: { fontSize: 16, fontWeight: '600' },
  cardEmail: { fontSize: 13 },
  statusBadge: { flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 4 },
  statusLabel: { fontSize: 11, fontWeight: '600' },

  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginTop: 10,
    gap: 6,
  },
  navButtonText: { fontSize: 15, fontWeight: '600' },
});