/**
 * theme/colors.ts
 *
 * Single source of truth for all colors and design tokens.
 * To change a color app-wide, edit it here — nowhere else.
 */

export const palette = {
  white: '#FFFFFF',
  black: '#000000',

  // Violet — primary brand ramp
  violet50: '#F7F6FC',
  violet100: '#ECE9FA',
  violet300: '#A89BEF',
  violet500: '#7C6CF0',
  violet600: '#5B4BC4',
  violet900: '#15131F',

  // Neutral ramp, slightly violet-tinted instead of pure gray
  // so light/dark surfaces feel related to the brand color.
  gray50: '#F7F6FA',
  gray100: '#EFEEF5',
  gray200: '#E1DFEA',
  gray300: '#C9C6D6',
  gray400: '#9C98AC',
  gray500: '#716D82',
  gray600: '#4F4C5C',
  gray700: '#34313F',
  gray800: '#211F2B',
  gray900: '#15131F',

  red500: '#E24B4A',
  green500: '#2BC48A',
  yellow500: '#EF9F27',
} as const;

// Tokens shared by BOTH themes (don't change between light/dark)
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 4,
  md: 8,
  lg: 16,
  full: 9999,
} as const;

export const typography = {
  fontFamily: {
    regular: 'System',
    bold: 'System',
  },
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
} as const;

// Shape that BOTH light and dark themes must follow.
// Add a new key here once, then fill it in both themes below.
export interface ThemeColors {
  background: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  textMuted: string;
  border: string;
  primary: string;
  primaryLight: string;
  primaryText: string;
  danger: string;
  success: string;
  warning: string;
  // Tint laid over the blur view in the tab bar — needs its own
  // alpha-aware value, separate from `surface`, so content scrolling
  // underneath the glass shows through correctly.
  tabBarTint: string;
  tabBarBorder: string;
  transitionDuration : number
}

export const lightColors: ThemeColors = {
  background: palette.white,
  surface: palette.gray50,
  surfaceAlt: palette.gray100,
  text: palette.gray900,
  textMuted: palette.gray500,
  border: palette.gray200,
  primary: palette.violet600,
  primaryLight: palette.violet100,
  primaryText: palette.white,
  danger: palette.red500,
  success: palette.green500,
  warning: palette.yellow500,
  tabBarTint: 'rgba(255,255,255,0.72)',
  tabBarBorder: 'rgba(21,19,31,0.08)',
  transitionDuration : 2000,

};

export const darkColors: ThemeColors = {
  background: palette.gray900,
  surface: palette.gray800,
  surfaceAlt: palette.gray700,
  text: palette.gray50,
  textMuted: palette.gray400,
  border: palette.gray700,
  primary: palette.violet500,
  primaryLight: palette.violet900,
  primaryText: palette.white,
  danger: palette.red500,
  success: palette.green500,
  warning: palette.yellow500,
  tabBarTint: 'rgba(21,19,31,0.55)',
  tabBarBorder: 'rgba(255,255,255,0.08)',
  transitionDuration : 2000,
};
