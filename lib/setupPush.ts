import { getToken } from 'firebase/messaging'
import { firebaseApp } from './firebase'
import { supabase } from './supabaseClient'

export async function setupPushNotifications(userId: string) {
  if (typeof window === 'undefined' || !('Notification' in window)) return

  try {
    const { getMessaging } = await import('firebase/messaging')
    const messaging = getMessaging(firebaseApp)

    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return

    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY!,
    })

    if (token) {
      await supabase.from('push_tokens').upsert({ user_id: userId, token })
    }
  } catch (err) {
    console.error('❌ Error al inicializar notificaciones push:', err)
  }
}
