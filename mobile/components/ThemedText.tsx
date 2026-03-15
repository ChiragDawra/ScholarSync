import React from 'react'
import { Text, type TextProps, StyleSheet } from 'react-native'
import { useTheme } from '@/lib/useTheme'
import { FontSize } from '@/constants/theme'

interface ThemedTextProps extends TextProps {
  variant?: 'title' | 'heading' | 'body' | 'caption' | 'label'
  color?: 'primary' | 'secondary' | 'muted' | 'brand' | 'success' | 'warning' | 'danger'
  weight?: 'normal' | 'medium' | 'semibold' | 'bold'
}

export function ThemedText({
  variant = 'body',
  color = 'primary',
  weight,
  style,
  ...props
}: ThemedTextProps) {
  const { colors } = useTheme()

  const textColor =
    color === 'secondary' ? colors.textSecondary
    : color === 'muted' ? colors.textMuted
    : color === 'brand' ? colors.brand
    : color === 'success' ? colors.success
    : color === 'warning' ? colors.warning
    : color === 'danger' ? colors.danger
    : colors.text

  const fontSize =
    variant === 'title' ? FontSize['3xl']
    : variant === 'heading' ? FontSize.xl
    : variant === 'caption' ? FontSize.xs
    : variant === 'label' ? FontSize.sm
    : FontSize.md

  const fontWeight =
    weight ?? (variant === 'title' ? '700' : variant === 'heading' ? '600' : '400')

  return (
    <Text
      style={[
        { color: textColor, fontSize, fontWeight: fontWeight as any },
        style,
      ]}
      {...props}
    />
  )
}
