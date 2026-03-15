import React from 'react'
import {
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { useTheme } from '@/lib/useTheme'
import { useAuth } from '@/lib/AuthContext'
import { Colors, Spacing, BorderRadius } from '@/constants/theme'
import {
  BookOpen,
  Target,
  Calculator,
  Sparkles,
  Settings,
  LogOut,
  ChevronRight,
  User,
  Flame,
} from 'lucide-react-native'

const MENU_ITEMS = [
  {
    label: 'Exams',
    icon: BookOpen,
    route: '/exams',
    color: Colors.dark.info,
    description: 'Track upcoming exams & countdowns',
  },
  {
    label: 'Goals',
    icon: Target,
    route: '/goals',
    color: Colors.dark.success,
    description: 'Set weekly & monthly goals',
  },
  {
    label: 'GPA Predictor',
    icon: Calculator,
    route: '/gpa',
    color: Colors.dark.warning,
    description: 'Calculate required scores',
  },
  {
    label: 'AI Study Coach',
    icon: Sparkles,
    route: '/ai-coach',
    color: Colors.dark.brand,
    description: 'Get personalized study advice',
  },
  {
    label: 'Settings',
    icon: Settings,
    route: '/settings',
    color: Colors.dark.textSecondary,
    description: 'Preferences & account',
  },
] as const

export default function MoreScreen() {
  const { colors } = useTheme()
  const { user, profile, signOut, isAuthenticated } = useAuth()
  const router = useRouter()

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ThemedText variant="title" style={styles.header}>
            More
          </ThemedText>

          {/* Profile card */}
          {isAuthenticated && (
            <View style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.avatar, { backgroundColor: colors.brandDim }]}>
                <User size={28} color={colors.brand} />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText variant="body" weight="semibold">
                  {profile?.name || user?.displayName || 'Student'}
                </ThemedText>
                <ThemedText variant="caption" color="secondary">
                  {profile?.college || user?.email || ''}
                </ThemedText>
              </View>
              <View style={[styles.streakMini, { backgroundColor: `${colors.warning}20` }]}>
                <Flame size={14} color={colors.warning} />
              </View>
            </View>
          )}

          {/* Menu items */}
          <View style={[styles.menuSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {MENU_ITEMS.map((item, i) => {
              const Icon = item.icon
              return (
                <TouchableOpacity
                  key={item.route}
                  style={[
                    styles.menuItem,
                    i < MENU_ITEMS.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.borderLight },
                  ]}
                  onPress={() => router.push(item.route as any)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.menuIcon, { backgroundColor: `${item.color}20` }]}>
                    <Icon size={20} color={item.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <ThemedText variant="body" weight="medium">
                      {item.label}
                    </ThemedText>
                    <ThemedText variant="caption" color="muted">
                      {item.description}
                    </ThemedText>
                  </View>
                  <ChevronRight size={18} color={colors.textMuted} />
                </TouchableOpacity>
              )
            })}
          </View>

          {/* Sign out */}
          <TouchableOpacity
            style={[styles.signOutBtn, { borderColor: colors.danger }]}
            onPress={signOut}
          >
            <LogOut size={18} color={colors.danger} />
            <ThemedText variant="body" style={{ color: colors.danger }}>
              Sign Out
            </ThemedText>
          </TouchableOpacity>

          <ThemedText variant="caption" color="muted" style={styles.version}>
            ScholarSync v1.0.0
          </ThemedText>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingBottom: 40 },
  header: {
    fontSize: 28,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing['2xl'],
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakMini: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuSection: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: Spacing['2xl'],
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  version: {
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
})
