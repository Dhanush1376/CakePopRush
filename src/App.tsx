import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { BottomNavigation } from '@/components/layout/BottomNavigation'
import { ToastContainer } from '@/components/ui/Toast'
import { GlobalHeartAnimation } from '@/components/ui/GlobalHeartAnimation'
import { SplashScreen } from '@/components/ui/SplashScreen'
import { WhatsAppButton } from '@/components/ui/WhatsAppButton'
import { ScrollToTopButton } from '@/components/ui/ScrollToTopButton'
import { AnimatePresence } from 'framer-motion'
import { MascotOrchestrationProvider } from '@/components/mascot/orchestration/MascotOrchestrationProvider'

function App() {
  const { pathname } = useLocation()
  const [showSplash, setShowSplash] = useState(true)
  const [isWhatsAppVisible, setIsWhatsAppVisible] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
    document.body.style.overflow = ''
  }, [pathname])

  const handleSplashComplete = () => {
    setShowSplash(false)
  }


  const hideFooterRoutes = ['/profile', '/orders', '/cart', '/checkout', '/payment', '/wishlist', '/tracking']
  const shouldHideFooter = hideFooterRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`))

  const hideHeaderRoutes = ['/tracking']
  const shouldHideHeader = hideHeaderRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`)) || /^\/orders\/[^/]+$/.test(pathname)

  return (
    <>
      <AnimatePresence>
        {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      </AnimatePresence>

      <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', overflowX: 'clip' }}>
        <MascotOrchestrationProvider>
          <a href="#main-content" className="skip-link">Skip to main content</a>
          <GlobalHeartAnimation />
          {!shouldHideHeader && <Header />}
          <main id="main-content" style={{ flex: '1 0 auto', outline: 'none' }} tabIndex={-1}>
            <Outlet />
          </main>
          {!shouldHideFooter && <Footer />}
          <BottomNavigation />
          <ToastContainer />
          {!showSplash && (
            <>
              {isWhatsAppVisible && <WhatsAppButton onClose={() => setIsWhatsAppVisible(false)} />}
              <ScrollToTopButton isWhatsAppVisible={isWhatsAppVisible} />
            </>
          )}
        </MascotOrchestrationProvider>
      </div>
    </>
  )
}

export default App
