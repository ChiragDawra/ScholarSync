import React, { useState, useEffect } from 'react'
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { useAuth } from '@/lib/AuthContext'
import { useTheme } from '@/lib/useTheme'
import { Colors, Spacing, BorderRadius } from '@/constants/theme'
import { collection, getDocs, addDoc, updateDoc, doc, Timestamp } from 'firebase/firestore'
import { db } from '@shared/api/firebase'
import type { Assignment } from '@shared/types'
import { Plus, Search, ClipboardList, AlertCircle, CheckCircle2, Circle } from 'lucide-react-native'

type Column = 'todo' | 'in_progress' | 'done'

const COLUMN_CONFIG: Record<Column, { label: string; color: string; icon: React.ReactNode }> = {
  todo: { label: 'To Do', color: Colors.dark.info, icon: <Circle size={16} color={Colors.dark.info} /> },
  in_progress: { label: 'In Progress', color: Colors.dark.warning, icon: <AlertCircle size={16} color={Colors.dark.warning} /> },
  done: { label: 'Done', color: Colors.dark.success, icon: <CheckCircle2 size={16} color={Colors.dark.success} /> },
}

export default function AssignmentsScreen() {
  const { user, profile } = useAuth()
  const { colors } = useTheme()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [search, setSearch] = useState('')
  const [activeColumn, setActiveColumn] = useState<Column>('todo')

  useEffect(() => {
    if (!user) return
    const loadAssignments = async () => {
      const snap = await getDocs(collection(db, 'users', user.uid, 'assignments'))
      setAssignments(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Assignment)))
    }
    loadAssignments()
  }, [user])

  const filteredAssignments = assignments
    .filter((a) => a.status === activeColumn)
    .filter((a) => !search || a.title.toLowerCase().includes(search.toLowerCase()))

  const moveAssignment = async (assignment: Assignment, newStatus: Column) => {
    if (!user) return
    try {
      await updateDoc(doc(db, 'users', user.uid, 'assignments', assignment.id), {
        status: newStatus,
      })
      setAssignments((prev) =>
        prev.map((a) => (a.id === assignment.id ? { ...a, status: newStatus } : a))
      )
    } catch (err) {
      Alert.alert('Error', 'Could not update assignment status.')
    }
  }

  const getDueText = (a: Assignment) => {
    const d = a.dueDate && typeof a.dueDate === 'object' && 'seconds' in a.dueDate
      ? new Date((a.dueDate as any).seconds * 1000)
      : new Date(a.dueDate as any)
    const days = Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    if (days < 0) return 'Overdue'
    if (days === 0) return 'Due Today'
    if (days === 1) return 'Due Tomorrow'
    return `${days}d left`
  }

  const getDueColor = (a: Assignment) => {
    const d = a.dueDate && typeof a.dueDate === 'object' && 'seconds' in a.dueDate
      ? new Date((a.dueDate as any).seconds * 1000)
      : new Date(a.dueDate as any)
    const days = Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    if (days <= 0) return colors.danger
    if (days <= 2) return colors.warning
    return colors.textMuted
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText variant="title" style={{ fontSize: 28 }}>
            Assignments
          </ThemedText>
          <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.brand }]}>
            <Plus size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Search size={18} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search assignments..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Column tabs */}
        <View style={styles.tabs}>
          {(['todo', 'in_progress', 'done'] as Column[]).map((col) => {
            const count = assignments.filter((a) => a.status === col).length
            const config = COLUMN_CONFIG[col]
            return (
              <TouchableOpacity
                key={col}
                style={[
                  styles.tab,
                  activeColumn === col && { backgroundColor: `${config.color}20`, borderColor: config.color },
                  activeColumn !== col && { borderColor: colors.border },
                ]}
                onPress={() => setActiveColumn(col)}
              >
                {config.icon}
                <ThemedText
                  variant="caption"
                  weight="semibold"
                  style={{ color: activeColumn === col ? config.color : colors.textSecondary }}
                >
                  {config.label} ({count})
                </ThemedText>
              </TouchableOpacity>
            )
          })}
        </View>

        {/* Cards */}
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.cardList}>
          {filteredAssignments.length === 0 ? (
            <View style={styles.emptyState}>
              <ClipboardList size={40} color={colors.textMuted} />
              <ThemedText variant="body" color="muted" style={{ marginTop: 12, textAlign: 'center' }}>
                No assignments in {COLUMN_CONFIG[activeColumn].label}
              </ThemedText>
            </View>
          ) : (
            filteredAssignments.map((a) => {
              const subj = profile?.subjects?.find((s) => s.id === a.subjectId)
              return (
                <View
                  key={a.id}
                  style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  <View style={styles.cardTop}>
                    {subj && (
                      <View style={[styles.subjectTag, { backgroundColor: `${subj.color}20` }]}>
                        <View style={[styles.tagDot, { backgroundColor: subj.color }]} />
                        <ThemedText variant="caption" style={{ color: subj.color }}>
                          {subj.courseCode || subj.name}
                        </ThemedText>
                      </View>
                    )}
                    <View style={[styles.complexityBadge, {
                      backgroundColor: a.complexity === 'high' ? `${colors.danger}20`
                        : a.complexity === 'medium' ? `${colors.warning}20`
                        : `${colors.success}20`
                    }]}>
                      <ThemedText variant="caption" style={{
                        color: a.complexity === 'high' ? colors.danger
                          : a.complexity === 'medium' ? colors.warning
                          : colors.success,
                        fontWeight: '600',
                      }}>
                        {a.complexity}
                      </ThemedText>
                    </View>
                  </View>

                  <ThemedText variant="body" weight="semibold" style={{ marginVertical: 8 }}>
                    {a.title}
                  </ThemedText>

                  {a.description && (
                    <ThemedText variant="caption" color="secondary" numberOfLines={2}>
                      {a.description}
                    </ThemedText>
                  )}

                  <View style={styles.cardBottom}>
                    <ThemedText variant="caption" style={{ color: getDueColor(a), fontWeight: '600' }}>
                      {getDueText(a)}
                    </ThemedText>

                    {activeColumn !== 'done' && (
                      <View style={styles.moveButtons}>
                        {activeColumn === 'todo' && (
                          <TouchableOpacity
                            style={[styles.moveBtn, { borderColor: colors.warning }]}
                            onPress={() => moveAssignment(a, 'in_progress')}
                          >
                            <ThemedText variant="caption" style={{ color: colors.warning }}>
                              Start →
                            </ThemedText>
                          </TouchableOpacity>
                        )}
                        {activeColumn === 'in_progress' && (
                          <TouchableOpacity
                            style={[styles.moveBtn, { borderColor: colors.success }]}
                            onPress={() => moveAssignment(a, 'done')}
                          >
                            <ThemedText variant="caption" style={{ color: colors.success }}>
                              Done ✓
                            </ThemedText>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                  </View>
                </View>
              )
            })
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  searchInput: { flex: 1, fontSize: 14 },
  tabs: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  cardList: { paddingHorizontal: Spacing.lg, paddingBottom: 40 },
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subjectTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  tagDot: { width: 6, height: 6, borderRadius: 3 },
  complexityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  moveButtons: { flexDirection: 'row', gap: 8 },
  moveBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
})
