import React from 'react'
import { View, StyleSheet } from 'react-native'
import { ThemedText } from './ThemedText'
import { useTheme } from '@/lib/useTheme'
import { Spacing, BorderRadius } from '@/constants/theme'

interface StatCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  trend?: { value: string; positive: boolean }
  color?: string
}

export function StatCard({ label, value, icon, trend, color }: StatCardProps) {
  const { colors } = useTheme()

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.header}>
        <View
          style={[
            styles.iconWrap,
            { backgroundColor: color ? `${color}20` : colors.brandDim },
          ]}
        >
          {icon}
        </View>
        {trend && (
          <View
            style={[
              styles.trendBadge,
              {
                backgroundColor: trend.positive
                  ? `${colors.success}20`
                  : `${colors.danger}20`,
              },
            ]}
          >
            <ThemedText
              variant="caption"
              style={{
                color: trend.positive ? colors.success : colors.danger,
                fontWeight: '600',
              }}
            >
              {trend.positive ? '↑' : '↓'} {trend.value}
            </ThemedText>
          </View>
        )}
      </View>
      <ThemedText variant="heading" weight="bold" style={styles.value}>
        {String(value)}
      </ThemedText>
      <ThemedText variant="caption" color="muted">
        {label}
      </ThemedText>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    minWidth: 140,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  value: {
    marginBottom: 2,
  },
})
