import React, { useState, useEffect } from 'react'
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { useAuth } from '@/lib/AuthContext'
import { useTheme } from '@/lib/useTheme'
import { Colors, Spacing, BorderRadius } from '@/constants/theme'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@shared/api/firebase'
import type { Exam } from '@shared/types'
import { BookOpen, Clock, AlertTriangle, Plus } from 'lucide-react-native'

export default function ExamsScreen() {
  const { user, profile } = useAuth()
  const { colors } = useTheme()
  const [exams, setExams] = useState<Exam[]>([])

  useEffect(() => {
    if (!user) return
    const load = async () => {
      const snap = await getDocs(collection(db, 'users', user.uid, 'exams'))
      setExams(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Exam)))
    }
    load()
  }, [user])

  const getExamDate = (e: Exam) => {
    if (e.date && typeof e.date === 'object' && 'seconds' in e.date)
      return new Date((e.date as any).seconds * 1000)
    return new Date(e.date as any)
  }

  const sortedExams = [...exams].sort(
    (a, b) => getExamDate(a).getTime() - getExamDate(b).getTime()
  )

  const upcomingExams = sortedExams.filter((e) => getExamDate(e).getTime() > Date.now())
  const pastExams = sortedExams.filter((e) => getExamDate(e).getTime() <= Date.now())

  const getDaysLeft = (e: Exam) => {
    return Math.ceil((getExamDate(e).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  }

  const getUrgencyColor = (days: number) => {
    if (days <= 3) return colors.danger
    if (days <= 7) return colors.warning
    return colors.success
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Add exam button */}
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.brand }]}>
          <Plus size={20} color="#fff" />
          <ThemedText variant="body" weight="semibold" style={{ color: '#fff' }}>
            Add Exam
          </ThemedText>
        </TouchableOpacity>

        {/* Upcoming */}
        <ThemedText variant="heading" style={styles.sectionTitle}>
          Upcoming ({upcomingExams.length})
        </ThemedText>

        {upcomingExams.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <BookOpen size={32} color={colors.textMuted} />
            <ThemedText variant="body" color="muted" style={{ marginTop: 8 }}>
              No upcoming exams
            </ThemedText>
          </View>
        ) : (
          upcomingExams.map((e) => {
            const subj = profile?.subjects?.find((s) => s.id === e.subjectId)
            const days = getDaysLeft(e)
            const urgencyColor = getUrgencyColor(days)
            return (
              <View
                key={e.id}
                style={[styles.examCard, { backgroundColor: colors.surface, borderColor: colors.border, borderLeftColor: urgencyColor, borderLeftWidth: 4 }]}
              >
                <View style={styles.examHeader}>
                  <View style={[styles.subjectTag, { backgroundColor: `${subj?.color || colors.brand}20` }]}>
                    <ThemedText variant="caption" weight="semibold" style={{ color: subj?.color || colors.brand }}>
                      {subj?.name || 'Subject'}
                    </ThemedText>
                  </View>
                  <View style={styles.difficultyStars}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <ThemedText key={i} variant="caption" style={{ color: i < e.difficulty ? colors.warning : colors.textMuted }}>
                        ★
                      </ThemedText>
                    ))}
                  </View>
                </View>

                <View style={styles.examBody}>
                  <View style={styles.examInfo}>
                    <Clock size={14} color={colors.textMuted} />
                    <ThemedText variant="caption" color="secondary">
                      {getExamDate(e).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </ThemedText>
                  </View>

                  <View style={[styles.countdownBadge, { backgroundColor: `${urgencyColor}20` }]}>
                    {days <= 3 && <AlertTriangle size={12} color={urgencyColor} />}
                    <ThemedText variant="caption" weight="bold" style={{ color: urgencyColor }}>
                      {days === 0 ? 'Today!' : days === 1 ? 'Tomorrow' : `${days} days`}
                    </ThemedText>
                  </View>
                </View>
              </View>
            )
          })
        )}

        {/* Past exams */}
        {pastExams.length > 0 && (
          <>
            <ThemedText variant="heading" style={styles.sectionTitle}>
              Past ({pastExams.length})
            </ThemedText>
            {pastExams.slice(0, 5).map((e) => {
              const subj = profile?.subjects?.find((s) => s.id === e.subjectId)
              return (
                <View
                  key={e.id}
                  style={[styles.examCard, { backgroundColor: colors.surface, borderColor: colors.border, opacity: 0.6 }]}
                >
                  <ThemedText variant="body" color="secondary">
                    {subj?.name || 'Subject'} — {getExamDate(e).toLocaleDateString()}
                  </ThemedText>
                </View>
              )
            })}
          </>
        )}
      </ScrollView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: Spacing.lg, paddingBottom: 40 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing['2xl'],
  },
  sectionTitle: { marginBottom: Spacing.md },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 40,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  examCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  examHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  subjectTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  difficultyStars: { flexDirection: 'row', gap: 2 },
  examBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  examInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  countdownBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
})
