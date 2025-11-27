export const palette = {
    // Light Mode Colors
    lightBackground: '#F2F2F7',
    lightCard: '#FFFFFF',
    lightText: '#000000',
    lightTextSecondary: '#8E8E93',
    lightBorder: '#C6C6C8',

    // Dark Mode Colors (High Contrast)
    darkBackground: '#000000',
    darkCard: '#1C1C1E',
    darkText: '#FFFFFF',
    darkTextSecondary: '#8E8E93',
    darkBorder: '#38383A',

    // Shared
    primary: '#0A84FF', // iOS Blue
    destructive: '#FF453A', // iOS Red
    success: '#30D158', // iOS Green
    warning: '#FFD60A', // iOS Yellow
    overlay: 'rgba(0, 0, 0, 0.5)',
};

export const typography = {
    largeTitle: {
        fontSize: 34,
        fontWeight: '700' as const,
        letterSpacing: 0.37,
    },
    title1: {
        fontSize: 28,
        fontWeight: '700' as const,
        letterSpacing: 0.36,
    },
    title2: {
        fontSize: 22,
        fontWeight: '700' as const,
        letterSpacing: 0.35,
    },
    title3: {
        fontSize: 20,
        fontWeight: '600' as const,
        letterSpacing: 0.38,
    },
    headline: {
        fontSize: 17,
        fontWeight: '600' as const,
        letterSpacing: -0.41,
    },
    body: {
        fontSize: 17,
        fontWeight: '400' as const,
        letterSpacing: -0.41,
    },
    callout: {
        fontSize: 16,
        fontWeight: '400' as const,
        letterSpacing: -0.32,
    },
    subhead: {
        fontSize: 15,
        fontWeight: '400' as const,
        letterSpacing: -0.24,
    },
    footnote: {
        fontSize: 13,
        fontWeight: '400' as const,
        letterSpacing: -0.08,
    },
    caption1: {
        fontSize: 12,
        fontWeight: '400' as const,
        letterSpacing: 0,
    },
    caption2: {
        fontSize: 11,
        fontWeight: '400' as const,
        letterSpacing: 0.07,
    },
};

export const layout = {
    padding: 16,
    borderRadius: 12, // More rounded for modern look
    headerHeight: 44,
};

export const shadows = {
    small: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.18,
        shadowRadius: 1.00,
        elevation: 1,
    },
    medium: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
};

export const lightTheme = {
    dark: false,
    colors: {
        background: palette.lightBackground,
        card: palette.lightCard,
        text: palette.lightText,
        textSecondary: palette.lightTextSecondary,
        border: palette.lightBorder,
        primary: palette.primary,
        destructive: palette.destructive,
        success: palette.success,
        warning: palette.warning,
        overlay: palette.overlay,
    },
};

export const darkTheme = {
    dark: true,
    colors: {
        background: palette.darkBackground,
        card: palette.darkCard,
        text: palette.darkText,
        textSecondary: palette.darkTextSecondary,
        border: palette.darkBorder,
        primary: palette.primary,
        destructive: palette.destructive,
        success: palette.success,
        warning: palette.warning,
        overlay: 'rgba(0, 0, 0, 0.75)',
    },
};

// Default export for backward compatibility until refactor is complete
export const colors = lightTheme.colors;
