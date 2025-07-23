import 'bootstrap/dist/css/bootstrap.min.css'
import '@/styles/globals.css'
import '@/lib/fontawesome'
import type { AppProps } from 'next/app'
import BottomNav from '@/components/BottomNav'
import { Toaster } from 'react-hot-toast'
import { useEffect, useState } from 'react'

export default function App({ Component, pageProps }: AppProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return (
    <>
      <div className="mt-5 pt-2"></div>
      <Component {...pageProps} />
      <BottomNav />
      {isClient && <Toaster position="top-center" reverseOrder={false} />}
    </>
  )
}
