import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, Dimensions, ScrollView } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Plus, Folder, Trash2, Share, Moon, Sun, Clock, Play, Youtube, Mic } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { Card } from '../components/Card';
import { useClasses } from '../hooks/useClasses';
import { useTheme } from '../context/ThemeContext';
import { typography, layout, shadows } from '../constants/theme';
import { RootStackParamList, ClassModel, ItemModel } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const ITEM_WIDTH = (width - (layout.padding * 3)) / COLUMN_COUNT;

export const HomeScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const { classes, addClass, deleteClass } = useClasses();
    const { theme, isDark, toggleTheme } = useTheme();
    const [isModalVisible, setModalVisible] = useState(false);
    const [newClassName, setNewClassName] = useState('');
    const [itemCounts, setItemCounts] = useState<Record<string, number>>({});
    const [recentItems, setRecentItems] = useState<ItemModel[]>([]);

    const loadData = useCallback(async () => {
        try {
            const jsonValue = await AsyncStorage.getItem('@audio_store_items');
            if (jsonValue != null) {
                const allItems: ItemModel[] = JSON.parse(jsonValue);

                // Calculate counts
                const counts: Record<string, number> = {};
                classes.forEach(cls => counts[cls.id] = 0);
                allItems.forEach(item => {
                    if (counts[item.classId] !== undefined) {
                        counts[item.classId]++;
                    } else {
                        counts[item.classId] = 1;
                    }
                });
                setItemCounts(counts);

                // Get recent items (top 5)
                const sorted = [...allItems].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);
                setRecentItems(sorted);
            }
        } catch (e) {
            console.error('Failed to load data', e);
        }
    }, [classes]);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData])
    );

    const handleCreateClass = () => {
        if (newClassName.trim()) {
            addClass(newClassName.trim());
            setNewClassName('');
            setModalVisible(false);
        }
    };

    const confirmDelete = (id: string) => {
        Alert.alert(
            "Delete Class",
            "Are you sure? This will delete all files inside.",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: () => deleteClass(id) }
            ]
        );
    };

    const handleRecentItemPress = (item: ItemModel) => {
        const parentClass = classes.find(c => c.id === item.classId);
        if (parentClass) {
            navigation.navigate('ClassDetails', { classId: parentClass.id, className: parentClass.name });
        } else {
            Alert.alert("Error", "Parent class not found");
        }
    };

    const renderItem = ({ item }: { item: ClassModel }) => (
        <Card
            onPress={() => navigation.navigate('ClassDetails', { classId: item.id, className: item.name })}
            style={styles.classCard}
        >
            <View style={styles.cardContent}>
                <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
                    <Folder size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.textContainer}>
                    <Text style={[typography.headline, { color: theme.colors.text, fontSize: 16 }]} numberOfLines={1}>{item.name}</Text>
                    <Text style={[typography.caption1, { color: theme.colors.textSecondary }]}>
                        {itemCounts[item.id] || 0} items
                    </Text>
                </View>
                <TouchableOpacity onPress={() => confirmDelete(item.id)} style={styles.deleteButton}>
                    <Trash2 size={16} color={theme.colors.textSecondary} />
                </TouchableOpacity>
            </View>
        </Card>
    );

    const renderRecentItems = () => {
        if (recentItems.length === 0) return null;

        return (
            <View style={styles.recentSection}>
                <Text style={[typography.title3, { color: theme.colors.text, marginBottom: 16, marginTop: 24 }]}>Recent Additions</Text>
                {recentItems.map(item => (
                    <TouchableOpacity
                        key={item.id}
                        style={[styles.recentItem, { backgroundColor: theme.colors.card }]}
                        onPress={() => handleRecentItemPress(item)}
                    >
                        <View style={[styles.recentIcon, { backgroundColor: theme.colors.background }]}>
                            {item.type === 'youtube' ? (
                                <Youtube size={20} color="#FF0000" />
                            ) : (
                                <Mic size={20} color={theme.colors.primary} />
                            )}
                        </View>
                        <View style={styles.recentInfo}>
                            <Text style={[typography.body, { color: theme.colors.text }]} numberOfLines={1}>{item.title}</Text>
                            <Text style={[typography.caption1, { color: theme.colors.textSecondary }]}>
                                {new Date(item.createdAt).toLocaleDateString()}
                            </Text>
                        </View>
                        <Play size={16} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    return (
        <ScreenWrapper>
            <View style={styles.header}>
                <View>
                    <Text style={[typography.caption1, { color: theme.colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 }]}>
                        {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                    </Text>
                    <Text style={[typography.largeTitle, { color: theme.colors.text }]}>My Classes</Text>
                </View>
                <TouchableOpacity onPress={toggleTheme} style={[styles.themeToggle, { backgroundColor: theme.colors.card }]}>
                    {isDark ? <Sun size={20} color={theme.colors.warning} /> : <Moon size={20} color={theme.colors.text} />}
                </TouchableOpacity>
            </View>

            <FlatList
                data={classes}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                numColumns={COLUMN_COUNT}
                columnWrapperStyle={styles.columnWrapper}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={[typography.body, { color: theme.colors.textSecondary }]}>No classes yet. Tap + to create one.</Text>
                    </View>
                }
                ListFooterComponent={renderRecentItems}
            />

            <TouchableOpacity
                style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                onPress={() => setModalVisible(true)}
            >
                <Plus color="#fff" size={30} />
            </TouchableOpacity>

            {/* Dev Only: Simulate Share */}
            <TouchableOpacity
                style={[styles.fab, { bottom: 100, backgroundColor: theme.colors.warning }]}
                onPress={() => navigation.navigate('ShareModal', {
                    sharedContent: {
                        uri: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                        type: 'youtube',
                        title: 'Never Gonna Give You Up'
                    }
                })}
            >
                <Share color="#fff" size={30} />
            </TouchableOpacity>

            <Modal
                visible={isModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={[styles.modalOverlay, { backgroundColor: theme.colors.overlay }]}>
                    <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
                        <Text style={[typography.title2, { marginBottom: 16, color: theme.colors.text }]}>New Class</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
                            placeholder="Class Name (e.g. Singing)"
                            placeholderTextColor={theme.colors.textSecondary}
                            value={newClassName}
                            onChangeText={setNewClassName}
                            autoFocus
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelButton}>
                                <Text style={[typography.body, { color: theme.colors.destructive }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleCreateClass} style={[styles.createButton, { backgroundColor: theme.colors.primary }]}>
                                <Text style={[typography.headline, { color: '#fff' }]}>Create</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: layout.padding,
        paddingTop: layout.padding,
        paddingBottom: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    themeToggle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        ...shadows.small,
    },
    listContent: {
        padding: layout.padding,
        paddingBottom: 100,
    },
    columnWrapper: {
        justifyContent: 'space-between',
    },
    classCard: {
        width: ITEM_WIDTH,
        height: ITEM_WIDTH * 0.8, // Aspect ratio
        justifyContent: 'center',
    },
    cardContent: {
        flex: 1,
        justifyContent: 'space-between',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    textContainer: {
        flex: 1,
    },
    deleteButton: {
        position: 'absolute',
        top: 0,
        right: 0,
        padding: 4,
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
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        borderRadius: 20,
        padding: 24,
        ...shadows.medium,
    },
    input: {
        borderRadius: 10,
        padding: 12,
        fontSize: 17,
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    cancelButton: {
        marginRight: 20,
    },
    createButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    recentSection: {
        marginTop: 8,
    },
    recentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        marginBottom: 8,
        ...shadows.small,
    },
    recentIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    recentInfo: {
        flex: 1,
    },
});
