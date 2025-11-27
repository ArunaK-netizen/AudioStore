import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput } from 'react-native';
import { Audio } from 'expo-av';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { X, Mic, Square, Play, Pause, Check } from 'lucide-react-native';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { useClassItems } from '../hooks/useClassItems';
import { useTheme } from '../context/ThemeContext';
import { typography, layout, shadows } from '../constants/theme';
import { RootStackParamList } from '../types';

type RecorderRouteProp = RouteProp<RootStackParamList, 'Recorder'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const RecorderScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<RecorderRouteProp>();
    const { classId } = route.params;
    const { addItem } = useClassItems(classId);
    const { theme } = useTheme();

    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [uri, setUri] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [showSaveInput, setShowSaveInput] = useState(false);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRecording) {
            interval = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRecording]);

    useEffect(() => {
        return () => {
            if (recording) {
                recording.stopAndUnloadAsync();
            }
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, []);

    async function startRecording() {
        try {
            await Audio.requestPermissionsAsync();
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            setRecording(recording);
            setIsRecording(true);
            setDuration(0);
            setUri(null);
        } catch (err) {
            console.error('Failed to start recording', err);
            Alert.alert('Error', 'Failed to start recording');
        }
    }

    async function stopRecording() {
        if (!recording) return;
        setIsRecording(false);
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setUri(uri);
        setRecording(null);
    }

    async function playSound() {
        if (!uri) return;
        try {
            const { sound } = await Audio.Sound.createAsync({ uri });
            setSound(sound);
            setIsPlaying(true);
            await sound.playAsync();
            sound.setOnPlaybackStatusUpdate((status) => {
                if (status.isLoaded && status.didJustFinish) {
                    setIsPlaying(false);
                }
            });
        } catch (error) {
            console.error(error);
        }
    }

    async function stopSound() {
        if (sound) {
            await sound.stopAsync();
            setIsPlaying(false);
        }
    }

    const handleSave = async () => {
        if (!title.trim()) {
            Alert.alert('Error', 'Please enter a title');
            return;
        }
        if (uri) {
            await addItem('audio', title.trim(), uri, duration);
            navigation.goBack();
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <ScreenWrapper style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <X size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[typography.headline, { color: theme.colors.text }]}>Record Audio</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.content}>
                <View style={styles.timerContainer}>
                    <Text style={[styles.timerText, { color: theme.colors.text }]}>{formatTime(duration)}</Text>
                </View>

                {showSaveInput ? (
                    <View style={styles.saveContainer}>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
                            placeholder="Recording Title"
                            placeholderTextColor={theme.colors.textSecondary}
                            value={title}
                            onChangeText={setTitle}
                            autoFocus
                        />
                        <TouchableOpacity
                            style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
                            onPress={handleSave}
                        >
                            <Text style={[typography.headline, { color: '#fff' }]}>Save Recording</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.controls}>
                        {uri && !isRecording ? (
                            <View style={styles.playbackControls}>
                                <TouchableOpacity
                                    style={[styles.controlButton, { backgroundColor: theme.colors.card }]}
                                    onPress={isPlaying ? stopSound : playSound}
                                >
                                    {isPlaying ? <Pause size={32} color={theme.colors.primary} /> : <Play size={32} color={theme.colors.primary} />}
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.controlButton, { backgroundColor: theme.colors.success, marginLeft: 20 }]}
                                    onPress={() => setShowSaveInput(true)}
                                >
                                    <Check size={32} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={[
                                    styles.recordButton,
                                    isRecording ? { backgroundColor: theme.colors.text } : { backgroundColor: theme.colors.destructive }
                                ]}
                                onPress={isRecording ? stopRecording : startRecording}
                            >
                                {isRecording ? <Square size={32} color={theme.colors.background} /> : <Mic size={40} color="#fff" />}
                            </TouchableOpacity>
                        )}
                        {isRecording && <Text style={[typography.subhead, { marginTop: 20, color: theme.colors.destructive }]}>Recording...</Text>}
                    </View>
                )}
            </View>
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
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: layout.padding,
    },
    timerContainer: {
        marginBottom: 60,
    },
    timerText: {
        fontSize: 64,
        fontWeight: '200',
        fontVariant: ['tabular-nums'],
    },
    controls: {
        alignItems: 'center',
    },
    recordButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        ...shadows.medium,
    },
    playbackControls: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    controlButton: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        ...shadows.small,
    },
    saveContainer: {
        width: '100%',
        alignItems: 'center',
    },
    input: {
        width: '100%',
        padding: 16,
        borderRadius: 12,
        fontSize: 17,
        marginBottom: 20,
        ...shadows.small,
    },
    saveButton: {
        width: '100%',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        ...shadows.small,
    },
});
