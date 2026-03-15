// ScholarSync mobile design tokens — matching the web app's color system
export const Colors = {
  dark: {
    background: '#0F0A1A',
    surface: '#1A1425',
    surfaceRaised: '#241E30',
    border: 'rgba(255,255,255,0.08)',
    borderLight: 'rgba(255,255,255,0.04)',
    text: '#F5F5F7',
    textSecondary: '#9CA3AF',
    textMuted: '#6B7280',
    brand: '#8B5CF6',
    brandLight: '#A78BFA',
    brandDim: 'rgba(139,92,246,0.15)',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6',
    tabBarBg: '#1A1425',
    tabBarBorder: 'rgba(255,255,255,0.06)',
    tabBarActive: '#8B5CF6',
    tabBarInactive: '#6B7280',
  },
  light: {
    background: '#F8F9FA',
    surface: '#FFFFFF',
    surfaceRaised: '#F3F4F6',
    border: 'rgba(0,0,0,0.08)',
    borderLight: 'rgba(0,0,0,0.04)',
    text: '#111827',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    brand: '#7C3AED',
    brandLight: '#8B5CF6',
    brandDim: 'rgba(124,58,237,0.1)',
    success: '#059669',
    warning: '#D97706',
    danger: '#DC2626',
    info: '#2563EB',
    tabBarBg: '#FFFFFF',
    tabBarBorder: 'rgba(0,0,0,0.06)',
    tabBarActive: '#7C3AED',
    tabBarInactive: '#9CA3AF',
  },
} as const

export type ThemeMode = 'dark' | 'light'

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
} as const

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
} as const

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const
