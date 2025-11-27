import { Platform, Alert, Linking } from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';

export const checkStoragePermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') {
        return true; // iOS doesn't need this permission
    }

    try {
        // For Android 11+ (API 30+), we need to check MANAGE_EXTERNAL_STORAGE
        // This is a special permission that requires going to settings
        const hasPermission = await checkManageStoragePermission();

        if (!hasPermission) {
            Alert.alert(
                "Storage Permission Required",
                "This app needs access to manage files to appear in share menus from apps like WhatsApp. Please enable 'Allow management of all files' in the next screen.",
                [
                    {
                        text: "Cancel",
                        style: "cancel"
                    },
                    {
                        text: "Open Settings",
                        onPress: openManageStorageSettings
                    }
                ]
            );
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error checking storage permission:', error);
        return false;
    }
};

const checkManageStoragePermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') {
        return true;
    }

    try {
        // Check if we have the permission (this requires a native module or we assume false)
        // For now, we'll prompt the user to enable it
        // In a real app, you'd use a native module to check this
        return false; // Always prompt for simplicity
    } catch (error) {
        return false;
    }
};

const openManageStorageSettings = async () => {
    if (Platform.OS !== 'android') {
        return;
    }

    try {
        // Open the special settings page for MANAGE_EXTERNAL_STORAGE
        await IntentLauncher.startActivityAsync(
            IntentLauncher.ActivityAction.MANAGE_ALL_FILES_ACCESS_PERMISSION
        );
    } catch (error) {
        console.error('Error opening settings:', error);
        // Fallback to app settings
        Linking.openSettings();
    }
};
