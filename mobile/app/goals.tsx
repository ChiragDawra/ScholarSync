import React, { useState, useEffect } from 'react'
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { useAuth } from '@/lib/AuthContext'
import { useTheme } from '@/lib/useTheme'
import { Colors, Spacing, BorderRadius } from '@/constants/theme'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@shared/api/firebase'
import type { Goal } from '@shared/types'
import { Target, Plus, CheckCircle2, Circle, Trophy } from 'lucide-react-native'
import Svg, { Circle as SvgCircle } from 'react-native-svg'

const RING_SIZE = 44
const STROKE = 4
const RADIUS = (RING_SIZE - STROKE) / 2
const CIRC = 2 * Math.PI * RADIUS

export default function GoalsScreen() {
  const { user } = useAuth()
  const { colors } = useTheme()
  const [goals, setGoals] = useState<Goal[]>([])
  const [filter, setFilter] = useState<'all' | 'weekly' | 'monthly'>('all')

  useEffect(() => {
    if (!user) return
    const load = async () => {
      const snap = await getDocs(collection(db, 'users', user.uid, 'goals'))
      setGoals(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Goal)))
    }
    load()
  }, [user])

  const filtered = goals.filter((g) => filter === 'all' || g.type === filter)

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Add goal */}
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.brand }]}>
          <Plus size={20} color="#fff" />
          <ThemedText variant="body" weight="semibold" style={{ color: '#fff' }}>
            New Goal
          </ThemedText>
        </TouchableOpacity>

        {/* Filter tabs */}
        <View style={styles.filterRow}>
          {(['all', 'weekly', 'monthly'] as const).map((f) => (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterBtn,
                {
                  backgroundColor: filter === f ? colors.brand : colors.surface,
                  borderColor: filter === f ? colors.brand : colors.border,
                },
              ]}
              onPress={() => setFilter(f)}
            >
              <ThemedText
                variant="caption"
                weight="semibold"
                style={{ color: filter === f ? '#fff' : colors.textSecondary }}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        {/* Goals list */}
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Target size={40} color={colors.textMuted} />
            <ThemedText variant="body" color="muted" style={{ marginTop: 12 }}>
              No goals yet. Set your first goal!
            </ThemedText>
          </View>
        ) : (
          filtered.map((g) => {
            const progress = Math.min(100, Math.max(0, g.progress))
            const offset = CIRC * (1 - progress / 100)
            return (
              <View
                key={g.id}
                style={[
                  styles.goalCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    opacity: g.done ? 0.6 : 1,
                  },
                ]}
              >
                {/* Progress ring */}
                <View style={styles.ringWrap}>
                  <Svg width={RING_SIZE} height={RING_SIZE}>
                    <SvgCircle
                      cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RADIUS}
                      strokeWidth={STROKE} stroke={colors.surfaceRaised}
                      fill="transparent"
                    />
                    <SvgCircle
                      cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RADIUS}
                      strokeWidth={STROKE}
                      stroke={g.done ? colors.success : colors.brand}
                      fill="transparent"
                      strokeDasharray={CIRC} strokeDashoffset={offset}
                      strokeLinecap="round" rotation="-90"
                      origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
                    />
                  </Svg>
                  <View style={styles.ringLabel}>
                    {g.done ? (
                      <CheckCircle2 size={16} color={colors.success} />
                    ) : (
                      <ThemedText variant="caption" weight="bold" color="brand">
                        {progress}%
                      </ThemedText>
                    )}
                  </View>
                </View>

                <View style={{ flex: 1 }}>
                  <ThemedText
                    variant="body"
                    weight="medium"
                    style={g.done ? { textDecorationLine: 'line-through' } : undefined}
                  >
                    {g.title}
                  </ThemedText>
                  <View style={styles.goalMeta}>
                    <View style={[styles.typeBadge, {
                      backgroundColor: g.type === 'weekly' ? `${colors.info}20` : `${colors.brand}20`,
                    }]}>
                      <ThemedText variant="caption" style={{
                        color: g.type === 'weekly' ? colors.info : colors.brand,
                      }}>
                        {g.type}
                      </ThemedText>
                    </View>
                    {g.aiSuggested && (
                      <View style={[styles.typeBadge, { backgroundColor: `${colors.warning}20` }]}>
                        <ThemedText variant="caption" style={{ color: colors.warning }}>
                          AI suggested
                        </ThemedText>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            )
          })
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
    marginBottom: Spacing.lg,
  },
  filterRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  ringWrap: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringLabel: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalMeta: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
})
