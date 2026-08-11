import { Outlet } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { BottomNavigation } from '@/components/layout/BottomNavigation'
import { ToastContainer } from '@/components/ui/Toast'
import { GlobalHeartAnimation } from '@/components/ui/GlobalHeartAnimation'

function App() {
  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <GlobalHeartAnimation />
      <Header />
      <main style={{ flex: '1 0 auto' }}>
        <Outlet />
      </main>
      <Footer />
      <BottomNavigation />
      <ToastContainer />
    </div>
  )
}

export default App
