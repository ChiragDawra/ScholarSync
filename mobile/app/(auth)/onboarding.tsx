import React, { useState } from 'react'
import {
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { ThemedText } from '@/components/ThemedText'
import { useAuth } from '@/lib/AuthContext'
import { Colors, Spacing, BorderRadius } from '@/constants/theme'
import { DEFAULT_SUBJECT_COLORS } from '@shared/constants'
import { ChevronRight, ChevronLeft, X, Plus, Check } from 'lucide-react-native'

export default function OnboardingScreen() {
  const { user, saveProfile } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [name, setName] = useState(user?.displayName ?? '')
  const [college, setCollege] = useState('')
  const [subjects, setSubjects] = useState<{ id: string; name: string; color: string }[]>([])
  const [subjectInput, setSubjectInput] = useState('')
  const [gradingSystem, setGradingSystem] = useState<'cgpa' | 'percentage'>('cgpa')
  const [cutoffTime, setCutoffTime] = useState('23:00')
  const [saving, setSaving] = useState(false)

  const addSubject = () => {
    const trimmed = subjectInput.trim()
    if (!trimmed) return
    const color = DEFAULT_SUBJECT_COLORS[subjects.length % DEFAULT_SUBJECT_COLORS.length]
    setSubjects((prev) => [
      ...prev,
      { id: `subj_${Date.now()}`, name: trimmed, color },
    ])
    setSubjectInput('')
  }

  const removeSubject = (id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id))
  }

  const handleComplete = async () => {
    setSaving(true)
    try {
      await saveProfile({
        name: name.trim() || user?.displayName || 'Student',
        college: college.trim(),
        subjects,
        gradingSystem,
        streakCutoffTime: cutoffTime,
        onboardingComplete: true,
        fcmTokens: [],
      })
      router.replace('/(tabs)')
    } catch (err) {
      Alert.alert('Error', 'Could not save profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const steps = [
    {
      title: 'Welcome! 👋',
      subtitle: "Let's personalize your experience",
    },
    {
      title: 'Your Subjects 📚',
      subtitle: 'Add the courses you\'re taking',
    },
    {
      title: 'Preferences ⚙️',
      subtitle: 'Set up your study habits',
    },
  ]

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          {/* Progress indicator */}
          <View style={styles.progressBar}>
            {steps.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.progressDot,
                  {
                    backgroundColor: i <= step ? Colors.dark.brand : Colors.dark.surfaceRaised,
                    flex: i <= step ? 2 : 1,
                  },
                ]}
              />
            ))}
          </View>

          {/* Header */}
          <View style={styles.header}>
            <ThemedText variant="title">{steps[step].title}</ThemedText>
            <ThemedText variant="body" color="secondary">
              {steps[step].subtitle}
            </ThemedText>
          </View>

          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentInner}
            keyboardShouldPersistTaps="handled"
          >
            {/* Step 1: Name + College */}
            {step === 0 && (
              <>
                <View style={styles.inputGroup}>
                  <ThemedText variant="label" color="secondary" style={styles.label}>
                    Your Name
                  </ThemedText>
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter your name"
                    placeholderTextColor={Colors.dark.textMuted}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <ThemedText variant="label" color="secondary" style={styles.label}>
                    College / University
                  </ThemedText>
                  <TextInput
                    style={styles.input}
                    value={college}
                    onChangeText={setCollege}
                    placeholder="e.g. IIT Delhi"
                    placeholderTextColor={Colors.dark.textMuted}
                  />
                </View>
              </>
            )}

            {/* Step 2: Subjects */}
            {step === 1 && (
              <>
                <View style={styles.chipInputRow}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    value={subjectInput}
                    onChangeText={setSubjectInput}
                    placeholder="Type a subject and press Add"
                    placeholderTextColor={Colors.dark.textMuted}
                    onSubmitEditing={addSubject}
                    returnKeyType="done"
                  />
                  <TouchableOpacity style={styles.addBtn} onPress={addSubject}>
                    <Plus size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
                <View style={styles.chipContainer}>
                  {subjects.map((s) => (
                    <View key={s.id} style={[styles.chip, { backgroundColor: `${s.color}30` }]}>
                      <View style={[styles.chipDot, { backgroundColor: s.color }]} />
                      <ThemedText variant="caption" style={{ color: s.color }}>
                        {s.name}
                      </ThemedText>
                      <TouchableOpacity onPress={() => removeSubject(s.id)}>
                        <X size={14} color={s.color} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
                {subjects.length === 0 && (
                  <ThemedText variant="caption" color="muted" style={{ textAlign: 'center', marginTop: 20 }}>
                    Add at least one subject to get started
                  </ThemedText>
                )}
              </>
            )}

            {/* Step 3: Preferences */}
            {step === 2 && (
              <>
                <View style={styles.inputGroup}>
                  <ThemedText variant="label" color="secondary" style={styles.label}>
                    Grading System
                  </ThemedText>
                  <View style={styles.toggleRow}>
                    {(['cgpa', 'percentage'] as const).map((gs) => (
                      <TouchableOpacity
                        key={gs}
                        style={[
                          styles.toggleBtn,
                          gradingSystem === gs && styles.toggleBtnActive,
                        ]}
                        onPress={() => setGradingSystem(gs)}
                      >
                        <ThemedText
                          variant="body"
                          style={{
                            color: gradingSystem === gs ? '#fff' : Colors.dark.textSecondary,
                          }}
                        >
                          {gs === 'cgpa' ? '10-Point CGPA' : 'Percentage'}
                        </ThemedText>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                <View style={styles.inputGroup}>
                  <ThemedText variant="label" color="secondary" style={styles.label}>
                    Daily Streak Cutoff Time
                  </ThemedText>
                  <TextInput
                    style={styles.input}
                    value={cutoffTime}
                    onChangeText={setCutoffTime}
                    placeholder="HH:MM (e.g. 23:00)"
                    placeholderTextColor={Colors.dark.textMuted}
                    keyboardType="numbers-and-punctuation"
                  />
                  <ThemedText variant="caption" color="muted" style={{ marginTop: 4 }}>
                    Log a study session before this time to keep your streak alive
                  </ThemedText>
                </View>
              </>
            )}
          </ScrollView>

          {/* Navigation buttons */}
          <View style={styles.navRow}>
            {step > 0 ? (
              <TouchableOpacity style={styles.backBtn} onPress={() => setStep(step - 1)}>
                <ChevronLeft size={20} color={Colors.dark.textSecondary} />
                <ThemedText variant="body" color="secondary">
                  Back
                </ThemedText>
              </TouchableOpacity>
            ) : (
              <View />
            )}

            {step < 2 ? (
              <TouchableOpacity
                style={styles.nextBtn}
                onPress={() => setStep(step + 1)}
              >
                <ThemedText variant="body" weight="semibold" style={{ color: '#fff' }}>
                  Next
                </ThemedText>
                <ChevronRight size={20} color="#fff" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.nextBtn, { paddingHorizontal: 24 }]}
                onPress={handleComplete}
                disabled={saving}
              >
                <Check size={20} color="#fff" />
                <ThemedText variant="body" weight="semibold" style={{ color: '#fff' }}>
                  {saving ? 'Saving…' : 'Complete Setup'}
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background },
  safeArea: { flex: 1 },
  progressBar: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Spacing.lg,
  },
  progressDot: {
    height: 4,
    borderRadius: 2,
  },
  header: {
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Spacing['3xl'],
    gap: Spacing.sm,
  },
  content: { flex: 1 },
  contentInner: {
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Spacing['2xl'],
    paddingBottom: 40,
  },
  inputGroup: { marginBottom: Spacing['2xl'] },
  label: { marginBottom: Spacing.sm },
  input: {
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    color: Colors.dark.text,
    fontSize: 15,
  },
  chipInputRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  addBtn: {
    backgroundColor: Colors.dark.brand,
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  chipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    alignItems: 'center',
  },
  toggleBtnActive: {
    backgroundColor: Colors.dark.brand,
    borderColor: Colors.dark.brand,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: Spacing['2xl'],
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.dark.brand,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
})
