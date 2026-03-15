import React from 'react'
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ThemedText } from '@/components/ThemedText'
import { useAuth } from '@/lib/AuthContext'
import { Colors, Spacing, BorderRadius } from '@/constants/theme'
import { GraduationCap, Sparkles, Flame, BarChart3 } from 'lucide-react-native'

const { width } = Dimensions.get('window')

export default function LoginScreen() {
  const { signInWithGoogle } = useAuth()

  const handleSignIn = async () => {
    try {
      await signInWithGoogle()
    } catch (err) {
      Alert.alert('Sign In Failed', 'Please try again later.')
    }
  }

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <View style={styles.gradientBg}>
        <View style={[styles.orb, styles.orb1]} />
        <View style={[styles.orb, styles.orb2]} />
        <View style={[styles.orb, styles.orb3]} />
      </View>

      <SafeAreaView style={styles.safeArea}>
        {/* Logo area */}
        <View style={styles.logoArea}>
          <View style={styles.logoIcon}>
            <GraduationCap size={40} color="#fff" />
          </View>
          <ThemedText variant="title" style={styles.appName}>
            ScholarSync
          </ThemedText>
          <ThemedText variant="body" color="secondary" style={styles.tagline}>
            Your Academic Operating System
          </ThemedText>
        </View>

        {/* Features */}
        <View style={styles.features}>
          {[
            { icon: <Flame size={20} color={Colors.dark.warning} />, label: 'Study Streaks' },
            { icon: <BarChart3 size={20} color={Colors.dark.info} />, label: 'GPA Analytics' },
            { icon: <Sparkles size={20} color={Colors.dark.brand} />, label: 'AI Study Coach' },
          ].map((feat, i) => (
            <View key={i} style={styles.featureItem}>
              <View style={styles.featureIcon}>{feat.icon}</View>
              <ThemedText variant="caption" color="secondary">
                {feat.label}
              </ThemedText>
            </View>
          ))}
        </View>

        {/* Sign in button */}
        <View style={styles.bottomArea}>
          <TouchableOpacity
            style={styles.googleBtn}
            onPress={handleSignIn}
            activeOpacity={0.85}
          >
            <ThemedText variant="body" weight="semibold" style={{ color: '#fff' }}>
              🔑  Sign in with Google
            </ThemedText>
          </TouchableOpacity>

          <ThemedText variant="caption" color="muted" style={styles.disclaimer}>
            By signing in, you agree to our Terms of Service and Privacy Policy
          </ThemedText>
        </View>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  gradientBg: {
    ...StyleSheet.absoluteFillObject,
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.15,
  },
  orb1: {
    width: 300,
    height: 300,
    backgroundColor: '#8B5CF6',
    top: -80,
    right: -60,
  },
  orb2: {
    width: 200,
    height: 200,
    backgroundColor: '#6366F1',
    bottom: 200,
    left: -60,
  },
  orb3: {
    width: 160,
    height: 160,
    backgroundColor: '#EC4899',
    bottom: 60,
    right: -40,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: Spacing['2xl'],
  },
  logoArea: {
    alignItems: 'center',
    marginTop: 80,
  },
  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: Colors.dark.brand,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    shadowColor: Colors.dark.brand,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
  },
  appName: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -1,
    marginBottom: Spacing.sm,
  },
  tagline: {
    textAlign: 'center',
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing['3xl'],
  },
  featureItem: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomArea: {
    paddingBottom: Spacing['3xl'],
    gap: Spacing.lg,
  },
  googleBtn: {
    backgroundColor: Colors.dark.brand,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    shadowColor: Colors.dark.brand,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  disclaimer: {
    textAlign: 'center',
    lineHeight: 16,
  },
})
