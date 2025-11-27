import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ItemModel, ItemType } from '../types';

const ITEMS_STORAGE_KEY = '@audio_store_items';

export const useClassItems = (classId: string) => {
    const [items, setItems] = useState<ItemModel[]>([]);
    const [loading, setLoading] = useState(true);

    const loadItems = useCallback(async () => {
        try {
            const jsonValue = await AsyncStorage.getItem(ITEMS_STORAGE_KEY);
            if (jsonValue != null) {
                const allItems: ItemModel[] = JSON.parse(jsonValue);
                const classItems = allItems.filter(item => item.classId === classId);
                setItems(classItems.sort((a, b) => b.createdAt - a.createdAt));
            }
        } catch (e) {
            console.error('Failed to load items', e);
        } finally {
            setLoading(false);
        }
    }, [classId]);

    useEffect(() => {
        loadItems();
    }, [loadItems]);

    const addItem = async (type: ItemType, title: string, uri: string, duration?: number, metadata?: any) => {
        const newItem: ItemModel = {
            id: Date.now().toString(),
            classId,
            type,
            title,
            uri,
            duration,
            createdAt: Date.now(),
            metadata,
        };

        try {
            const jsonValue = await AsyncStorage.getItem(ITEMS_STORAGE_KEY);
            const allItems: ItemModel[] = jsonValue != null ? JSON.parse(jsonValue) : [];
            const updatedAllItems = [newItem, ...allItems];

            await AsyncStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(updatedAllItems));

            // Update local state
            setItems(prev => [newItem, ...prev]);
        } catch (e) {
            console.error('Failed to save item', e);
        }
    };

    const deleteItem = async (id: string) => {
        try {
            const jsonValue = await AsyncStorage.getItem(ITEMS_STORAGE_KEY);
            if (jsonValue != null) {
                const allItems: ItemModel[] = JSON.parse(jsonValue);
                const updatedAllItems = allItems.filter(item => item.id !== id);
                await AsyncStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(updatedAllItems));

                setItems(prev => prev.filter(item => item.id !== id));
            }
        } catch (e) {
            console.error('Failed to delete item', e);
        }
    };

    return {
        items,
        loading,
        addItem,
        deleteItem,
        refreshItems: loadItems,
    };
};
