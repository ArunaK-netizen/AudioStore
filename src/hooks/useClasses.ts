import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ClassModel } from '../types';

const CLASSES_STORAGE_KEY = '@audio_store_classes';

export const useClasses = () => {
    const [classes, setClasses] = useState<ClassModel[]>([]);
    const [loading, setLoading] = useState(true);

    const loadClasses = useCallback(async () => {
        try {
            const jsonValue = await AsyncStorage.getItem(CLASSES_STORAGE_KEY);
            if (jsonValue != null) {
                setClasses(JSON.parse(jsonValue));
            }
        } catch (e) {
            console.error('Failed to load classes', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadClasses();
    }, [loadClasses]);

    const addClass = async (name: string) => {
        const newClass: ClassModel = {
            id: Date.now().toString(),
            name,
            createdAt: Date.now(),
            // Assign a random pastel color or let user pick later. For now, just default.
        };

        const updatedClasses = [newClass, ...classes];
        setClasses(updatedClasses);
        try {
            await AsyncStorage.setItem(CLASSES_STORAGE_KEY, JSON.stringify(updatedClasses));
        } catch (e) {
            console.error('Failed to save class', e);
        }
    };

    const deleteClass = async (id: string) => {
        const updatedClasses = classes.filter((c) => c.id !== id);
        setClasses(updatedClasses);
        try {
            await AsyncStorage.setItem(CLASSES_STORAGE_KEY, JSON.stringify(updatedClasses));
        } catch (e) {
            console.error('Failed to delete class', e);
        }
    };

    return {
        classes,
        loading,
        addClass,
        deleteClass,
        refreshClasses: loadClasses,
    };
};
