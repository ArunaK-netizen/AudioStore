---
description: How to build the app and push OTA updates using EAS
---

# EAS Build and Update Workflow

This guide explains how to create native builds and push over-the-air (OTA) updates for your application.

## 1. Creating a Native Build

Use this when you change native code (adding new libraries with native dependencies, changing app icon/splash screen, or modifying `app.json` native config).

### Development Build (for testing on device)
Creates a custom Expo Go-like client that includes your native code.
```bash
eas build --profile development --platform all
```
*   **Install:** Download the APK (Android) or use the camera to scan the QR code (iOS - requires ad-hoc provisioning).
*   **Run:** Start your dev server with `npx expo start --dev-client`.

### Production Build (for App Store/Play Store)
Creates a release-ready binary.
```bash
eas build --profile production --platform all
```
*   **Submit:** Use `eas submit` to upload to stores.

## 2. Pushing OTA Updates

Use this when you only change JavaScript/TypeScript code, assets (images/fonts), or non-native configuration.

### Preview Update (Internal Testing)
Pushes changes to the 'preview' channel.
```bash
eas update --branch preview --message "Description of changes"
```
*   **Target:** Users with a "preview" build installed.

### Production Update (Live Users)
Pushes changes to the 'production' channel.
```bash
eas update --branch production --message "Description of changes"
```
*   **Target:** All users with the "production" app installed from the App Store/Play Store.

## Important Notes
*   **Native Changes:** If you install a new library that requires native linking (e.g., `expo-camera`, `react-native-maps`), you **MUST** create a new native build. OTA updates will crash the app if native code is missing.
*   **Channels:** Ensure your builds are listening to the correct channels. `eas.json` defines which channel each build profile uses.
