import { Session } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { supabase } from '../lib/supabase'

export default function     Account({ session }: { session: Session }) {
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')
  const [website, setWebsite] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const { t } = useTranslation();

  useEffect(() => {
    if (session) getProfile()
  }, [session])

  async function getProfile() {
    try {
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')

      const { data, error, status } = await supabase
        .from('profiles')
        .select(`username, website, avatar_url`)
        .eq('id', session?.user.id)
        .single()
      if (error && status !== 406) {
        throw error
      }

      if (data) {
        setUsername(data.username)
        setWebsite(data.website)
        setAvatarUrl(data.avatar_url)
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  async function updateProfile({
    username,
    website,
    avatar_url,
  }: {
    username: string
    website: string
    avatar_url: string
  }) {
    try {
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')

      const updates = {
        id: session?.user.id,
        username,
        website,
        avatar_url,
        updated_at: new Date(),
      }

      const { error } = await supabase.from('profiles').upsert(updates)

      if (error) {
        throw error
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

return (
  <View style={styles.container}>
    <Text style={styles.label}>{t('common:account.email_read_only')}</Text>
    <View style={styles.verticallySpaced}>
      <TextInput 
        value={session?.user?.email} 
        editable={false} 
        style={[styles.input, { opacity: 0.5 }]} 
      />
    </View>

    <Text style={styles.label}>{t('common:account.username')}</Text>
    <View style={styles.verticallySpaced}>
      <TextInput 
        value={username || ''} 
        onChangeText={setUsername} 
        placeholder={t('common:account.username_placeholder')}
        placeholderTextColor="#666"
        style={styles.input}
      />
    </View>

    <Text style={styles.label}>{t('common:account.portfolio')}</Text>
    <View style={styles.verticallySpaced}>
      <TextInput 
        value={website || ''} 
        onChangeText={setWebsite} 
        placeholder="https://..."
        placeholderTextColor="#666"
        style={styles.input}
      />
    </View>

    <TouchableOpacity
      style={styles.button}
      onPress={() => updateProfile({ username, website, avatar_url: avatarUrl })}
      disabled={loading}
    >
      <Text style={styles.buttonText}>{loading ? t('common:account.sign_out') : t('common:account.update_profile')}</Text>
    </TouchableOpacity>

    <TouchableOpacity 
      style={styles.signOutButton} 
      onPress={() => supabase.auth.signOut()}
    >
      <Text style={styles.signOutText}>{t('common:account.sign_out')}</Text>
    </TouchableOpacity>
  </View>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Dark background for artists
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  label: {
    color: '#999',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  verticallySpaced: {
    marginBottom: 20,
    alignSelf: 'stretch',
  },
  input: {
    backgroundColor: '#1e1e1e',
    color: '#fff',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  button: {
    backgroundColor: '#fff', // High contrast for primary action
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
  signOutButton: {
    marginTop: 15,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ff4444',
    borderRadius: 10,
  },
  signOutText: {
    color: '#ff4444',
    fontSize: 16,
    fontWeight: '600',
  },
  mt20: {
    marginTop: 20,
  },
});