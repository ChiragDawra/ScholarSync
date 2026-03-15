import React, { useState, useEffect } from 'react'
import {
  View,
  ScrollView,
  StyleSheet,
} from 'react-native'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { StatCard } from '@/components/StatCard'
import { useAuth } from '@/lib/AuthContext'
import { useTheme } from '@/lib/useTheme'
import { Colors, Spacing, BorderRadius } from '@/constants/theme'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@shared/api/firebase'
import type { Course } from '@shared/types'
import { Calculator, TrendingUp, BookOpen, Award } from 'lucide-react-native'
import Slider from '@react-native-community/slider'

export default function GpaPredictorScreen() {
  const { user, profile } = useAuth()
  const { colors } = useTheme()
  const [courses, setCourses] = useState<Course[]>([])
  const [targetCgpa, setTargetCgpa] = useState(8.0)

  useEffect(() => {
    if (!user) return
    const load = async () => {
      const snap = await getDocs(collection(db, 'users', user.uid, 'courses'))
      setCourses(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Course)))
    }
    load()
  }, [user])

  // Simple required score calculation
  const totalCredits = courses.reduce((s, c) => s + c.creditHours, 0)
  const currentWeighted = courses.reduce((s, c) => s + (c.currentScore / c.maxScore) * c.creditHours * 10, 0)
  const currentCgpa = totalCredits > 0 ? Math.round((currentWeighted / totalCredits) * 100) / 100 : 0

  const getRequiredScore = (course: Course) => {
    if (totalCredits === 0) return 0
    const otherCredits = totalCredits - course.creditHours
    const otherWeighted = currentWeighted - (course.currentScore / course.maxScore) * course.creditHours * 10
    const neededForThis = (targetCgpa * totalCredits - otherWeighted) / course.creditHours
    return Math.round(Math.max(0, Math.min(100, (neededForThis / 10) * 100)))
  }

  const getScoreColor = (score: number) => {
    if (score < 75) return colors.success
    if (score < 90) return colors.warning
    return colors.danger
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard
            label="Current CGPA"
            value={currentCgpa.toFixed(1)}
            icon={<TrendingUp size={18} color={Colors.dark.info} />}
            color={Colors.dark.info}
          />
          <StatCard
            label="Total Credits"
            value={totalCredits}
            icon={<BookOpen size={18} color={Colors.dark.success} />}
            color={Colors.dark.success}
          />
        </View>

        {/* Target slider */}
        <View style={[styles.sliderCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.sliderHeader}>
            <ThemedText variant="body" color="secondary">
              Target CGPA
            </ThemedText>
            <ThemedText variant="heading" weight="bold" color="brand">
              {targetCgpa.toFixed(1)}
            </ThemedText>
          </View>
          <View style={styles.sliderRow}>
            <ThemedText variant="caption" color="muted">6.0</ThemedText>
            <View style={{ flex: 1, marginHorizontal: 8 }}>
              {/* Note: @react-native-community/slider needs to be installed */}
              <View style={styles.sliderTrack}>
                <View
                  style={[
                    styles.sliderFill,
                    {
                      width: `${((targetCgpa - 6) / 4) * 100}%`,
                      backgroundColor: colors.brand,
                    },
                  ]}
                />
              </View>
              <View style={styles.sliderTicks}>
                {[6, 7, 8, 9, 10].map((v) => (
                  <ThemedText key={v} variant="caption" color="muted">{v}</ThemedText>
                ))}
              </View>
            </View>
            <ThemedText variant="caption" color="muted">10.0</ThemedText>
          </View>
          {/* Touch buttons for slider */}
          <View style={styles.sliderBtns}>
            {[7.0, 7.5, 8.0, 8.5, 9.0, 9.5].map((v) => (
              <View
                key={v}
                style={[
                  styles.sliderBtn,
                  {
                    backgroundColor: Math.abs(targetCgpa - v) < 0.05 ? colors.brand : colors.surfaceRaised,
                  },
                ]}
                onTouchEnd={() => setTargetCgpa(v)}
              >
                <ThemedText
                  variant="caption"
                  weight="semibold"
                  style={{ color: Math.abs(targetCgpa - v) < 0.05 ? '#fff' : colors.textSecondary }}
                >
                  {v.toFixed(1)}
                </ThemedText>
              </View>
            ))}
          </View>
        </View>

        {/* Courses table */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <ThemedText variant="heading" style={styles.sectionTitle}>
            Course Performance
          </ThemedText>

          {courses.length === 0 ? (
            <View style={styles.emptyState}>
              <Calculator size={32} color={colors.textMuted} />
              <ThemedText variant="body" color="muted" style={{ marginTop: 8 }}>
                No courses added yet
              </ThemedText>
            </View>
          ) : (
            courses.map((c) => {
              const subj = profile?.subjects?.find((s) => s.id === c.subjectId)
              const required = getRequiredScore(c)
              const scoreColor = getScoreColor(required)
              const percent = Math.round((c.currentScore / c.maxScore) * 100)
              return (
                <View key={c.id} style={[styles.courseRow, { borderColor: colors.borderLight }]}>
                  <View style={{ flex: 1 }}>
                    <ThemedText variant="body" weight="medium">
                      {subj?.name || c.courseCode}
                    </ThemedText>
                    <View style={styles.courseDetails}>
                      <ThemedText variant="caption" color="muted">
                        {c.currentScore}/{c.maxScore} ({percent}%)
                      </ThemedText>
                      <ThemedText variant="caption" color="muted">
                        {c.creditHours} credits
                      </ThemedText>
                    </View>
                    {/* Progress bar */}
                    <View style={[styles.progressBg, { backgroundColor: colors.surfaceRaised }]}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${percent}%`,
                            backgroundColor: percent >= 80 ? colors.success : percent >= 60 ? colors.warning : colors.danger,
                          },
                        ]}
                      />
                    </View>
                  </View>
                  <View style={[styles.requiredBadge, { backgroundColor: `${scoreColor}20` }]}>
                    <ThemedText variant="caption" weight="bold" style={{ color: scoreColor }}>
                      {required}%
                    </ThemedText>
                    <ThemedText variant="caption" style={{ color: scoreColor, fontSize: 9 }}>
                      needed
                    </ThemedText>
                  </View>
                </View>
              )
            })
          )}
        </View>
      </ScrollView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: Spacing.lg, paddingBottom: 40 },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  sliderCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sliderTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.dark.surfaceRaised,
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    borderRadius: 3,
  },
  sliderTicks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingHorizontal: 2,
  },
  sliderBtns: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  sliderBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  section: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: { marginBottom: Spacing.lg },
  emptyState: { alignItems: 'center', paddingVertical: 30 },
  courseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  courseDetails: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: 2,
    marginBottom: 6,
  },
  progressBg: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  requiredBadge: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
  },
})
