/**
 * app.json.SNIPPET.md
 *
 * ⚠️ NOT a real file Expo reads — this is a copy-paste reference.
 * Merge the relevant pieces into YOUR actual app.json / app.config.js
 * at your project root. Without this, expo-location's permission
 * prompts won't show the right text (and on iOS, will outright
 * crash without the usage description strings).
 */

/*
{
  "expo": {
    "plugins": [
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Allow $(PRODUCT_NAME) to use your location to show it on the map and share it with your friends.",
          "isAndroidBackgroundLocationEnabled": false,
          "isIosBackgroundLocationEnabled": false
        }
      ]
    ],
    "ios": {
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "We use your location to show it on the map and share it with your friends."
      }
    },
    "android": {
      "permissions": ["ACCESS_COARSE_LOCATION", "ACCESS_FINE_LOCATION"]
    }
  }
}
*/

/**
 * Notes:
 * - isAndroidBackgroundLocationEnabled / isIosBackgroundLocationEnabled
 *   are both `false` here on purpose — this hook only tracks location
 *   while the app is open/foregrounded (Location.watchPositionAsync
 *   with requestForegroundPermissionsAsync). If you later want this
 *   to keep reporting location even when the app is backgrounded or
 *   killed, that's a meaningfully bigger feature (different APIs,
 *   different permission prompts, battery considerations) — tell me
 *   if/when you want that and we'll build it properly rather than
 *   bolt it on.
 * - After editing app.json, you need a fresh prebuild/dev build for
 *   native permission strings to take effect — a JS-only reload isn't
 *   enough since this touches native Info.plist / AndroidManifest.xml.
 */
