import React, { useEffect } from 'react'
import { Stack, useRouter, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AuthProvider, useAuth } from '@/lib/AuthContext'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { Colors } from '@/constants/theme'
import { ThemedText } from '@/components/ThemedText'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, retry: 1 },
  },
})

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading, needsOnboarding } = useAuth()
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    const inAuthGroup = segments[0] === '(auth)'
    const inTabs = segments[0] === '(tabs)'

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login')
    } else if (isAuthenticated && needsOnboarding && segments[1] !== 'onboarding') {
      router.replace('/(auth)/onboarding')
    } else if (isAuthenticated && !needsOnboarding && inAuthGroup) {
      router.replace('/(tabs)')
    }
  }, [isAuthenticated, loading, needsOnboarding, segments])

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.dark.brand} />
        <ThemedText variant="body" color="muted" style={{ marginTop: 16 }}>
          Loading ScholarSync…
        </ThemedText>
      </View>
    )
  }

  return <>{children}</>
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <AuthProvider>
          <AuthGuard>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="exams" options={{ headerShown: true, title: 'Exams', headerStyle: { backgroundColor: Colors.dark.background }, headerTintColor: Colors.dark.text }} />
              <Stack.Screen name="goals" options={{ headerShown: true, title: 'Goals', headerStyle: { backgroundColor: Colors.dark.background }, headerTintColor: Colors.dark.text }} />
              <Stack.Screen name="gpa" options={{ headerShown: true, title: 'GPA Predictor', headerStyle: { backgroundColor: Colors.dark.background }, headerTintColor: Colors.dark.text }} />
              <Stack.Screen name="ai-coach" options={{ headerShown: true, title: 'AI Coach', headerStyle: { backgroundColor: Colors.dark.background }, headerTintColor: Colors.dark.text }} />
              <Stack.Screen name="settings" options={{ headerShown: true, title: 'Settings', headerStyle: { backgroundColor: Colors.dark.background }, headerTintColor: Colors.dark.text }} />
            </Stack>
          </AuthGuard>
          <StatusBar style="light" />
        </AuthProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dark.background,
  },
})
