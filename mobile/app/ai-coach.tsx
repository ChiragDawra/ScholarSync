import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { useAuth } from '@/lib/AuthContext'
import { useTheme } from '@/lib/useTheme'
import { Colors, Spacing, BorderRadius } from '@/constants/theme'
import { collection, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from '@shared/api/firebase'
import type { Session, Exam, Assignment, Goal, Streak } from '@shared/types'
import { getDefaultStreak } from '@shared/utils/streakUtils'
import {
  generateWeeklyPlan,
  analyzeFocusAreas,
  generateMotivation,
  type EngineContext,
} from '@shared/utils/studyEngine'
import { Send, Sparkles, Bot, User } from 'lucide-react-native'

interface ChatMsg {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const QUICK_ACTIONS = [
  { label: '📅 Weekly Plan', prompt: 'Generate my weekly study plan' },
  { label: '🎯 Focus Areas', prompt: 'Analyze my focus areas' },
  { label: '💪 Motivate Me', prompt: 'Give me some motivation' },
]

export default function AiCoachScreen() {
  const { user, profile } = useAuth()
  const { colors } = useTheme()
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<ScrollView>(null)

  // Context data
  const [ctx, setCtx] = useState<EngineContext | null>(null)

  useEffect(() => {
    if (!user) return
    const loadCtx = async () => {
      const [sessSnap, examSnap, assignSnap, goalSnap, streakDoc] = await Promise.all([
        getDocs(collection(db, 'users', user.uid, 'sessions')),
        getDocs(collection(db, 'users', user.uid, 'exams')),
        getDocs(collection(db, 'users', user.uid, 'assignments')),
        getDocs(collection(db, 'users', user.uid, 'goals')),
        getDoc(doc(db, 'users', user.uid, 'profile', 'streak')),
      ])

      setCtx({
        subjects: profile?.subjects || [],
        sessions: sessSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Session)),
        exams: examSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Exam)),
        assignments: assignSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Assignment)),
        goals: goalSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Goal)),
        streak: streakDoc.exists() ? (streakDoc.data() as Streak) : getDefaultStreak(),
        userName: profile?.name || user.displayName || 'Student',
      })

      // Welcome message
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: `Hey ${profile?.name || 'there'}! 👋 I'm your AI Study Coach. Ask me anything about your study plan, or tap a quick action below to get started!`,
      }])
    }
    loadCtx()
  }, [user, profile])

  const sendMessage = async (text: string) => {
    if (!text.trim() || !ctx) return
    const userMsg: ChatMsg = {
      id: `u_${Date.now()}`,
      role: 'user',
      content: text.trim(),
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    // Use local study engine
    setTimeout(() => {
      let response
      const lower = text.toLowerCase()
      if (lower.includes('weekly') || lower.includes('plan') || lower.includes('schedule')) {
        response = generateWeeklyPlan(ctx)
      } else if (lower.includes('focus') || lower.includes('area') || lower.includes('weak')) {
        response = analyzeFocusAreas(ctx)
      } else {
        response = generateMotivation(ctx)
      }

      const aiText = [
        response.text,
        ...(response.insights || []).map((i) => `\n${i.icon} **${i.title}**\n${i.body}`),
      ].join('\n')

      const aiMsg: ChatMsg = {
        id: `a_${Date.now()}`,
        role: 'assistant',
        content: aiText,
      }
      setMessages((prev) => [...prev, aiMsg])
      setLoading(false)
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100)
    }, 800)
  }

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={100}
      >
        {/* Beta badge */}
        <View style={[styles.betaBanner, { backgroundColor: colors.brandDim }]}>
          <Sparkles size={14} color={colors.brand} />
          <ThemedText variant="caption" color="brand" weight="semibold">
            AI Coach — Beta
          </ThemedText>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={styles.messages}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.bubble,
                msg.role === 'user' ? styles.userBubble : styles.aiBubble,
                {
                  backgroundColor:
                    msg.role === 'user' ? colors.brand : colors.surface,
                  borderColor: msg.role === 'user' ? colors.brand : colors.border,
                },
              ]}
            >
              <View style={styles.bubbleHeader}>
                {msg.role === 'assistant' ? (
                  <Bot size={14} color={colors.brand} />
                ) : (
                  <User size={14} color="#fff" />
                )}
              </View>
              <ThemedText
                variant="body"
                style={{
                  color: msg.role === 'user' ? '#fff' : colors.text,
                  lineHeight: 22,
                }}
              >
                {msg.content}
              </ThemedText>
            </View>
          ))}
          {loading && (
            <View style={[styles.bubble, styles.aiBubble, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <ActivityIndicator size="small" color={colors.brand} />
              <ThemedText variant="caption" color="muted" style={{ marginLeft: 8 }}>
                Thinking...
              </ThemedText>
            </View>
          )}
        </ScrollView>

        {/* Quick actions */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickActions}
        >
          {QUICK_ACTIONS.map((a) => (
            <TouchableOpacity
              key={a.label}
              style={[styles.quickBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}
              onPress={() => sendMessage(a.prompt)}
              disabled={loading}
            >
              <ThemedText variant="caption" weight="medium">
                {a.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Input */}
        <View style={[styles.inputBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TextInput
            style={[styles.textInput, { color: colors.text }]}
            value={input}
            onChangeText={setInput}
            placeholder="Ask your study coach..."
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={500}
            onSubmitEditing={() => sendMessage(input)}
          />
          <TouchableOpacity
            style={[styles.sendBtn, { backgroundColor: colors.brand, opacity: input.trim() ? 1 : 0.5 }]}
            onPress={() => sendMessage(input)}
            disabled={!input.trim() || loading}
          >
            <Send size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Disclaimer */}
        <ThemedText variant="caption" color="muted" style={styles.disclaimer}>
          ScholarSync AI can make mistakes. Consider checking important info.
        </ThemedText>
      </KeyboardAvoidingView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  betaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  messages: { flex: 1 },
  messagesContent: { padding: Spacing.lg, paddingBottom: 8 },
  bubble: {
    maxWidth: '85%',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  userBubble: { alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  aiBubble: { alignSelf: 'flex-start', borderBottomLeftRadius: 4, flexDirection: 'row', flexWrap: 'wrap' },
  bubbleHeader: { marginBottom: 4 },
  quickActions: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  quickBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
    marginHorizontal: Spacing.lg,
    padding: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    maxHeight: 80,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disclaimer: {
    textAlign: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
})
