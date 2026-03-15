import React, { useState, useEffect } from 'react'
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { StatCard } from '@/components/StatCard'
import { useAuth } from '@/lib/AuthContext'
import { useTheme } from '@/lib/useTheme'
import { Colors, Spacing, BorderRadius } from '@/constants/theme'
import { doc, getDoc, collection, getDocs, query, orderBy, limit } from 'firebase/firestore'
import { db } from '@shared/api/firebase'
import type { Streak, Session, Exam } from '@shared/types'
import { getDefaultStreak } from '@shared/utils/streakUtils'
import { Flame, Clock, Target, Zap, BookOpen, Calendar } from 'lucide-react-native'

export default function DashboardScreen() {
  const { user, profile } = useAuth()
  const { colors } = useTheme()
  const [streak, setStreak] = useState<Streak>(getDefaultStreak())
  const [sessions, setSessions] = useState<Session[]>([])
  const [exams, setExams] = useState<Exam[]>([])
  const [refreshing, setRefreshing] = useState(false)

  const loadData = async () => {
    if (!user) return
    try {
      // Load streak
      const streakDoc = await getDoc(doc(db, 'users', user.uid, 'profile', 'streak'))
      if (streakDoc.exists()) setStreak(streakDoc.data() as Streak)

      // Load recent sessions
      const sessionsSnap = await getDocs(
        query(collection(db, 'users', user.uid, 'sessions'), orderBy('date', 'desc'), limit(20))
      )
      setSessions(sessionsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Session)))

      // Load exams
      const examsSnap = await getDocs(collection(db, 'users', user.uid, 'exams'))
      setExams(examsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Exam)))
    } catch (err) {
      console.warn('Failed to load dashboard data:', err)
    }
  }

  useEffect(() => {
    loadData()
  }, [user])

  const onRefresh = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  const totalHours = Math.round(sessions.reduce((s, x) => s + x.durationMinutes, 0) / 60 * 10) / 10
  const avgFocus = sessions.length > 0
    ? Math.round(sessions.reduce((s, x) => s + x.focusScore, 0) / sessions.length)
    : 0
  const upcomingExams = exams.filter((e) => {
    const d = e.date && typeof e.date === 'object' && 'seconds' in e.date
      ? new Date((e.date as any).seconds * 1000)
      : new Date(e.date as any)
    return d.getTime() > Date.now()
  }).length

  const firstName = (profile?.name || user?.displayName || 'Student').split(' ')[0]

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <ThemedText variant="body" color="secondary">
                Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},
              </ThemedText>
              <ThemedText variant="title" style={{ fontSize: 28 }}>
                {firstName} 👋
              </ThemedText>
            </View>
            <View style={[styles.streakBadge, { backgroundColor: colors.brandDim }]}>
              <Flame size={18} color={colors.warning} />
              <ThemedText variant="body" weight="bold" color="brand">
                {streak.current}
              </ThemedText>
            </View>
          </View>

          {/* Stat Cards */}
          <View style={styles.statsRow}>
            <StatCard
              label="Study Hours"
              value={`${totalHours}h`}
              icon={<Clock size={18} color={Colors.dark.info} />}
              color={Colors.dark.info}
            />
            <StatCard
              label="Focus Score"
              value={`${avgFocus}%`}
              icon={<Zap size={18} color={Colors.dark.brand} />}
              color={Colors.dark.brand}
            />
          </View>
          <View style={styles.statsRow}>
            <StatCard
              label="Sessions"
              value={sessions.length}
              icon={<Target size={18} color={Colors.dark.success} />}
              color={Colors.dark.success}
            />
            <StatCard
              label="Upcoming Exams"
              value={upcomingExams}
              icon={<BookOpen size={18} color={Colors.dark.warning} />}
              color={Colors.dark.warning}
            />
          </View>

          {/* Today's Schedule placeholder */}
          <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.sectionHeader}>
              <Calendar size={18} color={colors.brand} />
              <ThemedText variant="heading">Today's Schedule</ThemedText>
            </View>
            {sessions.length === 0 ? (
              <View style={styles.emptyState}>
                <ThemedText variant="body" color="muted" style={{ textAlign: 'center' }}>
                  No study sessions yet today.{'\n'}Start a Pomodoro session to build your streak!
                </ThemedText>
              </View>
            ) : (
              <View style={styles.sessionsList}>
                {sessions.slice(0, 3).map((s, i) => {
                  const subj = profile?.subjects?.find((x) => x.id === s.subjectId)
                  return (
                    <View key={s.id || i} style={[styles.sessionItem, { borderColor: colors.borderLight }]}>
                      <View style={[styles.subjectDot, { backgroundColor: subj?.color || colors.brand }]} />
                      <View style={{ flex: 1 }}>
                        <ThemedText variant="body" weight="medium">
                          {subj?.name || 'Study Session'}
                        </ThemedText>
                        <ThemedText variant="caption" color="muted">
                          {s.durationMinutes} min · Focus: {s.focusScore}%
                        </ThemedText>
                      </View>
                    </View>
                  )
                })}
              </View>
            )}
          </View>

          {/* AI Insight */}
          <View style={[styles.section, styles.insightCard]}>
            <View style={styles.sectionHeader}>
              <Zap size={18} color={Colors.dark.brand} />
              <ThemedText variant="heading">AI Insight</ThemedText>
            </View>
            <ThemedText variant="body" color="secondary" style={{ lineHeight: 22 }}>
              {streak.current > 0
                ? `Great job maintaining a ${streak.current}-day streak! ${avgFocus >= 70 ? 'Your focus scores are excellent.' : 'Try to minimize distractions during sessions for better focus.'}`
                : 'Start a study session today to begin building your streak! Consistency is the key to academic success.'}
            </ThemedText>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.lg,
    paddingBottom: Spacing['2xl'],
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  emptyState: {
    paddingVertical: Spacing['2xl'],
  },
  sessionsList: { gap: Spacing.md },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  subjectDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  insightCard: {
    backgroundColor: 'rgba(139,92,246,0.08)',
    borderColor: 'rgba(139,92,246,0.2)',
  },
})
