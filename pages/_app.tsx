import 'bootstrap/dist/css/bootstrap.min.css'
import '@/styles/globals.css'
import '@/lib/fontawesome'
import type { AppProps } from 'next/app'
import BottomNav from '@/components/layout/BottomNav'
import { Toaster } from 'react-hot-toast'
import { useEffect, useState } from 'react'

export default function App({ Component, pageProps }: AppProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return (
    <>
      <Component {...pageProps} />
      <BottomNav />
      {isClient && <Toaster position="top-center" reverseOrder={false} />}
    </>
  )
}
