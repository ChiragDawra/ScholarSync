import React, { useState, useEffect } from 'react'
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { StatCard } from '@/components/StatCard'
import { useAuth } from '@/lib/AuthContext'
import { useTheme } from '@/lib/useTheme'
import { Colors, Spacing, BorderRadius } from '@/constants/theme'
import { collection, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from '@shared/api/firebase'
import type { Session, Streak } from '@shared/types'
import { getDefaultStreak } from '@shared/utils/streakUtils'
import { Clock, Zap, Target, Flame, TrendingUp, TrendingDown } from 'lucide-react-native'
import Svg, { Rect } from 'react-native-svg'

const { width } = Dimensions.get('window')

export default function AnalyticsScreen() {
  const { user, profile } = useAuth()
  const { colors } = useTheme()
  const [sessions, setSessions] = useState<Session[]>([])
  const [streak, setStreak] = useState<Streak>(getDefaultStreak())

  useEffect(() => {
    if (!user) return
    const load = async () => {
      const sessSnap = await getDocs(collection(db, 'users', user.uid, 'sessions'))
      setSessions(sessSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Session)))

      const streakDoc = await getDoc(doc(db, 'users', user.uid, 'profile', 'streak'))
      if (streakDoc.exists()) setStreak(streakDoc.data() as Streak)
    }
    load()
  }, [user])

  const totalHours = Math.round(sessions.reduce((s, x) => s + x.durationMinutes, 0) / 60 * 10) / 10
  const avgFocus = sessions.length > 0
    ? Math.round(sessions.reduce((s, x) => s + x.focusScore, 0) / sessions.length)
    : 0
  const totalTasks = sessions.reduce((s, x) => s + x.todosCompleted, 0)

  // Subject breakdown
  const subjectHours: Record<string, number> = {}
  sessions.forEach((s) => {
    const subj = profile?.subjects?.find((x) => x.id === s.subjectId)
    const name = subj?.name || 'Other'
    subjectHours[name] = (subjectHours[name] || 0) + s.durationMinutes
  })
  const sortedSubjects = Object.entries(subjectHours)
    .sort(([, a], [, b]) => b - a)
  const maxMinutes = sortedSubjects.length > 0 ? sortedSubjects[0][1] : 1

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <ThemedText variant="title" style={{ fontSize: 28 }}>
              Analytics
            </ThemedText>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <StatCard
              label="Total Hours"
              value={`${totalHours}h`}
              icon={<Clock size={18} color={Colors.dark.info} />}
              color={Colors.dark.info}
            />
            <StatCard
              label="Avg Focus"
              value={`${avgFocus}%`}
              icon={<Zap size={18} color={Colors.dark.brand} />}
              color={Colors.dark.brand}
            />
          </View>
          <View style={styles.statsRow}>
            <StatCard
              label="Tasks Done"
              value={totalTasks}
              icon={<Target size={18} color={Colors.dark.success} />}
              color={Colors.dark.success}
            />
            <StatCard
              label="Streak"
              value={`${streak.current}d`}
              icon={<Flame size={18} color={Colors.dark.warning} />}
              color={Colors.dark.warning}
            />
          </View>

          {/* Subject Breakdown (bar chart) */}
          <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <ThemedText variant="heading" style={styles.sectionTitle}>
              Study Time by Subject
            </ThemedText>
            {sortedSubjects.length === 0 ? (
              <ThemedText variant="body" color="muted" style={{ textAlign: 'center', paddingVertical: 20 }}>
                No session data yet
              </ThemedText>
            ) : (
              sortedSubjects.map(([name, minutes]) => {
                const subj = profile?.subjects?.find((s) => s.name === name)
                const color = subj?.color || Colors.dark.brand
                const barWidth = (minutes / maxMinutes) * (width - 120)
                return (
                  <View key={name} style={styles.barRow}>
                    <ThemedText variant="caption" color="secondary" style={styles.barLabel}>
                      {name}
                    </ThemedText>
                    <View style={styles.barContainer}>
                      <View
                        style={[
                          styles.bar,
                          {
                            width: Math.max(barWidth, 20),
                            backgroundColor: color,
                          },
                        ]}
                      />
                    </View>
                    <ThemedText variant="caption" color="muted" style={styles.barValue}>
                      {Math.round(minutes / 60 * 10) / 10}h
                    </ThemedText>
                  </View>
                )
              })
            )}
          </View>

          {/* Weekly Performance */}
          <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <ThemedText variant="heading" style={styles.sectionTitle}>
              Weak Areas
            </ThemedText>
            {sortedSubjects.length <= 1 ? (
              <ThemedText variant="body" color="muted" style={{ textAlign: 'center', paddingVertical: 20 }}>
                Study more subjects to see weak areas
              </ThemedText>
            ) : (
              sortedSubjects.slice(-3).reverse().map(([name, minutes]) => {
                const subj = profile?.subjects?.find((s) => s.name === name)
                return (
                  <View key={name} style={[styles.weakItem, { borderColor: colors.borderLight }]}>
                    <View style={[styles.weakDot, { backgroundColor: subj?.color || colors.danger }]} />
                    <View style={{ flex: 1 }}>
                      <ThemedText variant="body" weight="medium">{name}</ThemedText>
                      <ThemedText variant="caption" color="muted">
                        Only {Math.round(minutes / 60 * 10) / 10}h studied
                      </ThemedText>
                    </View>
                    <TrendingDown size={16} color={colors.danger} />
                  </View>
                )
              })
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingBottom: 40 },
  header: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing['2xl'],
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  section: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: { marginBottom: Spacing.lg },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  barLabel: { width: 60 },
  barContainer: { flex: 1, marginHorizontal: 8 },
  bar: {
    height: 20,
    borderRadius: 4,
    opacity: 0.8,
  },
  barValue: { width: 36, textAlign: 'right' },
  weakItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  weakDot: { width: 10, height: 10, borderRadius: 5 },
})
