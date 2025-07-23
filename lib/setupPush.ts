import { getToken } from 'firebase/messaging'
import { messaging } from './firebase'
import { supabase } from './supabaseClient'

export async function setupPushNotifications(userId: string) {
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return

  const token = await getToken(messaging, {
    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY!,
  })

  if (token) {
    await supabase.from('push_tokens').upsert({ user_id: userId, token })
  }
}
