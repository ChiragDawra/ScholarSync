import React, { useState } from 'react'
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { useAuth } from '@/lib/AuthContext'
import { useTheme } from '@/lib/useTheme'
import { Colors, Spacing, BorderRadius } from '@/constants/theme'
import {
  User,
  Bell,
  Palette,
  GraduationCap,
  Clock,
  Shield,
  LogOut,
  ChevronRight,
  Moon,
  Sun,
} from 'lucide-react-native'

export default function SettingsScreen() {
  const { user, profile, signOut } = useAuth()
  const { colors, mode } = useTheme()

  const [notifStreak, setNotifStreak] = useState(true)
  const [notifExam, setNotifExam] = useState(true)
  const [notifAssignment, setNotifAssignment] = useState(true)
  const [notifWeekly, setNotifWeekly] = useState(true)

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ])
  }

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action is permanent and cannot be undone. All your data will be deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => Alert.alert('Contact support@scholarsync.app to delete your account.') },
      ]
    )
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Section */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <User size={18} color={colors.brand} />
            <ThemedText variant="heading">Profile</ThemedText>
          </View>

          <View style={styles.profileRow}>
            <View style={[styles.avatar, { backgroundColor: colors.brandDim }]}>
              <GraduationCap size={24} color={colors.brand} />
            </View>
            <View>
              <ThemedText variant="body" weight="semibold">
                {profile?.name || user?.displayName || 'Student'}
              </ThemedText>
              <ThemedText variant="caption" color="secondary">
                {user?.email}
              </ThemedText>
              {profile?.college && (
                <ThemedText variant="caption" color="muted">
                  {profile.college}
                </ThemedText>
              )}
            </View>
          </View>

          <SettingRow
            icon={<GraduationCap size={16} color={colors.textSecondary} />}
            label="Grading System"
            value={profile?.gradingSystem === 'cgpa' ? '10-Point CGPA' : 'Percentage'}
            colors={colors}
          />
          <SettingRow
            icon={<Clock size={16} color={colors.textSecondary} />}
            label="Streak Cutoff"
            value={profile?.streakCutoffTime || '23:00'}
            colors={colors}
          />
        </View>

        {/* Subjects */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <Palette size={18} color={colors.brand} />
            <ThemedText variant="heading">Subjects</ThemedText>
          </View>
          <View style={styles.chipContainer}>
            {(profile?.subjects || []).map((s) => (
              <View key={s.id} style={[styles.chip, { backgroundColor: `${s.color}20` }]}>
                <View style={[styles.chipDot, { backgroundColor: s.color }]} />
                <ThemedText variant="caption" style={{ color: s.color }}>
                  {s.name}
                </ThemedText>
              </View>
            ))}
            {(!profile?.subjects || profile.subjects.length === 0) && (
              <ThemedText variant="caption" color="muted">
                No subjects added
              </ThemedText>
            )}
          </View>
        </View>

        {/* Notifications */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <Bell size={18} color={colors.brand} />
            <ThemedText variant="heading">Notifications</ThemedText>
          </View>

          <NotifToggle label="Streak Warnings" value={notifStreak} onToggle={setNotifStreak} colors={colors} />
          <NotifToggle label="Exam Alerts" value={notifExam} onToggle={setNotifExam} colors={colors} />
          <NotifToggle label="Assignment Reminders" value={notifAssignment} onToggle={setNotifAssignment} colors={colors} />
          <NotifToggle label="Weekly Summary" value={notifWeekly} onToggle={setNotifWeekly} colors={colors} />
        </View>

        {/* Appearance */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            {mode === 'dark' ? <Moon size={18} color={colors.brand} /> : <Sun size={18} color={colors.brand} />}
            <ThemedText variant="heading">Appearance</ThemedText>
          </View>
          <ThemedText variant="body" color="secondary" style={{ paddingVertical: 8 }}>
            Theme follows your device settings. Change in your phone's Settings → Display.
          </ThemedText>
        </View>

        {/* Account */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <Shield size={18} color={colors.brand} />
            <ThemedText variant="heading">Account</ThemedText>
          </View>

          <TouchableOpacity style={styles.accountBtn} onPress={handleSignOut}>
            <LogOut size={18} color={colors.text} />
            <ThemedText variant="body">Sign Out</ThemedText>
            <ChevronRight size={16} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.accountBtn} onPress={handleDeleteAccount}>
            <Shield size={18} color={colors.danger} />
            <ThemedText variant="body" style={{ color: colors.danger, flex: 1 }}>
              Delete Account
            </ThemedText>
            <ChevronRight size={16} color={colors.danger} />
          </TouchableOpacity>
        </View>

        <ThemedText variant="caption" color="muted" style={styles.footer}>
          ScholarSync v1.0.0 · Made with ❤️ for students
        </ThemedText>
      </ScrollView>
    </ThemedView>
  )
}

function SettingRow({ icon, label, value, colors }: any) {
  return (
    <View style={[settingStyles.row, { borderColor: colors.borderLight }]}>
      {icon}
      <ThemedText variant="body" color="secondary" style={{ flex: 1 }}>
        {label}
      </ThemedText>
      <ThemedText variant="body" weight="medium">
        {value}
      </ThemedText>
    </View>
  )
}

function NotifToggle({ label, value, onToggle, colors }: any) {
  return (
    <View style={[settingStyles.row, { borderColor: colors.borderLight }]}>
      <ThemedText variant="body" style={{ flex: 1 }}>
        {label}
      </ThemedText>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.surfaceRaised, true: `${colors.brand}80` }}
        thumbColor={value ? colors.brand : colors.textMuted}
      />
    </View>
  )
}

const settingStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
})

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: Spacing.lg, paddingBottom: 40 },
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
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
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
  chipDot: { width: 8, height: 8, borderRadius: 4 },
  accountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
  },
  footer: {
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
})
