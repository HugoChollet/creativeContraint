import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'


const supabaseUrl="https://mfybymgjrcsjirqzdxvc.supabase.co"
const supabasePublishableKey="sb_publishable_H1BNbLxw0WFg0EkWfM7mZw_pUMNADjV"
        

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})