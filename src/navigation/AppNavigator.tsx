import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform } from 'react-native';
import { RootStackParamList } from '../types';
import { colors } from '../constants/theme';

// Screens
import { HomeScreen } from '../screens/HomeScreen';
import { ClassDetailsScreen } from '../screens/ClassDetailsScreen';
import { RecorderScreen } from '../screens/RecorderScreen';
import { ShareModalScreen } from '../screens/ShareModalScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerStyle: {
                        backgroundColor: colors.background,
                    },
                    headerShadowVisible: false,
                    headerTintColor: colors.primary,
                    headerTitleStyle: {
                        fontWeight: '600',
                        color: colors.text,
                    },
                    contentStyle: {
                        backgroundColor: colors.background,
                    },
                }}
            >
                <Stack.Screen
                    name="Home"
                    component={HomeScreen}
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="ClassDetails"
                    component={ClassDetailsScreen}
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="Recorder"
                    component={RecorderScreen}
                    options={{
                        presentation: 'modal',
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="ShareModal"
                    component={ShareModalScreen}
                    options={{
                        presentation: 'modal',
                        headerShown: false,
                    }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};
