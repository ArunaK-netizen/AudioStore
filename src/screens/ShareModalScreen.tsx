import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { X, Save, Folder } from 'lucide-react-native';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { Card } from '../components/Card';
import { useClasses } from '../hooks/useClasses';
import { useTheme } from '../context/ThemeContext';
import { typography, layout, shadows } from '../constants/theme';
import { RootStackParamList } from '../types';

type ShareModalRouteProp = RouteProp<RootStackParamList, 'ShareModal'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ShareModalScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ShareModalRouteProp>();
    const { sharedContent } = route.params;
    const { theme } = useTheme();

    const { classes } = useClasses();
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (sharedContent?.title) {
            setTitle(sharedContent.title);
        } else if (sharedContent?.uri) {
            const filename = sharedContent.uri.split('/').pop();
            setTitle(filename || 'New Item');
        }
    }, [sharedContent]);

    const handleSave = async () => {
        if (!selectedClassId || !title.trim()) {
            Alert.alert('Error', 'Please select a class and enter a title.');
            return;
        }

        setSaving(true);
        try {
            const ITEMS_STORAGE_KEY = '@audio_store_items';
            const AsyncStorage = require('@react-native-async-storage/async-storage').default;

            const newItem = {
                id: Date.now().toString(),
                classId: selectedClassId,
                type: sharedContent.type || 'audio',
                title: title.trim(),
                uri: sharedContent.uri,
                duration: sharedContent.duration,
                createdAt: Date.now(),
                metadata: sharedContent.metadata,
            };

            const jsonValue = await AsyncStorage.getItem(ITEMS_STORAGE_KEY);
            const allItems = jsonValue != null ? JSON.parse(jsonValue) : [];
            const updatedAllItems = [newItem, ...allItems];

            await AsyncStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(updatedAllItems));

            Alert.alert('Success', 'Saved to class!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to save.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <ScreenWrapper style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <X size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[typography.headline, { color: theme.colors.text }]}>Save to Class</Text>
                <TouchableOpacity onPress={handleSave} disabled={saving}>
                    <Text style={[typography.headline, { color: theme.colors.primary }]}>Save</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.preview}>
                    <Text style={[typography.subhead, styles.label, { color: theme.colors.textSecondary }]}>Content to Save</Text>
                    <Card style={[styles.previewCard, { backgroundColor: theme.colors.primary + '20' }]}>
                        <Text style={[typography.headline, { color: theme.colors.text }]}>{sharedContent?.uri}</Text>
                        <Text style={[typography.caption1, { color: theme.colors.textSecondary }]}>{sharedContent?.type}</Text>
                    </Card>
                </View>

                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Title</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
                        value={title}
                        onChangeText={setTitle}
                        placeholder="Enter title"
                        placeholderTextColor={theme.colors.textSecondary}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Select Class</Text>
                    {classes.map(cls => (
                        <TouchableOpacity
                            key={cls.id}
                            style={[
                                styles.classOption,
                                { backgroundColor: theme.colors.card },
                                selectedClassId === cls.id && { backgroundColor: theme.colors.primary }
                            ]}
                            onPress={() => setSelectedClassId(cls.id)}
                        >
                            <Folder size={20} color={selectedClassId === cls.id ? '#fff' : theme.colors.primary} />
                            <Text style={[
                                typography.body,
                                { marginLeft: 12, color: selectedClassId === cls.id ? '#fff' : theme.colors.text }
                            ]}>
                                {cls.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: layout.padding,
        borderBottomWidth: 1,
    },
    content: {
        padding: layout.padding,
    },
    preview: {
        marginBottom: 24,
    },
    previewCard: {
        marginTop: 8,
    },
    formGroup: {
        marginBottom: 24,
    },
    label: {
        ...typography.subhead,
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        padding: 16,
        borderRadius: 12,
        fontSize: 17,
        ...shadows.small,
    },
    classOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        ...shadows.small,
    },
});
