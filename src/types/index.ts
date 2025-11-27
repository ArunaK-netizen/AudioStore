export interface ClassModel {
    id: string;
    name: string;
    createdAt: number;
    color?: string; // Optional custom color for the class card
}

export type ItemType = 'audio' | 'youtube';

export interface ItemModel {
    id: string;
    classId: string;
    type: ItemType;
    title: string;
    uri: string; // File path or YouTube URL
    duration?: number; // In seconds, for audio
    createdAt: number;
    metadata?: {
        thumbnailUrl?: string; // For YouTube
        originalFileName?: string;
    };
}

export type RootStackParamList = {
    Home: undefined;
    ClassDetails: { classId: string; className: string };
    Recorder: { classId?: string }; // Optional classId if entering from a specific class
    ShareModal: { sharedContent: any }; // Placeholder for share intent data
};
