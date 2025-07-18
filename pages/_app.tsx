import 'bootstrap/dist/css/bootstrap.min.css'
import type { AppProps } from 'next/app'
import BottomNav from '@/components/layout/BottomNav'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <BottomNav />
    </>
  )
}
