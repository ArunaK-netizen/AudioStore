import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, SectionList, StyleSheet, TouchableOpacity, Alert, Linking, TextInput } from 'react-native';
import { useRoute, useNavigation, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Audio } from 'expo-av';
import { Mic, Youtube, Play, Pause, Trash2, ArrowLeft } from 'lucide-react-native';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { Card } from '../components/Card';
import { useClassItems } from '../hooks/useClassItems';
import { useTheme } from '../context/ThemeContext';
import { typography, layout, shadows } from '../constants/theme';
import { RootStackParamList, ItemModel } from '../types';

type ClassDetailsRouteProp = RouteProp<RootStackParamList, 'ClassDetails'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ClassDetailsScreen = () => {
    const route = useRoute<ClassDetailsRouteProp>();
    const navigation = useNavigation<NavigationProp>();
    const { classId, className } = route.params;
    const { items, deleteItem, refreshItems } = useClassItems(classId);
    const { theme } = useTheme();

    useFocusEffect(
        useCallback(() => {
            refreshItems();
        }, [refreshItems])
    );

    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [playingId, setPlayingId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: false, // Custom header for better control
        });
    }, [navigation]);

    useEffect(() => {
        return () => {
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, [sound]);

    const handleItemPress = async (item: ItemModel) => {
        if (item.type === 'youtube') {
            try {
                const supported = await Linking.canOpenURL(item.uri);
                if (supported) {
                    await Linking.openURL(item.uri);
                } else {
                    Alert.alert("Error", "Cannot open this URL");
                }
            } catch (err) {
                Alert.alert("Error", "Something went wrong opening the link");
            }
        } else if (item.type === 'audio') {
            try {
                if (playingId === item.id) {
                    if (sound) {
                        await sound.stopAsync();
                        await sound.unloadAsync();
                        setSound(null);
                        setPlayingId(null);
                    }
                } else {
                    if (sound) {
                        await sound.unloadAsync();
                    }

                    await Audio.setAudioModeAsync({
                        playsInSilentModeIOS: true,
                    });

                    const { sound: newSound } = await Audio.Sound.createAsync(
                        { uri: item.uri },
                        { shouldPlay: true }
                    );

                    setSound(newSound);
                    setPlayingId(item.id);

                    newSound.setOnPlaybackStatusUpdate((status) => {
                        if (status.isLoaded && status.didJustFinish) {
                            setPlayingId(null);
                            newSound.unloadAsync();
                            setSound(null);
                        }
                    });
                }
            } catch (error) {
                console.error("Playback error", error);
                Alert.alert("Error", "Could not play audio file");
            }
        }
    };

    const confirmDelete = (id: string) => {
        Alert.alert(
            "Delete Item",
            "Are you sure?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: () => deleteItem(id) }
            ]
        );
    };

    const groupItemsByDate = (itemsToGroup: ItemModel[]) => {
        const groups: { [key: string]: ItemModel[] } = {};

        itemsToGroup.forEach(item => {
            const date = new Date(item.createdAt);
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            let dateKey = date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

            if (date.toDateString() === today.toDateString()) {
                dateKey = 'Today';
            } else if (date.toDateString() === yesterday.toDateString()) {
                dateKey = 'Yesterday';
            }

            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(item);
        });

        // Sort groups by date (newest first) - simplistic approach relying on string comparison or separate sort logic
        // Since keys are strings like "Today", "Yesterday", we need better sorting if we want strict chronological order beyond these.
        // For now, let's rely on the fact that items usually come in chronological order or we can sort keys manually.
        // A better way is to sort the original items first, then group.

        return Object.keys(groups).map(date => ({
            title: date,
            data: groups[date]
        }));
    };

    const filteredItems = items.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort items by createdAt descending before grouping
    const sortedItems = [...filteredItems].sort((a, b) => b.createdAt - a.createdAt);
    const sections = groupItemsByDate(sortedItems);

    const renderItem = ({ item }: { item: ItemModel }) => {
        const isPlaying = playingId === item.id;
        const isYoutube = item.type === 'youtube';

        return (
            <Card
                onPress={() => handleItemPress(item)}
                style={[
                    styles.itemCard,
                    isPlaying && { borderColor: theme.colors.primary, borderWidth: 1 }
                ]}
            >
                <View style={styles.cardContent}>
                    <View style={[
                        styles.iconContainer,
                        { backgroundColor: isYoutube ? '#FF000020' : (isPlaying ? theme.colors.primary : theme.colors.primary + '20') }
                    ]}>
                        {isYoutube ? (
                            <Youtube size={24} color="#FF0000" />
                        ) : (
                            isPlaying ? <Pause size={24} color="#fff" /> : <Play size={24} color={theme.colors.primary} />
                        )}
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={[typography.headline, { color: isPlaying ? theme.colors.primary : theme.colors.text }]} numberOfLines={1}>
                            {item.title}
                        </Text>
                        <Text style={[typography.caption1, { color: theme.colors.textSecondary }]}>
                            {item.duration ? `${Math.floor(item.duration / 60)}:${(item.duration % 60).toString().padStart(2, '0')}` : (isYoutube ? 'Link' : 'Audio')}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={() => confirmDelete(item.id)} style={styles.deleteButton}>
                        <Trash2 size={20} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                </View>
            </Card>
        );
    };

    const renderSectionHeader = ({ section: { title } }: { section: { title: string } }) => (
        <View style={[styles.sectionHeader, { backgroundColor: theme.colors.background }]}>
            <Text style={[typography.subhead, { color: theme.colors.textSecondary, fontWeight: '600' }]}>{title}</Text>
        </View>
    );

    return (
        <ScreenWrapper>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[typography.title2, { color: theme.colors.text }]}>{className}</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.searchContainer}>
                <TextInput
                    style={[styles.searchInput, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
                    placeholder="Search files..."
                    placeholderTextColor={theme.colors.textSecondary}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <SectionList
                sections={sections}
                renderItem={renderItem}
                renderSectionHeader={renderSectionHeader}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                stickySectionHeadersEnabled={false}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={[typography.body, { color: theme.colors.textSecondary }]}>
                            {searchQuery ? 'No matches found.' : 'No items yet.'}
                        </Text>
                        {!searchQuery && (
                            <Text style={[typography.subhead, { color: theme.colors.textSecondary, marginTop: 8 }]}>
                                Record audio or share links to this class.
                            </Text>
                        )}
                    </View>
                }
            />

            <TouchableOpacity
                style={[styles.fab, { backgroundColor: theme.colors.destructive }]}
                onPress={() => navigation.navigate('Recorder', { classId })}
            >
                <Mic color="#fff" size={30} />
            </TouchableOpacity>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: layout.padding,
        paddingVertical: 12,
    },
    backButton: {
        padding: 4,
    },
    searchContainer: {
        paddingHorizontal: layout.padding,
        paddingBottom: 16,
    },
    searchInput: {
        borderRadius: 12,
        padding: 12,
        fontSize: 17,
        ...shadows.small,
    },
    listContent: {
        padding: layout.padding,
        paddingBottom: 100,
    },
    sectionHeader: {
        paddingVertical: 8,
        marginBottom: 8,
    },
    itemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
    },
    deleteButton: {
        padding: 8,
    },
    emptyState: {
        padding: 40,
        alignItems: 'center',
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        ...shadows.medium,
    },
});
