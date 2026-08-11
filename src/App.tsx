import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { BottomNavigation } from '@/components/layout/BottomNavigation'
import { ToastContainer } from '@/components/ui/Toast'
import { GlobalHeartAnimation } from '@/components/ui/GlobalHeartAnimation'
import { SplashScreen } from '@/components/ui/SplashScreen'
import { WhatsAppButton } from '@/components/ui/WhatsAppButton'
import { AnimatePresence } from 'framer-motion'

function App() {
  const { pathname } = useLocation()
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [pathname])

  return (
    <>
      <AnimatePresence>
        {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      </AnimatePresence>

      <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <GlobalHeartAnimation />
        <Header />
        <main style={{ flex: '1 0 auto' }}>
          <Outlet />
        </main>
        <Footer />
        <BottomNavigation />
        <ToastContainer />
        {!showSplash && <WhatsAppButton />}
      </div>
    </>
  )
}

export default App
