import React from 'react'
import { View, type ViewProps, StyleSheet } from 'react-native'
import { useTheme } from '@/lib/useTheme'

interface ThemedViewProps extends ViewProps {
  variant?: 'base' | 'surface' | 'raised'
}

export function ThemedView({ variant = 'base', style, ...props }: ThemedViewProps) {
  const { colors } = useTheme()

  const bgColor =
    variant === 'raised'
      ? colors.surfaceRaised
      : variant === 'surface'
      ? colors.surface
      : colors.background

  return <View style={[{ backgroundColor: bgColor }, style]} {...props} />
}

export function Card({ style, ...props }: ViewProps) {
  const { colors } = useTheme()
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: colors.border,
          padding: 16,
        },
        style,
      ]}
      {...props}
    />
  )
}
