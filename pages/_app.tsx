import 'bootstrap/dist/css/bootstrap.min.css'
import '@/styles/globals.css'
import '@/lib/fontawesome'
import type { AppProps } from 'next/app'
import BottomNav from '@/components/BottomNav'
import { Toaster } from 'react-hot-toast'
import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebaseClient'
import SplashScreen from '@/components/SplashScreen'

export default function App({ Component, pageProps }: AppProps) {
  const [isClient, setIsClient] = useState(false)
  const [appReady, setAppReady] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, () => {
      setAppReady(true)
    })

    return () => unsubscribe()
  }, [])

  if (!appReady) {
    return <SplashScreen />
  }

  return (
    <>
      <div className="mt-5 pt-2"></div>
      <Component {...pageProps} />
      <BottomNav />
      {isClient && <Toaster position="top-center" reverseOrder={false} />}
    </>
  )
}
