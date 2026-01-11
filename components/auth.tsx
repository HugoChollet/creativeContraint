import React, { useState } from 'react'
import { Alert, AppState, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { supabase } from '../lib/supabase'

// Tells Supabase Auth to continuously refresh the session automatically if
// the app is in the foreground. When this is added, you will continue to receive
// `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_OUT` event
// if the user's session is terminated. This should only be registered once.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh()
  } else {
    supabase.auth.stopAutoRefresh()
  }
})

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function signInWithEmail() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (error) Alert.alert(error.message)
    setLoading(false)
  }

  async function signUpWithEmail() {
    setLoading(true)
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    })

    if (error) Alert.alert(error.message)
    if (!session) Alert.alert('Please check your inbox for email verification!')
    setLoading(false)
  }

  return (
   <View style={styles.container}>
    <Text style={styles.header}>Creative Mindset</Text>
    
    <View style={styles.verticallySpaced}>
        <Text style={styles.label}>Email</Text>
        <TextInput
        style={styles.input}
        onChangeText={(text) => setEmail(text)}
        value={email}
        placeholder="email@address.com"
        placeholderTextColor="#666"
        autoCapitalize={'none'}
        />
    </View>

    <View style={styles.verticallySpaced}>
        <Text style={styles.label}>Password</Text>
        <TextInput
        style={styles.input}
        onChangeText={(text) => setPassword(text)}
        value={password}
        secureTextEntry={true}
        placeholder="Password"
        placeholderTextColor="#666"
        autoCapitalize={'none'}
        />
    </View>

    <TouchableOpacity 
        style={[styles.button, styles.btnSignIn, loading && { opacity: 0.7 }]} 
        disabled={loading} 
        onPress={() => signInWithEmail()}
    >
        <Text style={styles.btnTextSignIn}>Sign In</Text>
    </TouchableOpacity>

    <TouchableOpacity 
        style={[styles.button, styles.btnSignUp]} 
        disabled={loading} 
        onPress={() => signUpWithEmail()}
    >
        <Text style={styles.btnTextSignUp}>Create Account</Text>
    </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // Pitch black for maximum contrast
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 40,
    textAlign: 'center',
    letterSpacing: -1,
  },
  label: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  verticallySpaced: {
    marginBottom: 16,
    alignSelf: 'stretch',
  },
  input: {
    backgroundColor: '#1A1A1A',
    color: '#fff',
    height: 56,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  button: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  btnSignIn: {
    backgroundColor: '#fff', // Solid white button
  },
  btnTextSignIn: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
  btnSignUp: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#444',
  },
  btnTextSignUp: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});