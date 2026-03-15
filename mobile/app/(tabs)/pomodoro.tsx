import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Animated,
  Vibration,
  Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { useAuth } from '@/lib/AuthContext'
import { useTheme } from '@/lib/useTheme'
import { Colors, Spacing, BorderRadius } from '@/constants/theme'
import { POMODORO_PRESETS } from '@shared/constants'
import { calculateFocusScore } from '@shared/utils/focusScore'
import { Play, Pause, RotateCcw, Coffee, Brain } from 'lucide-react-native'
import Svg, { Circle as SvgCircle } from 'react-native-svg'

const { width } = Dimensions.get('window')
const RING_SIZE = width * 0.65
const STROKE_WIDTH = 8
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

type TimerPhase = 'work' | 'break'
type PresetKey = 'short' | 'long'

export default function PomodoroScreen() {
  const { user, profile } = useAuth()
  const { colors } = useTheme()
  const [preset, setPreset] = useState<PresetKey>('short')
  const [phase, setPhase] = useState<TimerPhase>('work')
  const [isRunning, setIsRunning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(POMODORO_PRESETS.short.work * 60)
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [pauseCount, setPauseCount] = useState(0)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const totalSeconds =
    phase === 'work'
      ? POMODORO_PRESETS[preset].work * 60
      : POMODORO_PRESETS[preset].break * 60

  const progress = timeLeft / totalSeconds
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress)

  const ringColor =
    progress > 0.5
      ? Colors.dark.success
      : progress > 0.2
      ? Colors.dark.warning
      : Colors.dark.danger

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => t - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      // Timer complete
      setIsRunning(false)
      if (Platform.OS !== 'web') {
        Vibration.vibrate([0, 500, 200, 500])
      }
      if (phase === 'work') {
        // Auto switch to break
        setPhase('break')
        setTimeLeft(POMODORO_PRESETS[preset].break * 60)
      } else {
        setPhase('work')
        setTimeLeft(POMODORO_PRESETS[preset].work * 60)
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning, timeLeft])

  const toggleTimer = () => {
    if (isRunning) {
      setPauseCount((c) => c + 1)
    }
    setIsRunning(!isRunning)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setPhase('work')
    setTimeLeft(POMODORO_PRESETS[preset].work * 60)
    setPauseCount(0)
  }

  const switchPreset = (key: PresetKey) => {
    if (isRunning) return
    setPreset(key)
    setPhase('work')
    setTimeLeft(POMODORO_PRESETS[key].work * 60)
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <ThemedText variant="title" style={{ fontSize: 28 }}>
              Pomodoro
            </ThemedText>
            <View style={[styles.phaseBadge, {
              backgroundColor: phase === 'work' ? Colors.dark.brandDim : `${Colors.dark.success}20`,
            }]}>
              {phase === 'work' ? <Brain size={14} color={colors.brand} /> : <Coffee size={14} color={colors.success} />}
              <ThemedText variant="caption" weight="semibold" style={{
                color: phase === 'work' ? colors.brand : colors.success,
              }}>
                {phase === 'work' ? 'Focus' : 'Break'}
              </ThemedText>
            </View>
          </View>

          {/* Preset selector */}
          <View style={styles.presetRow}>
            {(['short', 'long'] as PresetKey[]).map((key) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.presetBtn,
                  {
                    backgroundColor: preset === key ? colors.brand : colors.surface,
                    borderColor: preset === key ? colors.brand : colors.border,
                  },
                ]}
                onPress={() => switchPreset(key)}
                disabled={isRunning}
              >
                <ThemedText
                  variant="caption"
                  weight="semibold"
                  style={{ color: preset === key ? '#fff' : colors.textSecondary }}
                >
                  {POMODORO_PRESETS[key].work}/{POMODORO_PRESETS[key].break} min
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>

          {/* Subject picker */}
          {profile?.subjects && profile.subjects.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.subjectRow}
            >
              {profile.subjects.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  style={[
                    styles.subjectChip,
                    {
                      backgroundColor: selectedSubject === s.id ? `${s.color}30` : colors.surface,
                      borderColor: selectedSubject === s.id ? s.color : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedSubject(selectedSubject === s.id ? null : s.id)}
                >
                  <View style={[styles.chipDot, { backgroundColor: s.color }]} />
                  <ThemedText
                    variant="caption"
                    style={{ color: selectedSubject === s.id ? s.color : colors.textSecondary }}
                  >
                    {s.name}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Timer Ring */}
          <View style={styles.timerContainer}>
            <Svg width={RING_SIZE} height={RING_SIZE}>
              {/* Background ring */}
              <SvgCircle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RADIUS}
                strokeWidth={STROKE_WIDTH}
                stroke={colors.surfaceRaised}
                fill="transparent"
              />
              {/* Progress ring */}
              <SvgCircle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RADIUS}
                strokeWidth={STROKE_WIDTH}
                stroke={ringColor}
                fill="transparent"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                rotation="-90"
                origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
              />
            </Svg>

            {/* Time display */}
            <View style={styles.timerLabel}>
              <ThemedText style={styles.timeText}>
                {formatTime(timeLeft)}
              </ThemedText>
              <ThemedText variant="caption" color="muted">
                {phase === 'work' ? 'Focus Time' : 'Break Time'}
              </ThemedText>
            </View>
          </View>

          {/* Controls */}
          <View style={styles.controls}>
            <TouchableOpacity
              style={[styles.controlBtn, styles.secondaryBtn, { borderColor: colors.border }]}
              onPress={resetTimer}
            >
              <RotateCcw size={22} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlBtn, styles.primaryBtn, { backgroundColor: colors.brand }]}
              onPress={toggleTimer}
            >
              {isRunning ? (
                <Pause size={28} color="#fff" />
              ) : (
                <Play size={28} color="#fff" style={{ marginLeft: 3 }} />
              )}
            </TouchableOpacity>

            <View style={[styles.controlBtn, styles.secondaryBtn, { borderColor: 'transparent' }]}>
              <ThemedText variant="caption" color="muted">
                Pauses: {pauseCount}
              </ThemedText>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 40,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  phaseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  presetRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  presetBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  subjectRow: {
    gap: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
  subjectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  chipDot: { width: 8, height: 8, borderRadius: 4 },
  timerContainer: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing['2xl'],
  },
  timerLabel: {
    position: 'absolute',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 56,
    fontWeight: '200',
    letterSpacing: 2,
    color: '#fff',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing['2xl'],
  },
  controlBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    shadowColor: Colors.dark.brand,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  secondaryBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
  },
})
